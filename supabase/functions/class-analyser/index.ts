// AI proxy for the Class Progress Analyser (GitHub Pages frontend).
// Keeps provider keys server-side; gates usage with APP_PASSWORD.
//
// Quota diversification: requests walk a provider pool until one succeeds.
//   1. Every Gemini key x gemini-2.5-flash
//   2. Every Gemini key x gemini-2.5-flash-lite (separate per-model quota bucket)
//   3. Mistral small (independent free tier)
// Add more Gemini keys any time via:
//   npx supabase secrets set CLASS_ANALYSER_GEMINI_KEYS=key1,key2 --project-ref <ref>

const APP_PASSWORD = Deno.env.get("CLASS_ANALYSER_PASSWORD") || "";
const MASTER_PASSWORD = Deno.env.get("MASTER_PASSWORD") || "";
const GEMINI_KEYS = [
  ...(Deno.env.get("CLASS_ANALYSER_GEMINI_KEYS") || "").split(",").map((k) => k.trim()).filter(Boolean),
  Deno.env.get("GEMINI_API_KEY") || "",
].filter(Boolean);
const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY") || "";
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface Objective {
  domain: string;
  objective: string;
  notYet: number;
  emerging: number;
  achieved: number;
}

type StrategyRow = { index: number; strategies: string[] };
type ProviderResult = { rows: StrategyRow[] } | { error: string; quota?: boolean };

function extractRows(value: unknown): StrategyRow[] | null {
  // Accept a bare array, or an object wrapping one (Mistral JSON mode often wraps).
  let arr: unknown = value;
  if (arr && !Array.isArray(arr) && typeof arr === "object") {
    arr = Object.values(arr).find((v) => Array.isArray(v));
  }
  if (!Array.isArray(arr)) return null;
  const rows: StrategyRow[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const { index, strategies } = item as Record<string, unknown>;
    if (typeof index !== "number" || !Array.isArray(strategies)) continue;
    rows.push({ index, strategies: strategies.filter((s): s is string => typeof s === "string") });
  }
  return rows.length > 0 ? rows : null;
}

async function callGemini(
  key: string,
  model: string,
  prompt: string,
  signal: AbortSignal,
): Promise<ProviderResult> {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            index: { type: "INTEGER" },
            strategies: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["index", "strategies"],
        },
      },
    },
  };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: data?.error?.message || `Gemini ${model} HTTP ${res.status}`,
        quota: res.status === 429 || res.status === 503,
      };
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { error: `Gemini ${model}: empty response` };
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { error: `Gemini ${model}: unparseable output` };
    }
    const rows = extractRows(parsed);
    if (!rows) return { error: `Gemini ${model}: malformed output` };
    return { rows };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { error: `Gemini ${model}: ${e instanceof Error ? e.message : e}` };
  }
}

async function callMistral(prompt: string, signal: AbortSignal): Promise<ProviderResult> {
  const body = {
    model: "mistral-small-latest",
    temperature: 0.4,
    max_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert early-childhood educator. Reply ONLY with JSON of the form " +
          '{"results":[{"index":1,"strategies":["...","...","..."]}, ...]} with exactly 3 strategies per objective.',
      },
      { role: "user", content: prompt },
    ],
  };
  try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${MISTRAL_API_KEY}` },
      body: JSON.stringify(body),
      signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: data?.message || `Mistral HTTP ${res.status}`,
        quota: res.status === 429,
      };
    }
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return { error: "Mistral: empty response" };
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { error: "Mistral: unparseable output" };
    }
    const rows = extractRows(parsed);
    if (!rows) return { error: "Mistral: malformed output" };
    return { rows };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { error: `Mistral: ${e instanceof Error ? e.message : e}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: {
    password?: string;
    objectives?: Objective[];
    context?: string;
    skipProviders?: number;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const isMaster = !!MASTER_PASSWORD && body.password === MASTER_PASSWORD;
  const isScoped = !!APP_PASSWORD && body.password === APP_PASSWORD;
  if (!isMaster && !isScoped) {
    return json({ error: "Incorrect password" }, 401);
  }
  const scope = isMaster ? "all" : "single";

  const objectives = (body.objectives || []).slice(0, 15);
  if (objectives.length === 0) {
    return json({ error: "No objectives provided", scope }, 400);
  }
  for (const o of objectives) {
    if (typeof o.objective !== "string" || o.objective.length > 500) {
      return json({ error: "Malformed objective" }, 400);
    }
  }

  const listText = objectives
    .map(
      (o, i) =>
        `${i + 1}. Objective: ${o.objective}\n   Domain: ${o.domain}\n   Students: Not Yet ${o.notYet}, Emerging ${o.emerging}, Achieved ${o.achieved}`,
    )
    .join("\n");

  const prompt =
    `You are an expert early-childhood educator in Singapore (NEL framework, preschool centres). ` +
    `A class progress report ranked these learning objectives as needing the most attention` +
    (body.context ? ` (class context: ${String(body.context).slice(0, 200)})` : "") +
    `. Objectives may be bilingual English/Chinese; respond in English only.\n\n${listText}\n\n` +
    `For EACH numbered objective, give exactly 3 concrete, actionable classroom strategies a teacher ` +
    `can run with the whole class or small groups. Be specific (activities, materials, routines), ` +
    `not generic advice. Return every objective in the same order, using index 1..${objectives.length}. ` +
    `Respond as JSON.`;

  // Build the attempt pool: model-major so all keys are tried on the primary
  // model before degrading, then Mistral as the independent fallback.
  const attempts: Array<{ label: string; run: (signal: AbortSignal) => Promise<ProviderResult> }> = [];
  for (const model of GEMINI_MODELS) {
    GEMINI_KEYS.forEach((key, k) => {
      attempts.push({
        label: `${model}${GEMINI_KEYS.length > 1 ? ` (key ${k + 1})` : ""}`,
        run: (signal) => callGemini(key, model, prompt, signal),
      });
    });
  }
  if (MISTRAL_API_KEY) {
    attempts.push({ label: "mistral-small", run: (signal) => callMistral(prompt, signal) });
  }
  // Test hook: skip the first N providers to exercise fallbacks end-to-end.
  const skip = Number(body.skipProviders) || 0;
  const pool = attempts.slice(Math.min(skip, attempts.length - 1));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 140_000);
  const failures: string[] = [];
  try {
    for (const attempt of pool) {
      const result = await attempt.run(controller.signal);
      if ("rows" in result) {
        const strategies = objectives.map((_, i) => {
          const hit = result.rows.find((p) => p.index === i + 1);
          return (hit?.strategies || []).slice(0, 3);
        });
        return json({ strategies, model: attempt.label, fallbacksUsed: failures, scope });
      }
      failures.push(`${attempt.label}: ${result.error}`);
      // Non-quota transient failure: one quick retry of the same provider.
      if (!result.quota) {
        await new Promise((r) => setTimeout(r, 1500));
        const retry = await attempt.run(controller.signal);
        if ("rows" in retry) {
          const strategies = objectives.map((_, i) => {
            const hit = retry.rows.find((p) => p.index === i + 1);
            return (hit?.strategies || []).slice(0, 3);
          });
          return json({ strategies, model: attempt.label, fallbacksUsed: failures, scope });
        }
        failures.push(`${attempt.label} (retry): ${retry.error}`);
      }
    }
    return json(
      { error: `All AI providers are busy right now. Please try again in a minute. (${failures.join(" | ")})` },
      502,
    );
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === "AbortError";
    return json({ error: aborted ? "Request timed out" : `Upstream error: ${e}` }, 504);
  } finally {
    clearTimeout(timer);
  }
});

// AI proxy for the Curriculum Audit Analyser (GitHub Pages /audit/ subpage).
// Same provider-pool pattern as supabase/functions/class-analyser: walks
// gemini-2.5-flash -> gemini-2.5-flash-lite -> mistral-small until one succeeds.

const MASTER_PASSWORD = Deno.env.get("MASTER_PASSWORD") || "";
const GEMINI_KEYS = [
  ...(Deno.env.get("CLASS_ANALYSER_GEMINI_KEYS") || "").split(",").map((k) => k.trim()).filter(Boolean),
  Deno.env.get("GEMINI_API_KEY") || "",
].filter(Boolean);
const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY") || "";
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface ScoredItem {
  no: string;
  title: string;
  criteria: string[];
  score: number;
}

interface Dimension {
  label: string;
  items: ScoredItem[];
  maxHighlight: number;
}

type ProviderResult = { lines: string[] } | { error: string; quota?: boolean };

function extractLines(value: unknown): string[] | null {
  let arr: unknown = value;
  if (arr && !Array.isArray(arr) && typeof arr === "object") {
    arr = Object.values(arr).find((v) => Array.isArray(v));
  }
  if (!Array.isArray(arr)) return null;
  const lines = arr.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  return lines.length > 0 ? lines : null;
}

function buildPrompt(dim: Dimension): string {
  const itemsText = dim.items
    .map((it) => `${it.no} ${it.title} - scored ${it.score}/6. Criteria: ${it.criteria.join(" | ")}`)
    .join("\n");
  return (
    `You are writing a curriculum audit report for a preschool Centre Director who is busy and not an ` +
    `education researcher. Dimension: "${dim.label}". Scoring tiers: 2 = the basics are in place, ` +
    `4 = happening centre-wide at the expected standard, 6 = high quality with clear results for children.` +
    `\n\nScored items:\n${itemsText}\n\n` +
    `Write exactly ${dim.maxHighlight} highlight lines (strengths and/or gaps) for the Director, in the style of ` +
    `a real curriculum audit report: natural, flowing prose, not a rigid template. ` +
    `Prioritise the lowest-scoring items as gaps and the highest-scoring as strengths. ` +
    `Each line is a short paragraph (2-4 sentences) describing what was observed for that item, in plain English ` +
    `(no jargon, no citing rubric codes or criteria word-for-word). Only add a recommendation where one is genuinely ` +
    `useful — introduce it naturally with a phrase like "Moving forward, ..." — and it is fine for a line to be ` +
    `purely observational with no recommendation at all, especially for clear strengths. Do not force a fixed number ` +
    `of suggestions per line. Do not start lines with a literal "Strength -" or "Gap -" label; let the content speak ` +
    `for itself. Tone: professional, respectful, and supportive, as one educator addressing another. Never sound ` +
    `condescending, sarcastic, judgmental, or preachy. Do not use rhetorical questions, exclamation marks, or ` +
    `lecturing phrases like "it's important to note" or "simply". State observations plainly and matter-of-factly. ` +
    `Respond as JSON array of strings.`
  );
}

async function callGemini(key: string, model: string, prompt: string, signal: AbortSignal): Promise<ProviderResult> {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
      responseSchema: { type: "ARRAY", items: { type: "STRING" } },
    },
  };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data?.error?.message || `Gemini ${model} HTTP ${res.status}`, quota: res.status === 429 || res.status === 503 };
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { error: `Gemini ${model}: empty response` };
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { error: `Gemini ${model}: unparseable output` };
    }
    const lines = extractLines(parsed);
    if (!lines) return { error: `Gemini ${model}: malformed output` };
    return { lines };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { error: `Gemini ${model}: ${e instanceof Error ? e.message : e}` };
  }
}

async function callMistral(prompt: string, signal: AbortSignal): Promise<ProviderResult> {
  const body = {
    model: "mistral-small-latest",
    temperature: 0.4,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert early-childhood curriculum auditor. Reply ONLY with JSON of the form " +
          '{"lines":["...", "...", ...]}.',
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
    if (!res.ok) return { error: data?.message || `Mistral HTTP ${res.status}`, quota: res.status === 429 };
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return { error: "Mistral: empty response" };
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { error: "Mistral: unparseable output" };
    }
    const lines = extractLines(parsed);
    if (!lines) return { error: "Mistral: malformed output" };
    return { lines };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { error: `Mistral: ${e instanceof Error ? e.message : e}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { password?: string; dimension?: Dimension; skipProviders?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!MASTER_PASSWORD || body.password !== MASTER_PASSWORD) {
    return json({ error: "Incorrect password" }, 401);
  }

  const dim = body.dimension;
  if (!dim || !Array.isArray(dim.items) || dim.items.length === 0) {
    return json({ error: "No dimension items provided", scope: "all" }, 400);
  }
  if (typeof dim.label !== "string" || dim.label.length > 200) {
    return json({ error: "Malformed dimension label" }, 400);
  }
  const maxHighlight = Math.min(Math.max(Number(dim.maxHighlight) || 3, 1), 10);
  const items = dim.items.slice(0, 20).map((it) => ({
    no: String(it.no ?? "").slice(0, 20),
    title: String(it.title ?? "").slice(0, 300),
    criteria: Array.isArray(it.criteria) ? it.criteria.slice(0, 5).map((c) => String(c).slice(0, 300)) : [],
    score: Number(it.score) || 0,
  }));

  const prompt = buildPrompt({ label: dim.label, items, maxHighlight });

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
  const skip = Number(body.skipProviders) || 0;
  const pool = attempts.slice(Math.min(skip, attempts.length - 1));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  const failures: string[] = [];
  try {
    for (const attempt of pool) {
      const result = await attempt.run(controller.signal);
      if ("lines" in result) {
        return json({ lines: result.lines.slice(0, maxHighlight), model: attempt.label, fallbacksUsed: failures, scope: "all" });
      }
      failures.push(`${attempt.label}: ${result.error}`);
      if (!result.quota) {
        await new Promise((r) => setTimeout(r, 1500));
        const retry = await attempt.run(controller.signal);
        if ("lines" in retry) {
          return json({ lines: retry.lines.slice(0, maxHighlight), model: attempt.label, fallbacksUsed: failures, scope: "all" });
        }
        failures.push(`${attempt.label} (retry): ${retry.error}`);
      }
    }
    return json({ error: `All AI providers are busy right now. Please try again in a minute. (${failures.join(" | ")})` }, 502);
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === "AbortError";
    return json({ error: aborted ? "Request timed out" : `Upstream error: ${e}` }, 504);
  } finally {
    clearTimeout(timer);
  }
});

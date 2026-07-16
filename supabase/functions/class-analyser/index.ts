// Gemini proxy for the Class Progress Analyser (GitHub Pages frontend).
// Keeps GEMINI_API_KEY server-side; gates usage with APP_PASSWORD.

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const APP_PASSWORD = Deno.env.get("CLASS_ANALYSER_PASSWORD") || "";
const MODEL = Deno.env.get("CLASS_ANALYSER_MODEL") || "gemini-2.5-flash";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { password?: string; objectives?: Objective[]; context?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!APP_PASSWORD || body.password !== APP_PASSWORD) {
    return json({ error: "Incorrect password" }, 401);
  }

  const objectives = (body.objectives || []).slice(0, 15);
  if (objectives.length === 0) {
    return json({ error: "No objectives provided" }, 400);
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
    `not generic advice. Return every objective in the same order, using index 1..${objectives.length}.`;

  const geminiBody = {
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 110_000);
  try {
    // Free-tier Gemini throws transient 429/500/503s; retry twice with backoff.
    let res!: Response, data: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
        signal: controller.signal,
      });
      data = await res.json().catch(() => ({}));
      if (res.ok || ![429, 500, 502, 503].includes(res.status) || attempt === 2) break;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
    if (!res.ok) {
      const msg = data?.error?.message || `Gemini HTTP ${res.status}`;
      return json({ error: msg }, 502);
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return json({ error: "Empty response from Gemini" }, 502);

    let parsed: Array<{ index: number; strategies: string[] }>;
    try {
      parsed = JSON.parse(text);
    } catch {
      return json({ error: "Gemini returned unparseable output" }, 502);
    }

    const strategies = objectives.map((_, i) => {
      const hit = parsed.find((p) => p.index === i + 1);
      return (hit?.strategies || []).filter((s) => typeof s === "string").slice(0, 3);
    });
    return json({ strategies, model: MODEL });
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === "AbortError";
    return json({ error: aborted ? "Gemini timed out" : `Upstream error: ${e}` }, 504);
  } finally {
    clearTimeout(timer);
  }
});

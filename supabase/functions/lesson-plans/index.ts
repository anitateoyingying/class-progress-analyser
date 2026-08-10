// AI proxy for the Lesson Plan Generator (GitHub Pages /lesson-plans/ subpage).
// Same provider-pool pattern as supabase/functions/class-analyser and
// curriculum-audit: walks gemini-2.5-flash -> gemini-2.5-flash-lite -> mistral-small.

const APP_PASSWORD = Deno.env.get("LESSON_PLANS_PASSWORD") || "";
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

interface LessonRequest {
  levelLabel: string;
  eyloPrefix: string;
  topic: string;
  envTopic?: string;
  festivalTopic?: string;
  language: "English" | "Chinese";
  count: number;
}

interface Lesson {
  topic: string;
  topicDefinition: string;
  topicConcept: string;
  duration: string;
  learningDomains: string[];
  dispositionName: string;
  dispositionDescription: string;
  objectives: string[];
  materials: string[];
  be: string[];
  do: string[];
  reflect: string[];
  act: string[];
}

type ProviderResult = { lessons: Lesson[] } | { error: string; quota?: boolean };

const LESSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    topic: { type: "STRING" },
    topicDefinition: { type: "STRING" },
    topicConcept: { type: "STRING" },
    duration: { type: "STRING" },
    learningDomains: { type: "ARRAY", items: { type: "STRING" } },
    dispositionName: { type: "STRING" },
    dispositionDescription: { type: "STRING" },
    objectives: { type: "ARRAY", items: { type: "STRING" } },
    materials: { type: "ARRAY", items: { type: "STRING" } },
    be: { type: "ARRAY", items: { type: "STRING" } },
    do: { type: "ARRAY", items: { type: "STRING" } },
    reflect: { type: "ARRAY", items: { type: "STRING" } },
    act: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "topic", "topicDefinition", "topicConcept", "duration", "learningDomains",
    "dispositionName", "dispositionDescription", "objectives", "materials",
    "be", "do", "reflect", "act",
  ],
};

function isLesson(v: unknown): v is Lesson {
  if (!v || typeof v !== "object") return false;
  const l = v as Record<string, unknown>;
  return typeof l.topic === "string" && Array.isArray(l.objectives) && Array.isArray(l.be);
}

function extractLessons(value: unknown): Lesson[] | null {
  let arr: unknown = value;
  if (arr && !Array.isArray(arr) && typeof arr === "object") {
    arr = Object.values(arr).find((v) => Array.isArray(v));
  }
  if (!Array.isArray(arr)) return null;
  const lessons = arr.filter(isLesson);
  return lessons.length > 0 ? lessons : null;
}

function themedLessonInstructions(req: LessonRequest): string {
  const themes = [
    req.envTopic && `the environment/sustainability theme "${req.envTopic}"`,
    req.festivalTopic && `the festival or special-event theme "${req.festivalTopic}"`,
  ].filter(Boolean) as string[];
  if (!themes.length) return "";
  // Assign later lessons to themes (lesson 1 stays on the main topic when there's room) so the
  // batch still reads as one coherent, progressive unit rather than opening on a tangent.
  const startSlot = req.count > themes.length ? 2 : 1;
  return " " + themes
    .map((theme, i) => {
      const slot = Math.min(startSlot + i, req.count);
      return `Lesson ${slot} must be built around ${theme}, while still fitting the overall unit and using the same level and language.`;
    })
    .join(" ");
}

function buildPrompt(req: LessonRequest): string {
  const langInstruction = req.language === "Chinese"
    ? `Write ALL text content (topic, definitions, objectives, dialogue, etc.) in Simplified Chinese. ` +
      `Keep learning outcome codes in the original English/alphanumeric format (e.g. "${req.eyloPrefix}.SED.3.1").`
    : `Write all text content in English.`;

  return (
    `You are an expert early-childhood curriculum writer creating lesson plans for a Singapore preschool, ` +
    `following the NEL (Nurturing Early Learners) framework. ` +
    `Level: ${req.levelLabel}. Core value / topic focus: "${req.topic}". ${langInstruction}\n\n` +
    `Generate exactly ${req.count} distinct, sequential lesson plans on this topic for this level, each with ` +
    `a different activity angle so they build on each other across a term.${themedLessonInstructions(req)} ` +
    `Every lesson must include:\n` +
    `- topic: a short activity title\n` +
    `- topicDefinition: one sentence, child-friendly framing of the topic\n` +
    `- topicConcept: 2-3 sentences explaining the concept simply for young children\n` +
    `- duration: e.g. "30 minutes"\n` +
    `- learningDomains: 1-3 domain names (e.g. "Social and Emotional Development (SED)", "Physical Development (PD)", ` +
    `"Language and Literacy (LL)")\n` +
    `- dispositionName: one P.R.A.I.S.E. disposition (Perseverance, Reflectiveness, Appreciation, Inventiveness, ` +
    `Sense of Wonder & Curiosity, Enthusiasm) relevant to this lesson\n` +
    `- dispositionDescription: one sentence describing what that disposition looks like in this lesson\n` +
    `- objectives: 2 lesson objectives, each ending with a learning outcome code like "(${req.eyloPrefix}.SED.3.1)" ` +
    `using a plausible domain abbreviation and numbering\n` +
    `- materials: 2-5 simple, realistic classroom materials\n` +
    `- be: 2-4 short lines for the lesson's introduction/hook (5-10 minutes), written as an activity description ` +
    `followed by facilitation dialogue lines a teacher would say\n` +
    `- do: 3-6 short lines for the main activity (15-25 minutes), including instructions, action cues, and how to ` +
    `support a hesitant or struggling child\n` +
    `- reflect: 2-4 short lines for wrapping up (5-10 minutes), including a question to ask children and an affirmation\n` +
    `- act: 1-2 short lines suggesting how to extend the concept into daily routines or a home link\n\n` +
    `Each array item should be a single short paragraph (like real lesson-plan notes), specific to this activity, ` +
    `never generic filler. Respond as a JSON array of ${req.count} lesson objects.`
  );
}

async function callGemini(key: string, model: string, prompt: string, count: number, signal: AbortSignal): Promise<ProviderResult> {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: { type: "ARRAY", items: LESSON_SCHEMA },
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
    const lessons = extractLessons(parsed);
    if (!lessons) return { error: `Gemini ${model}: malformed output` };
    return { lessons: lessons.slice(0, count) };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { error: `Gemini ${model}: ${e instanceof Error ? e.message : e}` };
  }
}

async function callMistral(prompt: string, count: number, signal: AbortSignal): Promise<ProviderResult> {
  const body = {
    model: "mistral-small-latest",
    temperature: 0.6,
    max_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert early-childhood curriculum writer. Reply ONLY with JSON of the form " +
          '{"lessons":[{...lesson object...}, ...]}.',
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
    const lessons = extractLessons(parsed);
    if (!lessons) return { error: "Mistral: malformed output" };
    return { lessons: lessons.slice(0, count) };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { error: `Mistral: ${e instanceof Error ? e.message : e}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { password?: string; request?: LessonRequest; skipProviders?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!APP_PASSWORD || body.password !== APP_PASSWORD) {
    return json({ error: "Incorrect password" }, 401);
  }

  const r = body.request;
  if (!r || typeof r.topic !== "string" || r.topic.trim().length === 0) {
    return json({ error: "No lesson request provided" }, 400);
  }
  if (typeof r.levelLabel !== "string" || r.levelLabel.length > 100) {
    return json({ error: "Malformed level label" }, 400);
  }
  if (r.language !== "English" && r.language !== "Chinese") {
    return json({ error: "Malformed language" }, 400);
  }
  const count = Math.min(Math.max(Number(r.count) || 4, 1), 6);
  const request: LessonRequest = {
    levelLabel: r.levelLabel.slice(0, 100),
    eyloPrefix: String(r.eyloPrefix || "EY").slice(0, 20),
    topic: r.topic.trim().slice(0, 200),
    envTopic: typeof r.envTopic === "string" && r.envTopic.trim() ? r.envTopic.trim().slice(0, 200) : undefined,
    festivalTopic: typeof r.festivalTopic === "string" && r.festivalTopic.trim() ? r.festivalTopic.trim().slice(0, 200) : undefined,
    language: r.language,
    count,
  };

  const prompt = buildPrompt(request);

  const attempts: Array<{ label: string; run: (signal: AbortSignal) => Promise<ProviderResult> }> = [];
  for (const model of GEMINI_MODELS) {
    GEMINI_KEYS.forEach((key, k) => {
      attempts.push({
        label: `${model}${GEMINI_KEYS.length > 1 ? ` (key ${k + 1})` : ""}`,
        run: (signal) => callGemini(key, model, prompt, count, signal),
      });
    });
  }
  if (MISTRAL_API_KEY) {
    attempts.push({ label: "mistral-small", run: (signal) => callMistral(prompt, count, signal) });
  }
  const skip = Number(body.skipProviders) || 0;
  const pool = attempts.slice(Math.min(skip, attempts.length - 1));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  const failures: string[] = [];
  try {
    for (const attempt of pool) {
      const result = await attempt.run(controller.signal);
      if ("lessons" in result) {
        return json({ lessons: result.lessons, model: attempt.label, fallbacksUsed: failures });
      }
      failures.push(`${attempt.label}: ${result.error}`);
      if (!result.quota) {
        await new Promise((r) => setTimeout(r, 1500));
        const retry = await attempt.run(controller.signal);
        if ("lessons" in retry) {
          return json({ lessons: retry.lessons, model: attempt.label, fallbacksUsed: failures });
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

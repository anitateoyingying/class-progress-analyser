// AI proxy for the Lesson Plan Generator (GitHub Pages /lesson-plans/ subpage).
// Same provider-pool pattern as supabase/functions/class-analyser and
// curriculum-audit: walks gemini-2.5-flash -> gemini-2.5-flash-lite -> mistral-small.

import { LEARNING_OUTCOMES, type LearningOutcome } from "./learning-outcomes.ts";
import { IBRAIN_TERM1 } from "./ibrain-term1.ts";
import {
  buildIbrainPrompt, finalizeIbrainLesson, IBRAIN_MISTRAL_SHAPE, ibrainSchema, isRawIbrainLesson, mergeEditedPlan,
  type IbrainRequest, type RawIbrainLesson,
} from "./ibrain.ts";

const MASTER_PASSWORD = Deno.env.get("MASTER_PASSWORD") || "";
const GEMINI_KEYS = [
  ...(Deno.env.get("CLASS_ANALYSER_GEMINI_KEYS") || "").split(",").map((k) => k.trim()).filter(Boolean),
  Deno.env.get("GEMINI_API_KEY") || "",
].filter(Boolean);
const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY") || "";
// Each model has its own free daily quota, so more models = more free capacity.
// Order: strongest free models first, lighter ones as overflow (probed 2026-10-11 on the free tier).
const GEMINI_MODELS = [
  "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-3-flash-preview", "gemini-3.7-flash",
  "gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite", "gemini-flash-lite-latest",
];
// Gemma runs on the same key with a far larger free allowance but has no JSON mode: prompt for JSON, parse the text.
const GEMMA_MODELS = ["gemma-4-26b-a4b-it"];

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

const LEVEL_KEYS = ["pg", "pn", "nursery", "k1", "k2"] as const;
type LevelKey = (typeof LEVEL_KEYS)[number];

interface LessonRequest {
  levelLabel: string;
  levelKey: LevelKey;
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
  objectiveCodes: string[];
  objectiveApplications: string[];
  objectives: string[];
  materials: string[];
  be: string[];
  do: string[];
  reflect: string[];
  act: string[];
}

type RawLesson = Omit<Lesson, "objectives">;

type ProviderResult<T> = { value: T } | { error: string; quota?: boolean };
type Attempt<T> = { label: string; run: (signal: AbortSignal) => Promise<ProviderResult<T>> };

function buildLessonSchema(validCodes: string[]) {
  return {
    type: "OBJECT",
    properties: {
      topic: { type: "STRING" },
      topicDefinition: { type: "STRING" },
      topicConcept: { type: "STRING" },
      duration: { type: "STRING" },
      learningDomains: { type: "ARRAY", items: { type: "STRING" } },
      dispositionName: { type: "STRING" },
      dispositionDescription: { type: "STRING" },
      objectiveCodes: { type: "ARRAY", items: { type: "STRING", enum: validCodes }, minItems: 2, maxItems: 2 },
      objectiveApplications: { type: "ARRAY", items: { type: "STRING" }, minItems: 2, maxItems: 2 },
      materials: { type: "ARRAY", items: { type: "STRING" } },
      be: { type: "ARRAY", items: { type: "STRING" } },
      do: { type: "ARRAY", items: { type: "STRING" } },
      reflect: { type: "ARRAY", items: { type: "STRING" } },
      act: { type: "ARRAY", items: { type: "STRING" } },
    },
    required: [
      "topic", "topicDefinition", "topicConcept", "duration", "learningDomains",
      "dispositionName", "dispositionDescription", "objectiveCodes", "objectiveApplications", "materials",
      "be", "do", "reflect", "act",
    ],
  };
}

function isRawLesson(v: unknown): v is RawLesson {
  if (!v || typeof v !== "object") return false;
  const l = v as Record<string, unknown>;
  return typeof l.topic === "string" && Array.isArray(l.objectiveCodes) && Array.isArray(l.be);
}

const genericApplicationFallback = (o: LearningOutcome, language: "English" | "Chinese"): string =>
  language === "Chinese" ? o.zh : o.en;

function extractLessons(value: unknown): RawLesson[] | null {
  let arr: unknown = value;
  if (arr && !Array.isArray(arr) && typeof arr === "object") {
    arr = Object.values(arr).find((v) => Array.isArray(v));
  }
  if (!Array.isArray(arr)) return null;
  const lessons = arr.filter(isRawLesson);
  return lessons.length > 0 ? lessons : null;
}

// Never trust codes (or their tailored write-ups) the AI emits at face value -- keep only
// codes that exist in the authoritative registry, pairing each with the AI's lesson-specific
// application text where it supplied one, and deterministically backfill anything missing/invalid
// (falling back to the registry's own wording) so every lesson always ends up with exactly 2
// real outcomes.
function resolveObjectives(lesson: RawLesson, catalogue: LearningOutcome[], language: "English" | "Chinese"): Lesson {
  const byCode = new Map(catalogue.map((o) => [o.code, o]));
  const seen = new Set<string>();
  const resolved: { outcome: LearningOutcome; application: string }[] = [];
  const rawCodes = lesson.objectiveCodes || [];
  const rawApplications = lesson.objectiveApplications || [];
  rawCodes.forEach((code, i) => {
    const outcome = byCode.get(code);
    if (!outcome || seen.has(outcome.code)) return;
    const application = typeof rawApplications[i] === "string" && rawApplications[i].trim()
      ? rawApplications[i].trim()
      : genericApplicationFallback(outcome, language);
    resolved.push({ outcome, application });
    seen.add(outcome.code);
  });
  let fallbackIdx = 0;
  while (resolved.length < 2 && fallbackIdx < catalogue.length) {
    const candidate = catalogue[fallbackIdx++];
    if (!seen.has(candidate.code)) {
      resolved.push({ outcome: candidate, application: genericApplicationFallback(candidate, language) });
      seen.add(candidate.code);
    }
  }
  const objectives = resolved.map((r) => `${r.application} (${r.outcome.code})`);
  return { ...lesson, objectiveCodes: resolved.map((r) => r.outcome.code), objectives };
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

function buildPrompt(req: LessonRequest, catalogue: LearningOutcome[]): string {
  const langInstruction = req.language === "Chinese"
    ? `Write ALL text content (topic, definitions, objectives, dialogue, etc.) in Simplified Chinese.`
    : `Write all text content in English.`;

  const catalogueText = catalogue
    .map((o) => `${o.code}: ${o.en}`)
    .join("\n");

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
    `- objectiveCodes: pick exactly 2 codes from the official learning outcome list below that this lesson ` +
    `actually addresses. Only use codes from this list, copied exactly as written -- never invent or modify a ` +
    `code:\n${catalogueText}\n\n` +
    `- objectiveApplications: exactly 2 entries, in the same order as objectiveCodes. For each code, write ONE ` +
    `sentence describing how THIS specific activity puts that outcome into practice -- reference the actual ` +
    `materials or steps of this lesson. Do not copy or paraphrase the official outcome wording from the list above; ` +
    `that wording is shown only so you pick the right code, never repeat it back\n` +
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

interface GeminiOpts { schema: unknown; maxTokens: number; thinkingBudget?: number; plain?: boolean }

function extractJson(text: string): unknown {
  const t = text.replace(/```(?:json)?/g, "");
  const start = t.search(/[[{]/);
  const end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  return JSON.parse(start >= 0 && end > start ? t.slice(start, end + 1) : t);
}

async function callGemini<T>(
  key: string, model: string, prompt: string, opts: GeminiOpts, parse: (v: unknown) => T | null, signal: AbortSignal,
): Promise<ProviderResult<T>> {
  const generationConfig: Record<string, unknown> = opts.plain
    ? { temperature: 0.6, maxOutputTokens: Math.min(opts.maxTokens, 8192) }
    : { temperature: 0.6, maxOutputTokens: opts.maxTokens, responseMimeType: "application/json", responseSchema: opts.schema };
  if (opts.thinkingBudget != null && model.startsWith("gemini-2.5")) generationConfig.thinkingConfig = { thinkingBudget: opts.thinkingBudget };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig }),
        signal,
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data?.error?.message || `Gemini ${model} HTTP ${res.status}`, quota: res.status === 429 || res.status === 503 };
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { error: `Gemini ${model}: empty response` };
    let parsed: unknown;
    try {
      parsed = opts.plain ? extractJson(text) : JSON.parse(text);
    } catch {
      return { error: `Gemini ${model}: unparseable output` };
    }
    const value = parse(parsed);
    return value ? { value } : { error: `Gemini ${model}: malformed output` };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { error: `Gemini ${model}: ${e instanceof Error ? e.message : e}` };
  }
}

async function callMistral<T>(
  prompt: string, system: string, maxTokens: number, parse: (v: unknown) => T | null, signal: AbortSignal,
): Promise<ProviderResult<T>> {
  const body = {
    model: "mistral-small-latest",
    temperature: 0.6,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
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
    const value = parse(parsed);
    return value ? { value } : { error: "Mistral: malformed output" };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { error: `Mistral: ${e instanceof Error ? e.message : e}` };
  }
}

function buildAttempts<T>(
  prompt: string, gemini: GeminiOpts, mistral: { prompt: string; system: string }, parse: (v: unknown) => T | null,
): Attempt<T>[] {
  const attempts: Attempt<T>[] = [];
  for (const model of GEMINI_MODELS) {
    GEMINI_KEYS.forEach((key, k) => {
      attempts.push({
        label: `${model}${GEMINI_KEYS.length > 1 ? ` (key ${k + 1})` : ""}`,
        run: (signal) => callGemini(key, model, prompt, gemini, parse, signal),
      });
    });
  }
  for (const model of GEMMA_MODELS) {
    GEMINI_KEYS.forEach((key, k) => {
      attempts.push({
        label: `${model}${GEMINI_KEYS.length > 1 ? ` (key ${k + 1})` : ""}`,
        run: (signal) => callGemini(key, model, `${mistral.system}\n\n${mistral.prompt}`, { ...gemini, plain: true }, parse, signal),
      });
    });
  }
  if (MISTRAL_API_KEY) {
    attempts.push({ label: "mistral-small", run: (signal) => callMistral(mistral.prompt, mistral.system, gemini.maxTokens, parse, signal) });
  }
  return attempts;
}

// Walks the provider pool (retrying non-quota failures once) and maps the first success to a response.
async function runPool<T>(attempts: Attempt<T>[], skip: number, timeoutMs: number, respond: (v: T, label: string, failures: string[]) => Response): Promise<Response> {
  const pool = attempts.slice(Math.min(skip, attempts.length - 1));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const failures: string[] = [];
  try {
    for (const attempt of pool) {
      const result = await attempt.run(controller.signal);
      if ("value" in result) return respond(result.value, attempt.label, failures);
      failures.push(`${attempt.label}: ${result.error}`);
      if (!result.quota) {
        await new Promise((r) => setTimeout(r, 1500));
        const retry = await attempt.run(controller.signal);
        if ("value" in retry) return respond(retry.value, attempt.label, failures);
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
}

function handleIbrain(r: Record<string, unknown>, skip: number): Promise<Response> | Response {
  const levelKey = r.levelKey;
  if (levelKey !== "pg" && levelKey !== "pn") return json({ error: "Malformed level key" }, 400);
  const base = IBRAIN_TERM1[levelKey];
  if (r.action === "term") return json({ term: base, scope: "all" });

  const week = Number(r.week), session = Number(r.session);
  if (!Number.isInteger(week) || week < 1 || week > base.weeks.length) return json({ error: "Malformed week" }, 400);
  if (!Number.isInteger(session) || session < 1 || session > 3) return json({ error: "Malformed session" }, 400);
  const request: IbrainRequest = { levelKey, week, session };

  const catalogue = LEARNING_OUTCOMES[levelKey];
  const plan = mergeEditedPlan(base, r.plan, catalogue);
  const prompt = buildIbrainPrompt(plan, request, catalogue);
  // Finalize inside parse so a structurally broken lesson counts as a provider failure and gets retried.
  const parse = (v: unknown) => {
    const raw = v && typeof v === "object" && !Array.isArray(v) && !isRawIbrainLesson(v)
      ? Object.values(v as Record<string, unknown>).find(isRawIbrainLesson)
      : Array.isArray(v) ? v.find(isRawIbrainLesson) : v;
    if (!isRawIbrainLesson(raw)) return null;
    try {
      return finalizeIbrainLesson(raw as RawIbrainLesson, plan, request, catalogue);
    } catch {
      return null;
    }
  };
  const attempts = buildAttempts(
    prompt,
    { schema: ibrainSchema(catalogue.map((o) => o.code), session), maxTokens: 16384, thinkingBudget: 1024 },
    { prompt: `${prompt}\n\n${IBRAIN_MISTRAL_SHAPE}`, system: "You are an expert early-childhood curriculum writer. Reply ONLY with JSON." },
    parse,
  );
  return runPool(attempts, skip, 135_000, (lesson, label, failures) =>
    json({ lesson, model: label, fallbacksUsed: failures, scope: "all" }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { password?: string; request?: LessonRequest & { mode?: string }; skipProviders?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!MASTER_PASSWORD || body.password !== MASTER_PASSWORD) {
    return json({ error: "Incorrect password" }, 401);
  }

  const skip = Number(body.skipProviders) || 0;
  const r = body.request;
  if (r && typeof r === "object" && r.mode === "ibrain") {
    return handleIbrain(r as unknown as Record<string, unknown>, skip);
  }
  if (!r || typeof r.topic !== "string" || r.topic.trim().length === 0) {
    return json({ error: "No lesson request provided", scope: "all" }, 400);
  }
  if (typeof r.levelLabel !== "string" || r.levelLabel.length > 100) {
    return json({ error: "Malformed level label" }, 400);
  }
  if (r.language !== "English" && r.language !== "Chinese") {
    return json({ error: "Malformed language" }, 400);
  }
  if (!LEVEL_KEYS.includes(r.levelKey)) {
    return json({ error: "Malformed level key" }, 400);
  }
  const count = Math.min(Math.max(Number(r.count) || 4, 1), 6);
  const request: LessonRequest = {
    levelLabel: r.levelLabel.slice(0, 100),
    levelKey: r.levelKey,
    eyloPrefix: String(r.eyloPrefix || "EY").slice(0, 20),
    topic: r.topic.trim().slice(0, 200),
    envTopic: typeof r.envTopic === "string" && r.envTopic.trim() ? r.envTopic.trim().slice(0, 200) : undefined,
    festivalTopic: typeof r.festivalTopic === "string" && r.festivalTopic.trim() ? r.festivalTopic.trim().slice(0, 200) : undefined,
    language: r.language,
    count,
  };

  const catalogue = LEARNING_OUTCOMES[request.levelKey];
  const validCodes = catalogue.map((o) => o.code);
  const prompt = buildPrompt(request, catalogue);
  const parse = (v: unknown) => {
    const lessons = extractLessons(v);
    return lessons ? lessons.slice(0, count) : null;
  };
  const mistralPrompt = prompt +
    `\n\nRespond ONLY with JSON of the form {"lessons":[{...lesson object with an "objectiveCodes" array of exactly 2 codes copied verbatim from the list above, and an "objectiveApplications" array of exactly 2 tailored sentences (not copied from the official wording) in the same order...}, ...]}.`;
  const attempts = buildAttempts(
    prompt,
    { schema: { type: "ARRAY", items: buildLessonSchema(validCodes) }, maxTokens: 8192 },
    {
      prompt: mistralPrompt,
      system: 'You are an expert early-childhood curriculum writer. Reply ONLY with JSON of the form {"lessons":[{...lesson object...}, ...]}.',
    },
    parse,
  );
  return runPool(attempts, skip, 90_000, (lessons, label, failures) =>
    json({
      lessons: lessons.map((l) => resolveObjectives(l, catalogue, request.language)),
      model: label,
      fallbacksUsed: failures,
      scope: "all",
    }));
});

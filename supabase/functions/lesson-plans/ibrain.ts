// iBrain lesson generation: prompt, response schema and server-side normalisation.
// The AI elaborates ONE lesson (IB01/IB02/IB03 of a week) from the Term 1 scaffold; the
// server then enforces the template's step order + timings and the official outcome codes.

import type { LearningOutcome } from "./learning-outcomes.ts";
import { blockForWeek, type TermPlan, type TuffBlock, type WeekPlan } from "./ibrain-term1.ts";

export const DISPOSITIONS = [
  "Perseverance", "Reflectiveness", "Appreciation", "Inventiveness", "Sense of Wonder and Curiosity", "Engagement",
] as const;
export const EF_SKILLS = ["Working Memory", "Inhibitory Control", "Cognitive Flexibility"] as const;
const LINKS = [
  "Objective 1 (Communication & Language)", "Objective 2 (SEC)", "Objective 3 (Learning Domain)",
  "Disposition", ...EF_SKILLS,
] as const;

interface SessionSpec { id: string; type: string; typeName: string; steps: [string, number][] }
const SESSIONS: Record<number, SessionSpec> = {
  1: {
    id: "IB01", type: "A", typeName: "Lesson A: The Narrative & Connection to Story",
    steps: [["Tuning In", 5], ["Storytelling", 10], ["Role Play", 5], ["Cleaning Up", 3], ["Cooling Down", 2], ["Wrap Up", 5]],
  },
  2: {
    id: "IB02", type: "B", typeName: "Lesson B: The Sensory Construction - Art & Craft / Tuff Tray",
    steps: [["Tuning In", 3], ["Storytelling", 4], ["Art and Craft / Tuffy Play", 13], ["Cleaning Up", 3], ["Cooling Down", 2], ["Wrap Up", 5]],
  },
  3: {
    id: "IB03", type: "C", typeName: "Lesson C: The Sensory Construction - Art & Craft / Tuff Tray",
    steps: [["Tuning In", 3], ["Storytelling", 4], ["Art and Craft / Tuffy Play", 13], ["Cleaning Up", 3], ["Cooling Down", 2], ["Wrap Up", 5]],
  },
};

const DOMAIN_NAMES: Record<string, string> = {
  LL: "Language and Literacy (LL)",
  SED: "Social-Emotional Competencies (SEC)",
  ACE: "Aesthetics and Creative Expression (ACE)",
  NE: "Natural Environment (NE)",
  NUM: "Early Numeracy (NUM)",
  PD: "Physical Development (PD)",
};
const domainOf = (code: string): string => code.split(".")[2];
// SMART "measurable" check: an explicit count/criterion must appear in every AI-written objective.
export const MEASURABLE = /\b(\d+|one|two|three|four|five|at least|every|all)\b/i;

export interface IbrainRequest { levelKey: "pg" | "pn"; week: number; session: number }

interface RawStep { name: string; materials: string[]; process: string[]; intentional: { link: string; how: string }[] }
export interface RawIbrainLesson {
  lessonTitle: string;
  disposition: { name: string; description: string };
  efSkills: { skill: string; how: string }[];
  objectives: { code: string; text: string }[];
  steps: RawStep[];
  differentiation: { support: string; stretch: string };
  lookFors: string[];
  rehearseRetrieve: { teacherPrompt: string; extension: string };
}

export function ibrainSchema(validCodes: string[], session: number) {
  const str = { type: "STRING" };
  const strArr = { type: "ARRAY", items: str };
  return {
    type: "OBJECT",
    properties: {
      lessonTitle: str,
      disposition: {
        type: "OBJECT",
        properties: { name: { type: "STRING", enum: [...DISPOSITIONS] }, description: str },
        required: ["name", "description"],
      },
      efSkills: {
        type: "ARRAY", minItems: 1, maxItems: 3,
        items: { type: "OBJECT", properties: { skill: { type: "STRING", enum: [...EF_SKILLS] }, how: str }, required: ["skill", "how"] },
      },
      objectives: {
        type: "ARRAY", minItems: 3, maxItems: 3,
        items: { type: "OBJECT", properties: { code: { type: "STRING", enum: validCodes }, text: str }, required: ["code", "text"] },
      },
      steps: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", enum: SESSIONS[session].steps.map((s) => s[0]) },
            materials: strArr,
            process: strArr,
            intentional: {
              type: "ARRAY",
              items: { type: "OBJECT", properties: { link: { type: "STRING", enum: [...LINKS] }, how: str }, required: ["link", "how"] },
            },
          },
          required: ["name", "materials", "process", "intentional"],
        },
      },
      differentiation: { type: "OBJECT", properties: { support: str, stretch: str }, required: ["support", "stretch"] },
      lookFors: strArr,
      rehearseRetrieve: { type: "OBJECT", properties: { teacherPrompt: str, extension: str }, required: ["teacherPrompt", "extension"] },
    },
    required: ["lessonTitle", "disposition", "efSkills", "objectives", "steps", "differentiation", "lookFors", "rehearseRetrieve"],
  };
}

export function isRawIbrainLesson(v: unknown): v is RawIbrainLesson {
  if (!v || typeof v !== "object") return false;
  const l = v as Record<string, unknown>;
  return Array.isArray(l.steps) && Array.isArray(l.objectives) && typeof l.disposition === "object" && l.disposition !== null;
}

const groupRotation = (session: number): string | null =>
  session === 1 ? null : session === 2
    ? "18 children, 2 teachers, two concurrent groups of 9: Group A at the Tuff Tray with Teacher 1, Group B at Art & Craft with Teacher 2."
    : "18 children, 2 teachers, two concurrent groups of 9, SWAPPED from IB02: Group B at the Tuff Tray with Teacher 1, Group A at Art & Craft with Teacher 2, so every child experiences both this week.";

function sessionGuidance(plan: TermPlan, wk: WeekPlan, block: TuffBlock, session: number): string {
  const isAddOnWeek = wk.week === block.weeks[1];
  const tray =
    `Tuff tray block "${block.title}" (Weeks ${block.weeks[0]}-${block.weeks[1]}). Tray wondering: "${block.wondering}". ` +
    `Focus: ${block.focus} Set-up (used for both weeks): ${block.setup} ` +
    (isAddOnWeek
      ? `THIS IS WEEK 2 OF THE BLOCK: keep the same set-up and introduce the add-on. ${block.addOn} `
      : `This is week 1 of the block: base set-up only (the add-on comes next week: ${block.addOn}) `) +
    `Safety: ${block.safety} Block outcome codes: ${block.outcomes.join(", ")}.`;
  if (session === 1) {
    return `This is IB01 (Lesson A: The Narrative & Connection to Story). No art or tuff tray today. ` +
      `Storytelling (10 mins) delivers this week's story bite through bite-sized creative strategies, and Role Play (5 mins) is: ${wk.rolePlay} ` +
      `End Wrap Up with a teaser of the tuff tray coming in IB02 ("${block.wondering}").`;
  }
  return `This is ${SESSIONS[session].id}. ${groupRotation(session)} ` +
    `Tuning In (3 mins) and Storytelling (4 mins, using the A3 scene card "${wk.scene.title}" for picture talk - NOT a re-read) are whole class. ` +
    `"Art and Craft / Tuffy Play" (13 mins) runs BOTH groups at the same time: write the process lines for the Tuff Tray group AND for the Art & Craft group ` +
    `(prefix lines "Tuff Tray:" or "Art & Craft:"), including how each teacher positions children and manages turns. ` +
    `Art & Craft this week: "${wk.artCraft.title}" - ${wk.artCraft.description} ${tray} ` +
    (session === 3
      ? `IB03 must DEEPEN rather than repeat IB02: new tuning-in hook, a different scene-card question, harder/extended questioning at the tray, and children recalling what the other group discovered in IB02.`
      : `IB02 introduces the tray and the art activity; capture children's first discoveries to share in IB03.`);
}

export function buildIbrainPrompt(plan: TermPlan, req: IbrainRequest, catalogue: LearningOutcome[]): string {
  const wk = plan.weeks[req.week - 1];
  const block = blockForWeek(plan, req.week);
  const spec = SESSIONS[req.session];
  const ef = wk.ef[req.session - 1];
  const steps = spec.steps.map(([n, m]) => `${n} (${m} mins)`).join(" -> ");
  const levelCode = plan.level.toUpperCase();
  const cat = catalogue.map((o) => `${o.code}: ${o.en}`).join("\n");

  return (
    `You are an expert early childhood programme specialist in Singapore writing the AGAPE Little Uni iBrain curriculum ` +
    `(story-driven approach + Tuff Tray exploration, building inquiring minds towards Inquiry-Based Learning). Communication and ` +
    `Language is the primary driver; the whole 8-week term is anchored on ONE story so children move from listeners to active ` +
    `vocabulary users, system conceptualisers and collaborative problem-solvers. Lessons are short (30 mins), use spaced ` +
    `repetition, give processing time, reduce cognitive overload, follow children's interests and leave time for observation.\n\n` +
    `AGAPE iBrain teaching strategies: Tuning In = stimulate interest (story, songs & rhymes, picture talk). Storytelling = model ` +
    `expressive reading and language (puppetry, picture talk, dramatisation). Role Play = enact a role or action (maths, ` +
    `discovery, puppetry, songs). Art and Craft = fine-motor 2-D/3-D work linked to the focus. Cleaning Up = children clean and ` +
    `pack up (wipe, return items, wash hands/tools). Cooling Down = calm down (soothing music, close eyes and rest on own mat). ` +
    `Wrap Up = recall and reinforce (a story, song, rhyme, word/phrase or action).\n\n` +
    `CLASS: ${plan.levelLabel}, a Singapore classroom of 18 children with 2 teachers. Developmental profile:\n- ` +
    `${plan.developmental.join("\n- ")}\n\n` +
    `TERM ${plan.term}: Wondering "${plan.wondering}". Story: "${plan.story}" by ${plan.author}. ${plan.connection} ` +
    `Character values (CDP): ${plan.cdpValues.join(", ")}. Language exposure: ${plan.languageExposure}\n\n` +
    `WEEK ${wk.week} of 8 - "${wk.title}". Story bite this week (ONLY this part of the story): ${wk.storyBite} ` +
    `Key language: ${wk.keyLanguage.join(", ")}. Song/chant idea: ${wk.song} SEC value focus: ${wk.secValue} (suggested ${wk.secCode}). ` +
    `Suggested C&L code: ${wk.llCode}. Primary executive functioning skill for this lesson: ${ef}.\n\n` +
    `LESSON: ${spec.id}, ${spec.typeName}. Template steps in this exact order: ${steps}, followed by Rehearse and Retrieve.\n` +
    `${sessionGuidance(plan, wk, block, req.session)}\n\n` +
    `STORYTELLING RULES: never read the whole book again and again. Deliver only this week's bite in bite-size, meaningful ` +
    `engagement: picture talk on the A3 scene card, puppets, props, songs, sound words, movement, and scene discussion questions.\n\n` +
    `OBJECTIVES - exactly 3, in this order:\n` +
    `1. Communication & Language objective using an EY.${levelCode}.LL code.\n` +
    `2. SEC objective using an EY.${levelCode}.SED code that matches this week's value.\n` +
    `3. One learning-domain objective using an EY.${levelCode}.ACE, NE, NUM or PD code that matches the main activity.\n` +
    `Each "text" is ONE SMART sentence starting with an observable action verb ("Children will be able to" is implied) and ` +
    `MUST contain all four parts: [observable verb + what] + [a NUMBER criterion, e.g. "at least 2", "1 turn", "3 of 4"] + ` +
    `[this lesson's material/story context] + [when: "during Role Play", "at the Tuff Tray", "by the end of the lesson"]. ` +
    `It must be Appropriate for ${plan.levelLabel} and Relevant to the story. Examples of the required quality: ` +
    `"Name at least 2 ocean creatures using a 4-5 word phrase (e.g. 'I can see a crab') when the A3 scene card is shown during ` +
    `Storytelling." / "Wait for 1 turn with the shared scoop, using the 'my turn, your turn' visual cue, during Tuff Tray play." ` +
    `Never write vague objectives such as "engage in conversations" without a number. The SEC objective needs a number too ` +
    `(e.g. "Use 1 feeling word such as 'scared' to tell a teacher how they feel when entering the cave during Role Play."). ` +
    `Objectives without a number are rejected. Do not write the code inside the text. ` +
    `Pick codes ONLY from this official list:\n${cat}\n\n` +
    `ALSO PROVIDE:\n` +
    `- lessonTitle: a short child-friendly title for this lesson.\n` +
    `- disposition: one PRAISE disposition and one sentence on what it looks like in this lesson.\n` +
    `- efSkills: 1-3 executive functioning skills; ALWAYS include ${ef}. "how" = the concrete game/strategy that exercises it ` +
    `(e.g. freeze game for Inhibitory Control, recalling the sound-word sequence for Working Memory, switching sorting rule for Cognitive Flexibility).\n` +
    `- steps: one entry per template step, in order, using the exact step names. For each: materials (specific, realistic, ` +
    `safe for the age; empty list allowed for Cooling Down), process (4-8 lines for main steps, 2-4 for short steps) written as ` +
    `teacher actions plus quoted facilitation questions/dialogue, and intentional: 1-3 entries naming WHICH objective, the ` +
    `disposition or which EF skill this step deliberately builds and HOW. Across the lesson, every objective, the disposition and ` +
    `every EF skill listed must be intentionally planned in at least one step.\n` +
    `- differentiation: support (for a hesitant or younger child) and stretch (for a confident child).\n` +
    `- lookFors: exactly 3 observable success criteria, one per objective, in the same order, phrased so a teacher can tick them.\n` +
    `- rehearseRetrieve: teacherPrompt = how teachers revisit THIS week's story language/sound words during daily routines and ` +
    `transitions (quote what the teacher says); extension = a home or outdoor link using Singapore places/experiences where ` +
    `natural. Never suggest coins, beads, buttons, batteries or other choking hazards.\n` +
    `Write in clear British English, specific to this lesson, never generic filler.`
  );
}

const clean = (s: unknown): string => (typeof s === "string" ? s.trim() : "");
const cleanArr = (a: unknown): string[] => (Array.isArray(a) ? a.map(clean).filter(Boolean) : []);

export function finalizeIbrainLesson(raw: RawIbrainLesson, plan: TermPlan, req: IbrainRequest, catalogue: LearningOutcome[]) {
  const spec = SESSIONS[req.session];
  const wk = plan.weeks[req.week - 1];
  const block = blockForWeek(plan, req.week);
  const byCode = new Map(catalogue.map((o) => [o.code, o]));

  // Steps: enforce template names, order and minutes.
  const steps = spec.steps.map(([name, minutes], i) => {
    const s = raw.steps.find((x) => clean(x?.name).toLowerCase() === name.toLowerCase()) ?? raw.steps[i];
    if (!s) throw new Error(`missing step ${name}`);
    return {
      name,
      minutes,
      materials: cleanArr(s.materials),
      process: cleanArr(s.process),
      intentional: (Array.isArray(s.intentional) ? s.intentional : [])
        .filter((x) => (LINKS as readonly string[]).includes(x?.link) && clean(x?.how))
        .map((x) => ({ link: x.link, how: clean(x.how) })),
    };
  });

  // Objectives: one C&L (LL), one SEC (SED), one other domain; registry codes only.
  const valid = raw.objectives.filter((o) => byCode.has(o?.code));
  const pick = (test: (d: string) => boolean, fallback: string, label: string) => {
    const o = valid.find((x) => test(domainOf(x.code)));
    const code = o ? o.code : fallback;
    const text = clean(o?.text).replace(/\s*\((?:EY|PS)\.[^)]*\)\s*\.?$/, "") || byCode.get(code)?.en || "";
    if (o && !MEASURABLE.test(text)) throw new Error(`objective ${code} has no measurable criterion`);
    return { label, code, text: text.replace(/^children will be able to\s*/i, "").replace(/^./, (c) => c.toUpperCase()) };
  };
  const objectives = [
    pick((d) => d === "LL", wk.llCode, "Communication & Language"),
    pick((d) => d === "SED", wk.secCode, "Social-Emotional Competencies (SEC)"),
    pick((d) => d !== "LL" && d !== "SED", block.domainCode, "Learning Domain"),
  ];

  const efSeen = new Set<string>();
  const efSkills = (raw.efSkills || [])
    .filter((e) => (EF_SKILLS as readonly string[]).includes(e?.skill) && !efSeen.has(e.skill) && efSeen.add(e.skill))
    .map((e) => ({ skill: e.skill, how: clean(e.how) }));

  const disposition = (DISPOSITIONS as readonly string[]).includes(raw.disposition?.name)
    ? { name: raw.disposition.name, description: clean(raw.disposition.description) }
    : { name: "Engagement", description: clean(raw.disposition?.description) };

  return {
    id: spec.id,
    title: `${plan.shortLabel} Term ${plan.term} iBrain Lesson ${req.week} - ${spec.id}`,
    level: plan.level,
    week: req.week,
    session: req.session,
    lessonType: spec.type,
    lessonTypeName: spec.typeName,
    lessonTitle: clean(raw.lessonTitle) || wk.title,
    wondering: plan.wondering,
    trayWondering: req.session === 1 ? null : block.wondering,
    story: plan.story,
    duration: "30 mins",
    learningDomains: [...new Set(objectives.map((o) => DOMAIN_NAMES[domainOf(o.code)]).filter(Boolean))],
    disposition,
    efSkills,
    objectives,
    steps,
    groupRotation: groupRotation(req.session),
    trayStage: req.session === 1 ? null : req.week === block.weeks[1] ? "Week 2 of block: same set-up + add-on" : "Week 1 of block: base set-up",
    differentiation: { support: clean(raw.differentiation?.support), stretch: clean(raw.differentiation?.stretch) },
    lookFors: cleanArr(raw.lookFors).slice(0, 3),
    rehearseRetrieve: { teacherPrompt: clean(raw.rehearseRetrieve?.teacherPrompt), extension: clean(raw.rehearseRetrieve?.extension) },
  };
}

export const IBRAIN_MISTRAL_SHAPE =
  `Respond ONLY with one JSON object: {"lessonTitle":"","disposition":{"name":"","description":""},` +
  `"efSkills":[{"skill":"","how":""}],"objectives":[{"code":"","text":""},{"code":"","text":""},{"code":"","text":""}],` +
  `"steps":[{"name":"","materials":[""],"process":[""],"intentional":[{"link":"","how":""}]}],` +
  `"differentiation":{"support":"","stretch":""},"lookFors":["","",""],"rehearseRetrieve":{"teacherPrompt":"","extension":""}}. ` +
  `"link" must be one of: ${LINKS.join(" | ")}. "skill" must be one of: ${EF_SKILLS.join(" | ")}. ` +
  `disposition "name" must be one of: ${DISPOSITIONS.join(" | ")}.`;

// Teacher-edited term plans arrive from the browser: copy only known text fields onto the
// built-in plan (structure, illustration layouts and developmental notes stay authoritative),
// cap lengths, and keep codes / EF skills only when they are valid for the level.
const str = (v: unknown, fallback: string, max = 700): string =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback;
const list = (v: unknown, fallback: string[]): string[] =>
  Array.isArray(v) && v.some((x) => typeof x === "string" && x.trim())
    ? v.filter((x) => typeof x === "string" && x.trim()).slice(0, 12).map((x: string) => x.trim().slice(0, 80))
    : fallback;

export function mergeEditedPlan(base: TermPlan, edited: unknown, catalogue: LearningOutcome[]): TermPlan {
  if (!edited || typeof edited !== "object") return base;
  const e = edited as Record<string, unknown>;
  const codes = new Set(catalogue.map((o) => o.code));
  const code = (v: unknown, fallback: string, domain: string) =>
    typeof v === "string" && codes.has(v.trim()) && domainOf(v.trim()) === domain ? v.trim() : fallback;
  const term = Number(e.term);
  const eb = Array.isArray(e.blocks) ? e.blocks : [];
  const ew = Array.isArray(e.weeks) ? e.weeks : [];
  return {
    ...base,
    term: Number.isInteger(term) && term >= 1 && term <= 4 ? term : base.term,
    story: str(e.story, base.story, 120),
    author: str(e.author, base.author, 120),
    wondering: str(e.wondering, base.wondering, 200),
    connection: str(e.connection, base.connection),
    focus: str(e.focus, base.focus),
    languageExposure: str(e.languageExposure, base.languageExposure),
    cdpValues: list(e.cdpValues, base.cdpValues),
    blocks: base.blocks.map((b, i) => {
      const x = (eb[i] && typeof eb[i] === "object" ? eb[i] : {}) as Record<string, unknown>;
      return {
        ...b,
        title: str(x.title, b.title, 120), wondering: str(x.wondering, b.wondering, 200), focus: str(x.focus, b.focus),
        setup: str(x.setup, b.setup, 1200), addOn: str(x.addOn, b.addOn, 900), safety: str(x.safety, b.safety),
      };
    }),
    weeks: base.weeks.map((w, i) => {
      const x = (ew[i] && typeof ew[i] === "object" ? ew[i] : {}) as Record<string, unknown>;
      const ac = (x.artCraft && typeof x.artCraft === "object" ? x.artCraft : {}) as Record<string, unknown>;
      const ef = Array.isArray(x.ef) && x.ef.length === 3 && x.ef.every((s) => (EF_SKILLS as readonly unknown[]).includes(s))
        ? x.ef as [string, string, string] : w.ef;
      return {
        ...w,
        title: str(x.title, w.title, 120), storyBite: str(x.storyBite, w.storyBite, 900), song: str(x.song, w.song),
        keyLanguage: list(x.keyLanguage, w.keyLanguage), secValue: str(x.secValue, w.secValue, 120),
        secCode: code(x.secCode, w.secCode, "SED"), llCode: code(x.llCode, w.llCode, "LL"),
        rolePlay: str(x.rolePlay, w.rolePlay, 900), ef,
        artCraft: { title: str(ac.title, w.artCraft.title, 120), description: str(ac.description, w.artCraft.description, 900) },
      };
    }),
  };
}

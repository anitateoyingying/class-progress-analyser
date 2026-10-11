// Run: npx -y deno@2 test supabase/functions/lesson-plans/ibrain_test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";
import { LEARNING_OUTCOMES } from "./learning-outcomes.ts";
import { IBRAIN_TERM1, blockForWeek } from "./ibrain-term1.ts";
import { buildIbrainPrompt, finalizeIbrainLesson, type RawIbrainLesson } from "./ibrain.ts";

Deno.test("scaffold: every code is official, every week has a tray block", () => {
  for (const level of ["pg", "pn"] as const) {
    const plan = IBRAIN_TERM1[level];
    const codes = new Set(LEARNING_OUTCOMES[level].map((o) => o.code));
    assertEquals(plan.weeks.length, 8);
    for (const w of plan.weeks) {
      assert(codes.has(w.secCode) && w.secCode.includes(".SED."), `${level} wk${w.week} sec ${w.secCode}`);
      assert(codes.has(w.llCode) && w.llCode.includes(".LL."), `${level} wk${w.week} ll ${w.llCode}`);
      assert(blockForWeek(plan, w.week), `${level} wk${w.week} block`);
    }
    for (const b of plan.blocks) {
      for (const c of [...b.outcomes, b.domainCode]) assert(codes.has(c), `${level} ${b.id} ${c}`);
    }
  }
});

Deno.test("finalize: enforces template steps, classifies objectives, falls back on bad codes", () => {
  const plan = IBRAIN_TERM1.pn;
  const raw: RawIbrainLesson = {
    lessonTitle: "Shiny Ocean",
    disposition: { name: "Not a disposition", description: "x" },
    efSkills: [{ skill: "Working Memory", how: "recall" }, { skill: "Working Memory", how: "dup" }],
    objectives: [
      { code: "EY.PN.SED.6.1", text: "children will be able to ask 1 question (EY.PN.SED.6.1)" },
      { code: "EY.FAKE.1", text: "invented" },
      { code: "EY.PN.NE.2.1", text: "sort 3 shells by size" },
    ],
    steps: ["Tuning In", "Storytelling", "Role Play", "Cleaning Up", "Cooling Down", "Wrap Up"].map((name) => ({
      name, materials: ["m"], process: ["p"], intentional: [{ link: "Disposition", how: "h" }, { link: "bogus", how: "h" }],
    })).reverse(),
    differentiation: { support: "s", stretch: "t" },
    lookFors: ["a", "b", "c", "d"],
    rehearseRetrieve: { teacherPrompt: "tp", extension: "ex" },
  };
  const l = finalizeIbrainLesson(raw, plan, { levelKey: "pn", week: 2, session: 1 }, LEARNING_OUTCOMES.pn);
  assertEquals(l.title, "Pre-Nursery Term 1 iBrain Lesson 2 - IB01");
  assertEquals(l.steps.map((s) => s.minutes).reduce((a, b) => a + b, 0), 30);
  assertEquals(l.steps[0].name, "Tuning In");
  assertEquals(l.steps[0].intentional.length, 1);
  assertEquals(l.objectives.map((o) => o.code), [plan.weeks[1].llCode, "EY.PN.SED.6.1", "EY.PN.NE.2.1"]);
  assertEquals(l.objectives[1].text, "Ask 1 question");
  assertEquals(l.disposition.name, "Engagement");
  assertEquals(l.efSkills.length, 1);
  assertEquals(l.lookFors.length, 3);
  assertEquals(l.groupRotation, null);
});

Deno.test("finalize: rejects AI objectives without a measurable criterion", () => {
  const plan = IBRAIN_TERM1.pg;
  const steps = ["Tuning In", "Storytelling", "Role Play", "Cleaning Up", "Cooling Down", "Wrap Up"].map((name) => ({ name, materials: [], process: ["p"], intentional: [] }));
  const raw = {
    lessonTitle: "t", disposition: { name: "Engagement", description: "d" }, efSkills: [],
    objectives: [{ code: "EY.PG.LL.1.1", text: "Respond to 2 words" }, { code: "EY.PG.SED.2.2", text: "Seek comfort from the teacher" }, { code: "EY.PG.NE.2.1", text: "Touch 3 textures" }],
    steps, differentiation: { support: "", stretch: "" }, lookFors: [], rehearseRetrieve: { teacherPrompt: "", extension: "" },
  } as RawIbrainLesson;
  let threw = false;
  try { finalizeIbrainLesson(raw, plan, { levelKey: "pg", week: 1, session: 1 }, LEARNING_OUTCOMES.pg); } catch { threw = true; }
  assert(threw);
});

Deno.test("prompt: IB02/IB03 concurrency + add-on week wording", () => {
  const plan = IBRAIN_TERM1.pg;
  const p2 = buildIbrainPrompt(plan, { levelKey: "pg", week: 2, session: 3 }, LEARNING_OUTCOMES.pg);
  assert(p2.includes("SWAPPED from IB02"));
  assert(p2.includes("THIS IS WEEK 2 OF THE BLOCK"));
  assert(p2.includes("EY.PG.LL"));
  assert(!p2.includes("EY.PN."));
});

Deno.test("mergeEditedPlan: keeps valid edits, rejects bad codes/EF and oversize text", async () => {
  const { mergeEditedPlan } = await import("./ibrain.ts");
  const base = IBRAIN_TERM1.pn;
  const m = mergeEditedPlan(base, {
    term: 2, story: "A Colour of His Own", cdpValues: ["Kindness", 5],
    weeks: [{ title: "Chameleon", secCode: "EY.PN.LL.1.1", llCode: "EY.PN.LL.1.2", ef: ["Working Memory", "Bogus", "Inhibitory Control"], storyBite: "x".repeat(5000) }],
    blocks: [{ setup: "" }],
  }, LEARNING_OUTCOMES.pn);
  assertEquals(m.term, 2);
  assertEquals(m.story, "A Colour of His Own");
  assertEquals(m.cdpValues, ["Kindness"]);
  assertEquals(m.weeks[0].title, "Chameleon");
  assertEquals(m.weeks[0].secCode, base.weeks[0].secCode); // LL code is not a valid SEC code
  assertEquals(m.weeks[0].llCode, "EY.PN.LL.1.2");
  assertEquals(m.weeks[0].ef, base.weeks[0].ef);
  assertEquals(m.weeks[0].storyBite.length, 900);
  assertEquals(m.blocks[0].setup, base.blocks[0].setup);
  assertEquals(m.weeks[1], base.weeks[1]);
  assertEquals(m.blocks[0].materials, base.blocks[0].materials);
  assertEquals(mergeEditedPlan(base, null, LEARNING_OUTCOMES.pn), base);
});

Deno.test("finalize: IB02/IB03 get a 4th ACE objective for Art & Craft with its learning goal", () => {
  const plan = IBRAIN_TERM1.pn;
  const steps = ["Tuning In", "Storytelling", "Art and Craft / Tuffy Play", "Cleaning Up", "Cooling Down", "Wrap Up"].map((name) => ({ name, materials: [], process: ["p"], intentional: [{ link: "Objective 4 (ACE - Art & Craft)", how: "h" }] }));
  const base = {
    lessonTitle: "t", disposition: { name: "Engagement", description: "d" }, efSkills: [], steps,
    differentiation: { support: "", stretch: "" }, lookFors: ["a", "b", "c", "d"], rehearseRetrieve: { teacherPrompt: "", extension: "" },
  };
  const raw = { ...base, objectives: [
    { code: "EY.PN.LL.1.3", text: "Name 2 creatures" }, { code: "EY.PN.SED.6.1", text: "Ask 1 question" },
    { code: "EY.PN.NE.2.1", text: "Sort 3 shells" }, { code: "EY.PN.ACE.2.1", text: "Sponge-print at least 3 waves" },
  ] } as RawIbrainLesson;
  const l = finalizeIbrainLesson(raw, plan, { levelKey: "pn", week: 1, session: 2 }, LEARNING_OUTCOMES.pn);
  assertEquals(l.objectives.map((o) => o.code), ["EY.PN.LL.1.3", "EY.PN.SED.6.1", "EY.PN.NE.2.1", "EY.PN.ACE.2.1"]);
  assertEquals(l.objectives[3].goal, "EY.ACE.2 Express ideas and feelings through art and music and movement");
  assertEquals(l.steps[2].intentional.length, 1);
  assert(l.learningDomains.includes("Aesthetics and Creative Expression (ACE)"));
  assertEquals(l.lookFors.length, 4);
  // no ACE supplied -> registry fallback
  const noAce = { ...base, objectives: raw.objectives.slice(0, 3) } as RawIbrainLesson;
  assertEquals(finalizeIbrainLesson(noAce, plan, { levelKey: "pn", week: 1, session: 3 }, LEARNING_OUTCOMES.pn).objectives[3].code, "EY.PN.ACE.2.1");
});

Deno.test("scaffold: tuff tray set-ups are mess-free", () => {
  for (const level of ["pg", "pn"] as const) {
    for (const b of IBRAIN_TERM1[level].blocks) {
      const text = [b.setup, b.addOn, ...b.materials.map((m) => m.label)].join(" ").toLowerCase()
        .replace(/no (sand|real water|water|real ice)[^.;]*/g, "");
      for (const bad of [" sand", "cornflour", "squeeze", "pipette", "coloured water", "tub of", "warm water", "shredded"]) {
        assert(!text.includes(bad), `${b.id} mentions ${bad}`);
      }
    }
  }
});

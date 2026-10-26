// Run: npx -y deno@2 test supabase/functions/lesson-plans/ibrain_test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";
import { LEARNING_OUTCOMES } from "./learning-outcomes.ts";
import { IBRAIN_TERM1, blockForWeek } from "./ibrain-term1.ts";
import { buildIbrainPrompt, finalizeIbrainLesson, type RawIbrainLesson } from "./ibrain.ts";

const ALL_LINKS = ["Objective 1 (Communication & Language)", "Objective 2 (SEC)", "Objective 3 (Learning Domain)", "Objective 4 (ACE - Art & Craft)", "Disposition", "Working Memory", "Inhibitory Control", "Cognitive Flexibility"]
  .map((link) => ({ link, how: "h" }));

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
      name, materials: ["m"], process: ["p"], intentional: name === "Wrap Up" ? ALL_LINKS : [{ link: "Disposition", how: "h" }, { link: "bogus", how: "h" }],
    })).reverse(),
    differentiation: { support: "s", stretch: "t" },
    lookFors: ["a", "b", "c", "d"],
    rehearseRetrieve: { teacherPrompt: "tp", extension: "ex" },
  };
  const l = finalizeIbrainLesson(raw, plan, { levelKey: "pn", week: 2, session: 1 }, LEARNING_OUTCOMES.pn);
  assertEquals(l.title, "Pre-Nursery Term 1 i-Brain Lesson 2 - IB01");
  assertEquals(l.steps.map((s) => s.minutes).reduce((a, b) => a + b, 0), 30);
  assertEquals(l.steps[0].name, "Tuning In");
  assertEquals(l.steps[0].intentional.length, 1);
  assertEquals(l.objectives.map((o) => o.code), [plan.weeks[1].llCode, "EY.PN.SED.6.1", "EY.PN.NE.2.1"]);
  assertEquals(l.objectives[2].label, "Learning Domain (Role Play)");
  assertEquals(l.objectives[1].text, "Ask 1 question");
  assertEquals(l.disposition.name, "Engagement");
  assertEquals(l.efSkills.length, 1);
  assertEquals(l.lookFors.length, 3);
  assertEquals(l.groupRotation, null);
});

Deno.test("finalize: rejects AI objectives without a measurable criterion", () => {
  const plan = IBRAIN_TERM1.pg;
  const steps = ["Tuning In", "Storytelling", "Role Play", "Cleaning Up", "Cooling Down", "Wrap Up"].map((name) => ({ name, materials: [], process: ["p"], intentional: name === "Wrap Up" ? ALL_LINKS : [] }));
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
  assert(p2.includes("In IB03 the groups swap"));
  assert(p2.includes("ONE main teacher"));
  assert(!p2.includes("Teacher 2 at"));
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
  const steps = ["Tuning In", "Storytelling", "Art and Craft", "Tuffy Play", "Cleaning Up", "Cooling Down", "Wrap Up"].map((name) => ({ name, materials: [], process: ["p"], intentional: name === "Wrap Up" ? ALL_LINKS : [{ link: "Objective 4 (ACE - Art & Craft)", how: "h" }] }));
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
  assertEquals(l.steps.map((s) => s.name).slice(2, 4), ["Art and Craft", "Tuffy Play"]);
  assert(l.steps[2].parallel && l.steps[3].parallel);
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
      for (const bad of [/\bsand\b/, /cornflour/, /squeeze/, /pipette/, /coloured water/, /tub of/, /warm water/, /shredded/, /\bslime\b(?! or water)/]) {
        assert(!bad.test(text), `${b.id} mentions ${bad}`);
      }
    }
  }
});

Deno.test("scaffold: every block names where to buy materials; PG follows the deck's tray plan", () => {
  for (const level of ["pg", "pn"] as const) {
    for (const b of IBRAIN_TERM1[level].blocks) assert(b.sourcing.length > 20, `${b.id} sourcing`);
  }
  assertEquals(IBRAIN_TERM1.pg.blocks.map((b) => b.title), ["Bears", "Natural Habitats Exploration", "Creatures Hiding in Habitats", "Sounds That We Hear"]);
  assertEquals(IBRAIN_TERM1.pg.blocks[1].wondering2, "Where is bear hiding today?");
});

Deno.test("finalize: IB01 domain fallback is the role-play code, not the tray code", () => {
  for (const level of ["pg", "pn"] as const) {
    const codes = new Set(LEARNING_OUTCOMES[level].map((o) => o.code));
    assert(codes.has(`EY.${level.toUpperCase()}.ACE.3.3`));
  }
  const plan = IBRAIN_TERM1.pn;
  const steps = ["Tuning In", "Storytelling", "Role Play", "Cleaning Up", "Cooling Down", "Wrap Up"].map((name) => ({ name, materials: [], process: ["p"], intentional: name === "Wrap Up" ? ALL_LINKS : [] }));
  const raw = {
    lessonTitle: "t", disposition: { name: "Engagement", description: "d" }, efSkills: [], steps,
    objectives: [{ code: "EY.PN.LL.1.3", text: "Name 2 fish" }, { code: "EY.PN.SED.5.1", text: "Give 1 scale" }],
    differentiation: { support: "", stretch: "" }, lookFors: [], rehearseRetrieve: { teacherPrompt: "", extension: "" },
  } as RawIbrainLesson;
  const l = finalizeIbrainLesson(raw, plan, { levelKey: "pn", week: 7, session: 1 }, LEARNING_OUTCOMES.pn);
  assertEquals(l.objectives[2].code, "EY.PN.ACE.3.3");
});

Deno.test("finalize: rejects a lesson whose objective, disposition or EF skill is never facilitated", () => {
  const plan = IBRAIN_TERM1.pg;
  const steps = ["Tuning In", "Storytelling", "Role Play", "Cleaning Up", "Cooling Down", "Wrap Up"].map((name) => ({
    name, materials: [], process: ["p"], intentional: name === "Wrap Up" ? ALL_LINKS.filter((l) => l.link !== "Objective 2 (SEC)") : [],
  }));
  const raw = {
    lessonTitle: "t", disposition: { name: "Engagement", description: "d" }, efSkills: [{ skill: "Working Memory", how: "w" }], steps,
    objectives: [{ code: "EY.PG.LL.1.1", text: "Respond to 2 words" }, { code: "EY.PG.SED.6.1", text: "Touch 2 props" }, { code: "EY.PG.ACE.3.3", text: "Pretend 1 action" }],
    differentiation: { support: "", stretch: "" }, lookFors: [], rehearseRetrieve: { teacherPrompt: "", extension: "" },
  } as RawIbrainLesson;
  let msg = "";
  try { finalizeIbrainLesson(raw, plan, { levelKey: "pg", week: 1, session: 1 }, LEARNING_OUTCOMES.pg); } catch (e) { msg = String(e); }
  assert(msg.includes("Objective 2 (SEC)"), msg);
});

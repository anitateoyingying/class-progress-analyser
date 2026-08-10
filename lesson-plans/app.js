"use strict";

// ===== config =====
const API_URL = "https://hrbhwnscjeokaovoivmn.supabase.co/functions/v1/lesson-plans";

const LEVELS = [
  { key: "pg", label: "Playgroup (PG - 2 Year Olds)", eyloPrefix: "EY.PG" },
  { key: "pn", label: "Pre-Nursery (PN - 3 Year Olds)", eyloPrefix: "EY.PN" },
  { key: "nursery", label: "Nursery (N - 4 Year Olds)", eyloPrefix: "PS.NUR" },
  { key: "k1", label: "Kindergarten 1 (K1 - 5 Year Olds)", eyloPrefix: "PS.K1" },
  { key: "k2", label: "Kindergarten 2 (K2 - 6 Year Olds)", eyloPrefix: "PS.K2" },
];

// ===== dom =====
const $ = (sel, root = document) => root.querySelector(sel);
const gate = $("#gate"), app = $("#app"), resultsEl = $("#results");

// ===== password gate (separate session key from the other tools) =====
function getPassword() { return sessionStorage.getItem("lesson_plans_password") || ""; }

async function verifyPassword(pw) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw, request: null }),
  });
  if (res.status === 401) return false;
  return true;
}

function showGate(msg) {
  sessionStorage.removeItem("lesson_plans_password");
  gate.classList.remove("hidden");
  app.classList.add("hidden");
  const err = $("#gate-error");
  err.textContent = msg || "";
  err.classList.toggle("hidden", !msg);
}

function showApp() {
  gate.classList.add("hidden");
  app.classList.remove("hidden");
}

$("#gate-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#gate-btn"), input = $("#gate-input");
  btn.disabled = true;
  btn.textContent = "Checking…";
  try {
    if (await verifyPassword(input.value)) {
      sessionStorage.setItem("lesson_plans_password", input.value);
      showApp();
    } else {
      showGate("Incorrect password. Please try again.");
    }
  } catch {
    showGate("Could not reach the server. Check your connection and try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enter";
  }
});

$("#lock-btn").addEventListener("click", () => showGate());

// ===== form setup =====
const levelSelect = $("#level-select"), languageSelect = $("#language-select"), countSelect = $("#count-select");
for (const lvl of LEVELS) {
  const opt = document.createElement("option");
  opt.value = lvl.key;
  opt.textContent = lvl.label;
  levelSelect.appendChild(opt);
}
for (let n = 1; n <= 6; n++) {
  const opt = document.createElement("option");
  opt.value = String(n);
  opt.textContent = `${n} lesson${n > 1 ? "s" : ""}`;
  if (n === 4) opt.selected = true;
  countSelect.appendChild(opt);
}

// ===== state =====
let nextId = 1;
const batches = new Map(); // id -> {level, language, topic, count, lessons, error, busy}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function globalError(msg) {
  const div = el("div", "error-banner", msg);
  $("#global-errors").appendChild(div);
  setTimeout(() => div.remove(), 8000);
}

// ===== generate =====
async function fetchLessons(request) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: getPassword(), request }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { showGate("Session expired. Please enter the password again."); throw new Error("Incorrect password"); }
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
  if (!Array.isArray(data.lessons)) throw new Error("Malformed server response");
  return data.lessons;
}

$("#generate-btn").addEventListener("click", async () => {
  const topic = $("#topic-input").value.trim();
  if (!topic) { globalError("Please enter a topic or core value."); return; }
  const envTopic = $("#env-topic-input").value.trim();
  const festivalTopic = $("#festival-topic-input").value.trim();

  const lvl = LEVELS.find((l) => l.key === levelSelect.value);
  const language = languageSelect.value;
  const count = Number(countSelect.value);

  const id = String(nextId++);
  const batch = { id, level: lvl, language, topic, count, lessons: null, error: null, busy: true };
  batches.set(id, batch);
  renderBatch(batch);

  try {
    batch.lessons = await fetchLessons({
      levelLabel: lvl.label,
      levelKey: lvl.key,
      eyloPrefix: lvl.eyloPrefix,
      topic,
      envTopic: envTopic || undefined,
      festivalTopic: festivalTopic || undefined,
      language,
      count,
    });
  } catch (err) {
    batch.error = err.message;
    globalError(`Generation failed: ${err.message}`);
  } finally {
    batch.busy = false;
    renderBatch(batch);
  }
});

// ===== rendering =====
function renderBatch(batch) {
  let group = document.getElementById(`batch-${batch.id}`);
  if (!group) {
    group = el("section", "level-group");
    group.id = `batch-${batch.id}`;
    resultsEl.prepend(group);
  }
  group.replaceChildren();
  group.appendChild(el("h2", null, `${batch.level.label} — ${batch.topic} (${batch.language})`));

  if (batch.busy) {
    const s = el("span");
    s.appendChild(el("span", "spinner"));
    s.appendChild(document.createTextNode("Generating lesson plans with Gemini…"));
    group.appendChild(s);
    return;
  }

  if (batch.error) {
    group.appendChild(el("div", "error-banner", batch.error));
    return;
  }

  if (!batch.lessons) return;

  batch.lessons.forEach((lesson, i) => group.appendChild(lessonCard(lesson, i)));

  const actions = el("div", "level-actions");
  const dl = el("button", "ghost-btn", "Download this level + language (.docx)");
  dl.addEventListener("click", () => downloadDocx(batch).catch((e) => globalError(`Word export failed: ${e.message}`)));
  actions.appendChild(dl);
  group.appendChild(actions);
}

function listSection(title, items) {
  const sec = el("div", "lesson-section");
  sec.appendChild(el("h4", null, title));
  const ul = el("ul");
  for (const item of items || []) ul.appendChild(el("li", null, item));
  sec.appendChild(ul);
  return sec;
}

function lessonCard(lesson, i) {
  const card = el("div", "lesson-card");
  card.appendChild(el("h3", null, `Lesson ${i + 1}: ${lesson.topic}`));
  const meta = el("div", "lesson-meta");
  meta.appendChild(document.createTextNode(`${lesson.topicDefinition} `));
  const durSpan = el("span", null, `Duration: ${lesson.duration} · Domains: ${(lesson.learningDomains || []).join(", ")}`);
  durSpan.style.display = "block";
  durSpan.style.marginTop = "0.2rem";
  meta.appendChild(durSpan);
  card.appendChild(meta);

  const conceptSec = el("div", "lesson-section");
  conceptSec.appendChild(el("h4", null, "Concept"));
  conceptSec.appendChild(el("p", null, lesson.topicConcept));
  card.appendChild(conceptSec);

  const dispoSec = el("div", "lesson-section");
  dispoSec.appendChild(el("h4", null, `Disposition: ${lesson.dispositionName}`));
  dispoSec.appendChild(el("p", null, lesson.dispositionDescription));
  card.appendChild(dispoSec);

  card.appendChild(listSection("Lesson Objectives", lesson.objectives));
  card.appendChild(listSection("Materials & Resources", lesson.materials));
  card.appendChild(listSection("Be (Introduction)", lesson.be));
  card.appendChild(listSection("Do (Main Activity)", lesson.do));
  card.appendChild(listSection("Reflect", lesson.reflect));
  card.appendChild(listSection("Act (Extension)", lesson.act));
  return card;
}

// ===== docx export =====
async function downloadDocx(batch) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

  const children = [
    new Paragraph({ text: `${batch.level.label}: ${batch.topic}`, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: `Language: ${batch.language}` }),
    new Paragraph(""),
  ];

  batch.lessons.forEach((lesson, i) => {
    children.push(new Paragraph({ text: `[${batch.level.label} Lesson ${i + 1} - ${lesson.topic}]`, heading: HeadingLevel.HEADING_3 }));
    children.push(new Paragraph({ children: [new TextRun({ text: "Topic: ", bold: true }), new TextRun(lesson.topic)] }));
    children.push(new Paragraph({ children: [new TextRun({ text: "Topic Definition: ", bold: true }), new TextRun(lesson.topicDefinition)] }));
    children.push(new Paragraph({ children: [new TextRun({ text: "Topic Concept: ", bold: true }), new TextRun(lesson.topicConcept)] }));
    children.push(new Paragraph({ children: [new TextRun({ text: "Suggested Duration: ", bold: true }), new TextRun(lesson.duration)] }));
    children.push(new Paragraph({ children: [new TextRun({ text: "Learning Domain: ", bold: true })] }));
    for (const d of lesson.learningDomains || []) children.push(new Paragraph(d));
    children.push(new Paragraph({ children: [new TextRun({ text: "Disposition (P.R.A.I.S.E.): ", bold: true })] }));
    children.push(new Paragraph(lesson.dispositionName));
    children.push(new Paragraph(lesson.dispositionDescription));
    children.push(new Paragraph({ children: [new TextRun({ text: "Lesson Objectives: Children will be able to:", bold: true })] }));
    for (const o of lesson.objectives || []) children.push(new Paragraph(o));
    children.push(new Paragraph({ children: [new TextRun({ text: "Materials & Resources:", bold: true })] }));
    for (const m of lesson.materials || []) children.push(new Paragraph(m));
    children.push(new Paragraph({ children: [new TextRun({ text: "Be:", bold: true })] }));
    for (const b of lesson.be || []) children.push(new Paragraph(b));
    children.push(new Paragraph({ children: [new TextRun({ text: "Do:", bold: true })] }));
    for (const d of lesson.do || []) children.push(new Paragraph(d));
    children.push(new Paragraph({ children: [new TextRun({ text: "Reflect:", bold: true })] }));
    for (const r of lesson.reflect || []) children.push(new Paragraph(r));
    children.push(new Paragraph({ children: [new TextRun({ text: "Act:", bold: true })] }));
    for (const a of lesson.act || []) children.push(new Paragraph(a));
    children.push(new Paragraph(""));
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${batch.level.label} - ${batch.topic} (${batch.language}).docx`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ===== boot =====
if (getPassword()) showApp();
else showGate();

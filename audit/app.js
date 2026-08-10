"use strict";

// ===== config =====
const API_URL = "https://hrbhwnscjeokaovoivmn.supabase.co/functions/v1/curriculum-audit";

const DIMENSIONS = [
  {
    key: "curriculum-management",
    label: "Curriculum Management",
    match: (name) => /curriculum management/i.test(name),
    desc: "How Curriculum Leaders drive and oversee curriculum delivery and outcomes through the Environment, Training and Resource Management",
    maxHighlight: 2,
  },
  {
    key: "teaching-learning",
    label: "Teaching and Learning Practices",
    match: (name) => /teaching.*learning/i.test(name),
    desc: "Effective teaching combines 3Rs pedagogy, purposeful communication and systematic observations to foster social-emotional competencies and holistic development through outdoor learning and purposeful play",
    maxHighlight: 3,
  },
  {
    key: "early-years",
    label: "Early Years Curriculum",
    match: (name) => /early years/i.test(name),
    desc: "Early Years classrooms intentionally integrate exploration, communication and diverse learning experiences (Literacy, Numeracy, Chinese, Creative arts etc) to support holistic development",
    maxHighlight: 5,
  },
  {
    key: "preschool",
    label: "Preschool Curriculum",
    match: (name) => /preschool/i.test(name),
    desc: "Preschool classrooms are intentionally designed to foster exploration, interaction and learning across Literacy, Numeracy, Creative arts, Physical development and Chinese language skills with cultural awareness",
    maxHighlight: 7,
  },
];

const TIER_LABEL = {
  2: "foundational (structures in place)",
  4: "centre-wide delivery at Brand expectations (~75%)",
  6: "high-quality, data-informed implementation with visible outcomes",
};

// ===== state =====
const files = new Map();
let nextId = 1;

// ===== dom =====
const $ = (sel, root = document) => root.querySelector(sel);
const gate = $("#gate"), app = $("#app"), cardsEl = $("#cards");

// ===== password gate (separate session key from the class analyser) =====
function getPassword() { return sessionStorage.getItem("audit_password") || ""; }

async function verifyPassword(pw) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw, dimension: null }),
  });
  if (res.status === 401) return false;
  return true;
}

function showGate(msg) {
  sessionStorage.removeItem("audit_password");
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
      sessionStorage.setItem("audit_password", input.value);
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

// ===== xlsx parsing =====
function extractSheetItems(grid) {
  const items = [];
  let cur = null;
  for (const row of grid) {
    const a = row[0], b = row[1], c = row[2], d = row[3];
    const aIsNum = typeof a === "number" || (typeof a === "string" && /^\d+(\.\d+)?$/.test(a.trim()));
    if (aIsNum && (b == null || b === "") && c != null && String(c).trim() !== "") {
      cur = { title: String(c).trim(), criteria: [], score: null };
      items.push(cur);
    } else if (b != null && String(b).trim() !== "" && c != null && String(c).trim() !== "" && cur) {
      cur.criteria.push(String(c).trim());
    } else if (typeof d === "number" && cur && cur.score == null) {
      cur.score = d;
    }
  }
  return items.filter((it) => it.score != null);
}

function findTotalScore(grid) {
  for (const row of grid) {
    if (typeof row[0] === "string" && /total score/i.test(row[0])) {
      const d = row[3];
      if (typeof d === "number") return d;
    }
  }
  return null;
}

function parseCaTool(buf, fileName) {
  const wb = XLSX.read(buf, { type: "array" });
  const result = {};
  for (const dim of DIMENSIONS) {
    const sheetName = wb.SheetNames.find((n) => dim.match(n));
    if (!sheetName) continue;
    const grid = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });
    const items = extractSheetItems(grid);
    if (items.length === 0) continue;
    items.forEach((it, i) => { it.no = `${DIMENSIONS.indexOf(dim) + 1}.${i + 1}`; });
    const officialTotal = findTotalScore(grid);
    const resummed = items.reduce((s, it) => s + it.score, 0);
    result[dim.key] = { items, officialTotal: officialTotal ?? resummed, resummed };
  }
  if (Object.keys(result).length === 0) {
    throw new Error(
      `"${fileName}" doesn't look like a CA Tool workbook. ` +
      `Expected sheets for Curriculum Management, Teaching & Learning Practices, Early Years and Preschool.`
    );
  }
  return result;
}

function tierOf(score) { return score >= 6 ? 6 : score >= 4 ? 4 : 2; }

// ===== AI commentary =====
async function fetchCommentary(dim, items, maxHighlight) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: getPassword(),
      dimension: {
        label: dim.label,
        maxHighlight,
        items: items.map(({ no, title, criteria, score }) => ({ no, title, criteria, score })),
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { showGate("Session expired. Please enter the password again."); throw new Error("Incorrect password"); }
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
  if (!Array.isArray(data.lines)) throw new Error("Malformed server response");
  return data.lines;
}

// ===== file handling =====
const dropzone = $("#dropzone"), fileInput = $("#file-input");
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fileInput.click(); });
dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  addFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", () => { addFiles(fileInput.files); fileInput.value = ""; });

async function addFiles(fileList) {
  for (const file of fileList) {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      globalError(`"${file.name}" skipped: only .xlsx files are supported.`);
      continue;
    }
    if (file.size > 20 * 1024 * 1024) {
      globalError(`"${file.name}" skipped: larger than 20 MB.`);
      continue;
    }
    const id = String(nextId++);
    const entry = { id, name: file.name, size: file.size, dims: null, commentary: {}, error: null, busy: false };
    files.set(id, entry);
    try {
      const buf = await file.arrayBuffer();
      entry.dims = parseCaTool(buf, file.name);
    } catch (err) {
      entry.error = err.message;
    }
    renderCard(entry);
  }
}

function globalError(msg) {
  const div = document.createElement("div");
  div.className = "error-banner";
  div.textContent = msg;
  $("#global-errors").appendChild(div);
  setTimeout(() => div.remove(), 8000);
}

// ===== rendering =====
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function tierLegend() {
  const lg = el("div", "tier-legend");
  for (const [tier, label] of [[2, "Foundational"], [4, "Centre-wide (~75%)"], [6, "High-quality, data-informed"]]) {
    const key = el("span", "key");
    key.appendChild(el("span", `swatch tier-${tier}`));
    key.appendChild(document.createTextNode(label));
    lg.appendChild(key);
  }
  return lg;
}

function itemRow(it) {
  const row = el("div", "item-row");
  const title = el("div", "item-title", `${it.no} ${it.title}`);
  title.title = it.title;
  row.appendChild(title);
  const track = el("div", "item-bar-track");
  const fill = el("div", `item-bar-fill tier-${tierOf(it.score)}`);
  fill.style.width = `${Math.round((it.score / 6) * 100)}%`;
  track.appendChild(fill);
  row.appendChild(track);
  row.appendChild(el("div", "item-score", `${it.score}/6`));
  return row;
}

function renderCard(entry) {
  let card = document.getElementById(`card-${entry.id}`);
  if (!card) {
    card = el("section", "card");
    card.id = `card-${entry.id}`;
    cardsEl.appendChild(card);
  }
  card.replaceChildren();

  const head = el("div", "card-head");
  head.appendChild(el("h2", null, entry.name));
  head.appendChild(el("span", "file-size", `${(entry.size / 1024).toFixed(1)} KB`));
  const rm = el("button", "remove-btn", "✕");
  rm.title = "Remove this file";
  rm.addEventListener("click", () => { files.delete(entry.id); card.remove(); });
  head.appendChild(rm);
  card.appendChild(head);

  if (entry.error) {
    card.appendChild(el("div", "error-banner", entry.error));
    return;
  }

  card.appendChild(tierLegend());

  let totalScore = 0, maxScore = 0;
  for (const dim of DIMENSIONS) {
    const d = entry.dims[dim.key];
    if (!d) continue;
    totalScore += d.officialTotal;
    maxScore += 6 * d.items.length;

    const dimCard = el("div", "dim-card");
    const dimHead = el("div", "dim-head");
    dimHead.appendChild(el("h2", null, dim.label));
    dimHead.appendChild(el("span", "dim-score", `${d.officialTotal} / ${6 * d.items.length}`));
    dimCard.appendChild(dimHead);
    dimCard.appendChild(el("p", "dim-desc", dim.desc));

    if (d.resummed !== d.officialTotal) {
      dimCard.appendChild(el("div", "formula-warning",
        `Note: this sheet's own TOTAL SCORE (${d.officialTotal}) does not include all ${d.items.length} scored items (sum = ${d.resummed}). Verify the workbook formula before finalising the report.`));
    }

    for (const it of d.items) dimCard.appendChild(itemRow(it));

    const commentaryEl = el("div", "obj-section");
    const lines = entry.commentary[dim.key];
    if (lines && lines.length) {
      const ol = el("ol", "strategies");
      for (const line of lines) ol.appendChild(el("li", null, line));
      commentaryEl.appendChild(ol);
    } else if (entry.commentaryDone) {
      commentaryEl.appendChild(el("p", "strategies-pending", "No commentary returned for this dimension. Try regenerating."));
    } else {
      commentaryEl.appendChild(el("p", "strategies-pending", "Strength/gap commentary will appear here after analysis."));
    }
    dimCard.appendChild(commentaryEl);
    card.appendChild(dimCard);
  }

  const pct = maxScore ? Math.round((totalScore / maxScore) * 1000) / 10 : 0;
  const banner = el("div", "overall-banner");
  banner.appendChild(document.createTextNode("Overall Score: "));
  banner.appendChild(el("span", "pct", `${totalScore} / ${maxScore} (${pct}%)`));
  card.appendChild(banner);

  const actions = el("div", "card-actions");
  if (entry.busy) {
    const s = el("span");
    s.appendChild(el("span", "spinner"));
    s.appendChild(document.createTextNode("Generating audit commentary with Gemini…"));
    actions.appendChild(s);
  } else {
    const analyseBtn = el("button", null, entry.commentaryDone ? "Regenerate commentary" : "Get AI commentary");
    analyseBtn.addEventListener("click", () => analyse(entry));
    actions.appendChild(analyseBtn);
    if (entry.commentaryDone) {
      const dl = el("button", "ghost-btn", "Download audit report (.docx)");
      dl.addEventListener("click", () => downloadDocx(entry).catch((e) => globalError(`Word export failed: ${e.message}`)));
      actions.appendChild(dl);
    }
  }
  card.appendChild(actions);
}

// ===== analyse =====
async function analyse(entry) {
  entry.busy = true;
  renderCard(entry);
  try {
    for (const dim of DIMENSIONS) {
      const d = entry.dims[dim.key];
      if (!d) continue;
      entry.commentary[dim.key] = await fetchCommentary(dim, d.items, dim.maxHighlight);
    }
    entry.commentaryDone = true;
  } catch (err) {
    globalError(`Analysis of "${entry.name}" failed: ${err.message}`);
  } finally {
    entry.busy = false;
    renderCard(entry);
    if (entry.commentaryDone) {
      const card = document.getElementById(`card-${entry.id}`);
      if (card) confettiBurst(card);
    }
  }
}

function confettiBurst(container) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["--confetti-1", "--confetti-2", "--confetti-3", "--confetti-4"];
  for (let i = 0; i < 18; i++) {
    const piece = el("span", "confetti-burst");
    piece.style.background = `var(${colors[i % colors.length]})`;
    piece.style.left = `${8 + Math.random() * 84}%`;
    piece.style.top = "0";
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 1600);
  }
}

// ===== docx export =====
async function downloadDocx(entry) {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, ShadingType, PageOrientation, HeadingLevel,
  } = docx;

  const headerRow = new TableRow({
    children: ["Curriculum Dimensions", "Report"].map((t) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: "FBE4D5" },
      children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })],
    })),
  });

  const bodyRows = [];
  let totalScore = 0, maxScore = 0;
  for (const dim of DIMENSIONS) {
    const d = entry.dims[dim.key];
    if (!d) continue;
    totalScore += d.officialTotal;
    maxScore += 6 * d.items.length;
    const lines = entry.commentary[dim.key] || [];
    bodyRows.push(new TableRow({
      children: [
        new TableCell({ children: [
          new Paragraph({ children: [new TextRun({ text: dim.label, bold: true })] }),
          new Paragraph({ text: dim.desc }),
        ] }),
        new TableCell({ children: [
          new Paragraph({ text: `Score: ${d.officialTotal} / ${6 * d.items.length}` }),
          ...lines.map((l) => new Paragraph(l)),
        ] }),
      ],
    }));
  }

  const pct = maxScore ? Math.round((totalScore / maxScore) * 1000) / 10 : 0;

  const children = [
    new Paragraph({ text: "Curriculum Audit Report", heading: HeadingLevel.HEADING_1 }),
    new Paragraph(`Centre: ${entry.meta?.centre || "[Centre Name]"}`),
    new Paragraph(`Date audited: ${new Date().toISOString().slice(0, 10)}`),
    new Paragraph(`Assessor(s): [Assessor Name(s)]`),
    new Paragraph(""),
    new Table({ rows: [headerRow, ...bodyRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
    new Paragraph({
      children: [new TextRun({ text: `\nOverall Score: ${totalScore} / ${maxScore} (${pct}%)`, italics: true })],
    }),
  ];

  const doc = new Document({
    sections: [{ properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } }, children }],
  });
  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${entry.name.replace(/\.xlsx$/i, "")} audit report.docx`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ===== boot =====
if (getPassword()) showApp();
else showGate();

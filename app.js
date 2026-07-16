"use strict";

// ===== config =====
const API_URL = "https://hrbhwnscjeokaovoivmn.supabase.co/functions/v1/class-analyser";
const TOP_N = 10;

const CENTRES = ["Cecil", "Commonwealth", "Compassvale", "Gambas", "Jurong West",
  "Kallang", "Sengkang", "Thomson", "Upper Serangoon"];
const CLASSES = ["YI", "LE", "LG", "PG", "PGA", "PGB", "PNA", "PNB", "Pre-N", "PN",
  "NUR", "NURA", "NURB", "K1", "K1A", "K1B", "K2A", "K2B"];
const QUARTERS = (() => {
  const y = new Date().getFullYear();
  const out = [];
  for (const yy of [y - 1, y]) for (let q = 1; q <= 4; q++) out.push(`Q${q} ${yy}`);
  return out;
})();

const LEVELS = [
  { key: "notYet", label: "Not Yet", cls: "notyet" },
  { key: "emerging", label: "Emerging", cls: "emerging" },
  { key: "achieved", label: "Achieved", cls: "achieved" },
];

// ===== state =====
const files = new Map(); // id -> {name, size, rows, domains, meta, strategies, error}
let nextId = 1;

// ===== dom =====
const $ = (sel, root = document) => root.querySelector(sel);
const gate = $("#gate"), app = $("#app"), cardsEl = $("#cards");

// ===== password gate =====
function getPassword() { return sessionStorage.getItem("cpa_password") || ""; }

async function verifyPassword(pw) {
  // Probe: empty objectives passes only the password check server-side.
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw, objectives: [] }),
  });
  if (res.status === 401) return false;
  return true; // 400 "No objectives provided" means the password was accepted
}

function showGate(msg) {
  sessionStorage.removeItem("cpa_password");
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
      sessionStorage.setItem("cpa_password", input.value);
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
function parseWorkbook(buf, fileName) {
  const wb = XLSX.read(buf, { type: "array" });
  const errors = [];
  for (const sheetName of wb.SheetNames) {
    const grid = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });
    const result = parseGrid(grid);
    if (result.rows.length > 0) return result;
    if (result.error) errors.push(`${sheetName}: ${result.error}`);
  }
  throw new Error(
    `"${fileName}" doesn't look like a Taidii progress report. ` +
    `Expected columns: Domain, Objective, then student counts for Not Yet / Emerging / Achieved.` +
    (errors.length ? ` (${errors.join("; ")})` : "")
  );
}

function parseGrid(grid) {
  // Locate the header row: contains both "domain" and "objective".
  let headerIdx = -1, domainCol = -1, objectiveCol = -1;
  for (let r = 0; r < Math.min(grid.length, 20); r++) {
    const row = grid[r] || [];
    const cells = row.map((c) => String(c ?? "").trim().toLowerCase());
    const d = cells.findIndex((c) => c.startsWith("domain"));
    const o = cells.findIndex((c) => c.startsWith("objective"));
    if (d !== -1 && o !== -1) { headerIdx = r; domainCol = d; objectiveCol = o; break; }
  }
  if (headerIdx === -1) return { rows: [], error: "no Domain/Objective header row found" };

  // Numeric count columns after the objective column. Taidii layout pairs each
  // count with a "%" rate column, so keep columns whose body values are mostly
  // plain integers and skip percentage columns.
  const body = grid.slice(headerIdx + 1).filter((row) => row && row[objectiveCol] != null);
  if (body.length === 0) return { rows: [], error: "no data rows" };

  const countCols = [];
  const maxCol = Math.max(...body.map((r) => r.length));
  for (let c = objectiveCol + 1; c < maxCol; c++) {
    let ints = 0, pcts = 0, filled = 0;
    for (const row of body) {
      const v = row[c];
      if (v == null || v === "") continue;
      filled++;
      const s = String(v).trim();
      if (s.endsWith("%")) pcts++;
      else if (/^\d+(\.0+)?$/.test(s)) ints++;
      else if (typeof v === "number" && v > 1) ints++; // xlsx numbers
      else if (typeof v === "number") pcts++;          // 0–1 fractions = rates
    }
    if (filled > 0 && ints >= filled * 0.8) countCols.push(c);
  }
  if (countCols.length < 3) {
    return { rows: [], error: `found ${countCols.length} count column(s), need 3 (Not Yet, Emerging, Achieved)` };
  }
  const [nyCol, emCol, acCol] = countCols.slice(0, 3);

  const rows = [];
  let currentDomain = "";
  for (const row of body) {
    const domainCell = row[domainCol];
    if (domainCell != null && String(domainCell).trim() !== "") {
      currentDomain = String(domainCell).trim();
    }
    const objective = String(row[objectiveCol] ?? "").trim();
    if (!objective) continue;
    const notYet = toCount(row[nyCol]);
    const emerging = toCount(row[emCol]);
    const achieved = toCount(row[acCol]);
    if (notYet === null || emerging === null || achieved === null) continue;
    rows.push({ domain: currentDomain, objective, notYet, emerging, achieved });
  }
  return { rows };
}

function toCount(v) {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace("%", ""));
  return Number.isFinite(n) ? n : null;
}

// ===== analysis =====
function rankObjectives(rows) {
  // notYet weighted double: a child at "Not Yet" needs more support than "Emerging".
  const scored = rows.map((r) => ({
    ...r,
    score: r.notYet * 2 + r.emerging,
    needsAttention: r.notYet + r.emerging > r.achieved,
  }));
  scored.sort((a, b) => b.score - a.score || b.notYet - a.notYet);
  return scored.map((r, i) => ({ ...r, rank: i + 1 }));
}

function domainSummary(rows) {
  const map = new Map();
  for (const r of rows) {
    const d = map.get(r.domain) || { domain: r.domain, notYet: 0, emerging: 0, achieved: 0 };
    d.notYet += r.notYet; d.emerging += r.emerging; d.achieved += r.achieved;
    map.set(r.domain, d);
  }
  return [...map.values()];
}

async function fetchStrategies(objectives, context) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: getPassword(),
      objectives: objectives.map(({ domain, objective, notYet, emerging, achieved }) =>
        ({ domain, objective, notYet, emerging, achieved })),
      context,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { showGate("Session expired — please enter the password again."); throw new Error("Incorrect password"); }
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
  if (!Array.isArray(data.strategies)) throw new Error("Malformed server response");
  return data.strategies;
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
      globalError(`"${file.name}" skipped — only .xlsx files are supported.`);
      continue;
    }
    if (file.size > 20 * 1024 * 1024) {
      globalError(`"${file.name}" skipped — larger than 20 MB.`);
      continue;
    }
    const id = String(nextId++);
    const entry = { id, name: file.name, size: file.size, rows: null, meta: {}, strategies: null, error: null, busy: false };
    files.set(id, entry);
    try {
      const buf = await file.arrayBuffer();
      const { rows } = parseWorkbook(buf, file.name);
      entry.rows = rankObjectives(rows);
      entry.domains = domainSummary(rows);
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

function renderCard(entry) {
  let card = document.getElementById(`card-${entry.id}`);
  if (!card) {
    card = el("section", "card");
    card.id = `card-${entry.id}`;
    cardsEl.appendChild(card);
  }
  card.replaceChildren();

  // header
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

  // metadata inputs
  const metaRow = el("div", "meta-row");
  for (const [key, label, list, opts] of [
    ["centre", "Centre", "centre-list", CENTRES],
    ["class", "Class", "class-list", CLASSES],
    ["quarter", "Quarter", "quarter-list", QUARTERS],
  ]) {
    const lab = el("label", null, label);
    const input = el("input");
    input.setAttribute("list", list);
    input.placeholder = opts[0];
    input.value = entry.meta[key] || "";
    input.addEventListener("input", () => { entry.meta[key] = input.value; });
    lab.appendChild(input);
    metaRow.appendChild(lab);
  }
  card.appendChild(metaRow);

  // KPI tiles
  const total = { notYet: 0, emerging: 0, achieved: 0 };
  for (const r of entry.rows) for (const l of LEVELS) total[l.key] += r[l.key];
  const grand = total.notYet + total.emerging + total.achieved;
  const kpis = el("div", "kpi-row");
  kpis.appendChild(statTile("Objectives", String(entry.rows.length), "in report"));
  for (const l of LEVELS) {
    const pct = grand ? Math.round((total[l.key] / grand) * 100) : 0;
    kpis.appendChild(statTile(l.label, `${pct}%`, `${fmtNum(total[l.key])} ratings`));
  }
  card.appendChild(kpis);

  // domain stacked bars
  card.appendChild(domainChart(entry.domains));

  // top objectives
  const objSection = el("div", "obj-section");
  objSection.appendChild(el("h3", null, `Top ${Math.min(TOP_N, entry.rows.length)} objectives needing attention`));
  const top = entry.rows.slice(0, TOP_N);
  top.forEach((r, i) => objSection.appendChild(objectiveBlock(entry, r, i)));
  card.appendChild(objSection);

  // actions
  const actions = el("div", "card-actions");
  if (entry.busy) {
    const s = el("span");
    s.appendChild(el("span", "spinner"));
    s.appendChild(document.createTextNode("Generating strategies with Gemini…"));
    actions.appendChild(s);
  } else {
    const analyseBtn = el("button", null, entry.strategies ? "Regenerate strategies" : "Get AI strategies");
    analyseBtn.addEventListener("click", () => analyse(entry));
    actions.appendChild(analyseBtn);
    if (entry.strategies) {
      const dl = el("button", "ghost-btn", "Download Word report");
      dl.addEventListener("click", () => downloadDocx(entry).catch((e) => globalError(`Word export failed: ${e.message}`)));
      actions.appendChild(dl);
    }
  }
  card.appendChild(actions);
}

function statTile(label, value, sub) {
  const tile = el("div", "stat-tile");
  tile.appendChild(el("div", "label", label));
  tile.appendChild(el("div", "value", value));
  if (sub) tile.appendChild(el("div", "sub", sub));
  return tile;
}

function fmtNum(n) { return n.toLocaleString("en-US"); }

function legend() {
  const lg = el("div", "legend");
  for (const l of LEVELS) {
    const key = el("span", "key");
    const sw = el("span", `swatch seg ${l.cls}`);
    key.appendChild(sw);
    key.appendChild(document.createTextNode(l.label));
    lg.appendChild(key);
  }
  return lg;
}

function stackBar(title, d) {
  const total = d.notYet + d.emerging + d.achieved;
  const stack = el("div", "stack");
  stack.setAttribute("role", "img");
  stack.setAttribute("aria-label",
    `${title}: Not Yet ${d.notYet}, Emerging ${d.emerging}, Achieved ${d.achieved}`);
  for (const l of LEVELS) {
    const v = d[l.key];
    if (v <= 0) continue;
    const seg = el("div", `seg ${l.cls}`);
    seg.style.flexGrow = String(v);
    seg.style.flexBasis = "0";
    attachTooltip(seg, title, l, v, total);
    stack.appendChild(seg);
  }
  return stack;
}

function domainChart(domains) {
  const wrap = el("div", "domain-chart");
  wrap.appendChild(el("h3", null, "Progress by domain"));
  wrap.appendChild(legend());
  const sorted = [...domains].sort((a, b) =>
    (b.notYet * 2 + b.emerging) / Math.max(1, b.notYet + b.emerging + b.achieved) -
    (a.notYet * 2 + a.emerging) / Math.max(1, a.notYet + a.emerging + a.achieved));
  for (const d of sorted) {
    const row = el("div", "domain-row");
    const name = el("div", "domain-name", d.domain);
    name.title = d.domain;
    row.appendChild(name);
    row.appendChild(stackBar(d.domain, d));
    wrap.appendChild(row);
  }
  return wrap;
}

function objectiveBlock(entry, r, i) {
  const block = el("div", "obj");
  const head = el("div", "obj-head");
  head.appendChild(el("span", "obj-rank", `#${r.rank}`));
  head.appendChild(el("span", "obj-title", r.objective));
  block.appendChild(head);
  block.appendChild(el("div", "obj-domain", r.domain));

  const row = el("div", "obj-stack-row");
  row.appendChild(stackBar(r.objective, r));
  row.appendChild(el("span", "obj-stats",
    `Not Yet ${r.notYet} · Emerging ${r.emerging} · Achieved ${r.achieved}`));
  block.appendChild(row);

  const strat = entry.strategies?.[i];
  if (strat && strat.length > 0) {
    const ol = el("ol", "strategies");
    for (const s of strat) ol.appendChild(el("li", null, s));
    block.appendChild(ol);
  } else if (entry.strategies) {
    block.appendChild(el("p", "strategies-pending", "No strategies returned for this objective — try regenerating."));
  } else {
    block.appendChild(el("p", "strategies-pending", "Strategies will appear here after analysis."));
  }
  return block;
}

// ===== tooltip =====
const tooltip = $("#tooltip");
function attachTooltip(seg, title, level, value, total) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  seg.addEventListener("mouseenter", () => {
    tooltip.replaceChildren();
    tooltip.appendChild(el("div", "t-title", title.split("\n")[0]));
    const row = el("div", "t-row");
    row.appendChild(el("span", `swatch seg ${level.cls}`));
    row.appendChild(document.createTextNode(`${level.label}: ${value} (${pct}%)`));
    tooltip.appendChild(row);
    tooltip.classList.remove("hidden");
  });
  seg.addEventListener("mousemove", (e) => {
    const pad = 12;
    let x = e.clientX + pad, y = e.clientY + pad;
    const r = tooltip.getBoundingClientRect();
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
    if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  });
  seg.addEventListener("mouseleave", () => tooltip.classList.add("hidden"));
}

// ===== analyse =====
async function analyse(entry) {
  entry.busy = true;
  renderCard(entry);
  try {
    const top = entry.rows.slice(0, TOP_N);
    const context = [entry.meta.centre, entry.meta.class, entry.meta.quarter]
      .filter(Boolean).join(", ");
    entry.strategies = await fetchStrategies(top, context);
  } catch (err) {
    globalError(`Analysis of "${entry.name}" failed: ${err.message}`);
  } finally {
    entry.busy = false;
    renderCard(entry);
  }
}

// ===== docx export =====
async function downloadDocx(entry) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = docx;
  const meta = entry.meta;
  const titleBits = [meta.centre, meta.class].filter(Boolean).join(" - ");
  const title = `${titleBits || entry.name}${meta.quarter ? ` (${meta.quarter})` : ""}`;

  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: "Ranked Objectives Needing Attention", heading: HeadingLevel.HEADING_2 }),
  ];

  const headerCells = ["Rank", "Domain", "Objective", "Not Yet", "Emerging", "Achieved"]
    .map((t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] }));
  const rows = [new TableRow({ children: headerCells })];
  for (const r of entry.rows.slice(0, TOP_N)) {
    rows.push(new TableRow({
      children: [String(r.rank), r.domain, r.objective, String(r.notYet), String(r.emerging), String(r.achieved)]
        .map((t) => new TableCell({ children: [new Paragraph(t)] })),
    }));
  }
  children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  children.push(new Paragraph({ text: "Objectives and Strategies", heading: HeadingLevel.HEADING_2 }));
  entry.rows.slice(0, TOP_N).forEach((r, i) => {
    children.push(new Paragraph({ text: `Objective ${i + 1}: ${r.objective}`, heading: HeadingLevel.HEADING_3 }));
    children.push(new Paragraph(`Domain: ${r.domain}`));
    children.push(new Paragraph(`Students — Not Yet: ${r.notYet}, Emerging: ${r.emerging}, Achieved: ${r.achieved}`));
    const strat = entry.strategies?.[i] || [];
    if (strat.length === 0) {
      children.push(new Paragraph("No strategies generated."));
    }
    strat.forEach((s, j) => {
      children.push(new Paragraph({ text: `${j + 1}. ${s}`, spacing: { after: 120 } }));
    });
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(titleBits || entry.name).replace(/[^\w\- ]+/g, "")} analysis.docx`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ===== datalists & boot =====
function fillDatalist(id, values) {
  const dl = document.getElementById(id);
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    dl.appendChild(opt);
  }
}
fillDatalist("centre-list", CENTRES);
fillDatalist("class-list", CLASSES);
fillDatalist("quarter-list", QUARTERS);

if (getPassword()) showApp();
else showGate();

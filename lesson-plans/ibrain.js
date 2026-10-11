"use strict";
// iBrain Lesson Plans tab. Shares API_URL, getPassword, showGate, $, el and globalError with app.js.

(() => {
  const STORE_KEY = "ibrain_lessons_v1";
  const CONCURRENCY = 3;
  const SESSIONS = [1, 2, 3];
  const SESSION_ID = { 1: "IB01", 2: "IB02", 3: "IB03" };
  const STRUCTURE = [
    { id: "IB01", name: "Lesson A: The Narrative & Connection to Story", steps: [["Tuning In", 5], ["Storytelling", 10], ["Role Play", 5], ["Cleaning Up", 3], ["Cooling Down", 2], ["Wrap Up", 5]] },
    { id: "IB02", name: "Lesson B: Sensory Construction - Art & Craft / Tuff Tray", steps: [["Tuning In", 3], ["Storytelling", 4], ["Art & Craft / Tuffy Play", 13], ["Cleaning Up", 3], ["Cooling Down", 2], ["Wrap Up", 5]] },
    { id: "IB03", name: "Lesson C: Sensory Construction - Art & Craft / Tuff Tray (groups swap)", steps: [["Tuning In", 3], ["Storytelling", 4], ["Art & Craft / Tuffy Play", 13], ["Cleaning Up", 3], ["Cooling Down", 2], ["Wrap Up", 5]] },
  ];
  const LINK_CLASS = {
    "Objective 1 (Communication & Language)": "chip-ll",
    "Objective 2 (SEC)": "chip-sec",
    "Objective 3 (Learning Domain)": "chip-dom",
    "Objective 4 (ACE - Art & Craft)": "chip-ace",
    Disposition: "chip-disp",
    "Working Memory": "chip-ef",
    "Inhibitory Control": "chip-ef",
    "Cognitive Flexibility": "chip-ef",
  };

  const levelSel = $("#ib-level"), weeksSel = $("#ib-weeks");
  const termEl = $("#ib-term"), resultsEl = $("#ib-results");
  const terms = {};
  const pending = new Map(); // key -> "queued" | "busy" | error message
  let store = loadStore();

  // ===== tabs =====
  const tabs = [$("#tab-cd"), $("#tab-ib")];
  const SUBTITLES = {
    "tab-cd": "Choose a level, language and topic to generate ready-to-teach lesson plans.",
    "tab-ib": "Story-driven Tuff Tray lessons for 2 and 3 year olds: 3 x 30-minute lessons a week, built on the iBrain template.",
  };
  function selectTab(tab) {
    for (const t of tabs) {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute("aria-controls")}`).classList.toggle("hidden", !on);
    }
    $("#mode-subtitle").textContent = SUBTITLES[tab.id];
    sessionStorage.setItem("lp_tab", tab.id);
    if (tab.id === "tab-ib" && getPassword()) loadTerm(levelSel.value);
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  // ===== storage =====
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  }
  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { globalError("Browser storage is full; lessons will not survive a reload."); }
  }
  const key = (level, week, session) => `${level}-${week}-${session}`;
  const levelLessons = (level) => Object.keys(store).filter((k) => k.startsWith(`${level}-`)).length;

  // ===== api =====
  async function api(request) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: getPassword(), request: { mode: "ibrain", ...request } }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { showGate("Session expired. Please enter the password again."); throw new Error("Incorrect password"); }
    if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
    return data;
  }

  async function loadTerm(level) {
    if (!terms[level]) {
      termEl.replaceChildren(el("p", "muted", "Loading term plan…"));
      try {
        terms[level] = (await api({ action: "term", levelKey: level })).term;
      } catch (e) {
        termEl.replaceChildren(el("div", "error-banner", `Could not load the term plan: ${e.message}`));
        return;
      }
    }
    if (levelSel.value !== level) return;
    fillWeeks(planFor(level));
    renderTerm(planFor(level));
    renderResults();
  }

  function fillWeeks(term) {
    const prev = weeksSel.value;
    weeksSel.replaceChildren();
    for (const w of term.weeks) {
      const o = el("option", null, `Week ${w.week}: ${w.title} (3 lessons)`);
      o.value = String(w.week);
      weeksSel.appendChild(o);
    }
    const all = el("option", null, `Whole Term ${termNo(term)} (8 weeks, 24 lessons)`);
    all.value = "all";
    weeksSel.appendChild(all);
    if ([...weeksSel.options].some((o) => o.value === prev)) weeksSel.value = prev;
  }

  levelSel.value = localStorage.getItem("ibrain_level") || "pn";
  levelSel.addEventListener("change", () => {
    localStorage.setItem("ibrain_level", levelSel.value);
    loadTerm(levelSel.value);
  });

  // ===== generation queue =====
  const queue = [];
  let running = 0;

  function enqueue(level, week, session) {
    const k = key(level, week, session);
    if (pending.get(k) === "busy" || pending.get(k) === "queued") return;
    pending.set(k, "queued");
    queue.push({ level, week, session });
  }

  function pump() {
    while (running < CONCURRENCY && queue.length) {
      const job = queue.shift();
      const k = key(job.level, job.week, job.session);
      pending.set(k, "busy");
      running++;
      renderWeek(job.level, job.week);
      api({ levelKey: job.level, week: job.week, session: job.session, ...(edits[job.level] ? { plan: edits[job.level] } : {}) })
        .then((data) => {
          store[k] = data.lesson;
          saveStore();
          pending.delete(k);
        })
        .catch((e) => {
          if (!/providers are busy|quota|rate limit/i.test(e.message)) { pending.set(k, e.message); return; }
          // Out of AI quota: stop hammering the providers; queued lessons wait for a manual retry.
          const msg = "The free AI limit has been reached for now. Saved lessons are kept; press Retry in a little while (daily limits reset overnight).";
          pending.set(k, msg);
          for (const j of queue.splice(0)) {
            pending.set(key(j.level, j.week, j.session), msg);
            renderWeek(j.level, j.week);
          }
        })
        .finally(() => {
          running--;
          renderWeek(job.level, job.week);
          updateButtons();
          pump();
        });
    }
    updateButtons();
  }

  $("#ib-generate").addEventListener("click", () => {
    const level = levelSel.value, term = terms[level] && planFor(level);
    if (!term) return;
    const weeks = weeksSel.value === "all" ? term.weeks.map((w) => w.week) : [Number(weeksSel.value)];
    for (const w of weeks) for (const s of SESSIONS) enqueue(level, w, s);
    renderResults();
    pump();
    document.getElementById(`ib-week-${level}-${weeks[0]}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#ib-clear").addEventListener("click", () => {
    const level = levelSel.value;
    if (!confirm(`Remove all saved ${terms[level]?.shortLabel || ""} iBrain lessons from this browser?`)) return;
    for (const k of Object.keys(store)) if (k.startsWith(`${level}-`)) delete store[k];
    saveStore();
    renderResults();
  });

  // Button state follows the selected level only; other levels keep generating in the background.
  function updateButtons() {
    const level = levelSel.value;
    const has = levelLessons(level) > 0;
    const left = [...pending].filter(([k, v]) => k.startsWith(`${level}-`) && (v === "busy" || v === "queued")).length;
    $("#ib-pptx").disabled = !has || left > 0;
    $("#ib-clear").disabled = !has || left > 0;
    $("#ib-generate").textContent = left ? `Generating… ${left} lesson${left > 1 ? "s" : ""} left` : "Generate lesson plans";
    $("#ib-generate").disabled = left > 0;
  }

  // ===== term overview =====
  function svgBox(svg, cls, label) {
    const d = el("div", cls);
    d.innerHTML = svg;
    if (label) d.setAttribute("aria-label", label);
    return d;
  }

  function table(headers, rows) {
    const t = el("table", "ib-grid");
    const tr = el("tr");
    headers.forEach((h) => tr.appendChild(el("th", null, h)));
    t.appendChild(el("thead")).appendChild(tr);
    const tb = el("tbody");
    for (const r of rows) {
      const row = el("tr");
      for (const c of r) {
        const td = el("td");
        if (c instanceof Node) td.appendChild(c); else td.textContent = c;
        row.appendChild(td);
      }
      tb.appendChild(row);
    }
    t.appendChild(tb);
    return t;
  }

  // ===== term plan (editable) =====
  const EDITS_KEY = "ibrain_plan_edits_v1";
  let edits = (() => { try { return JSON.parse(localStorage.getItem(EDITS_KEY)) || {}; } catch { return {}; } })();
  let editing = false;
  const planFor = (level) => edits[level] || terms[level];
  const termNo = (plan) => plan.term || 1;

  // Illustrations are drawn for the built-in stories, so hide any whose story/set-up text was edited.
  function weekArtOk(level, week) {
    if (!edits[level]) return true;
    const d = terms[level], p = edits[level], a = d.weeks[week - 1], b = p.weeks[week - 1];
    return d.story === p.story && a.title === b.title && a.storyBite === b.storyBite;
  }
  function blockArtOk(level, i) {
    if (!edits[level]) return true;
    const d = terms[level], p = edits[level], a = d.blocks[i], b = p.blocks[i];
    return d.story === p.story && a.title === b.title && a.setup === b.setup && a.addOn === b.addOn;
  }
  const artHidden = () => el("p", "ib-art-hidden", "Illustration hidden because this part of the plan was edited. Reset the plan to restore the original artwork.");

  function ed(path, text, cls, tag = "span", list = false) {
    const n = el(tag, cls, list ? text.join(", ") : String(text));
    if (editing) {
      n.contentEditable = "plaintext-only";
      n.classList.add("ib-editable");
      n.dataset.path = path;
      if (list) n.dataset.list = "1";
      n.setAttribute("role", "textbox");
      n.setAttribute("aria-label", `Edit ${path.replace(/\./g, " ")}`);
    }
    return n;
  }
  const span = (...parts) => {
    const d = el("div");
    parts.forEach((x) => d.appendChild(typeof x === "string" ? document.createTextNode(x) : x));
    return d;
  };
  function efCell(w, wi) {
    if (!editing) return w.ef.join(" / ");
    const d = el("div", "ib-ef-edit");
    w.ef.forEach((v, j) => {
      const sel = el("select");
      sel.dataset.path = `weeks.${wi}.ef.${j}`;
      sel.setAttribute("aria-label", `Week ${w.week} IB0${j + 1} EF focus`);
      for (const o of ["Working Memory", "Inhibitory Control", "Cognitive Flexibility"]) {
        const opt = el("option", null, `IB0${j + 1}: ${o}`);
        opt.value = o;
        opt.selected = o === v;
        sel.appendChild(opt);
      }
      d.appendChild(sel);
    });
    return d;
  }

  function setPath(obj, path, value) {
    const parts = path.split(".");
    let o = obj;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = value;
  }

  function saveEdits(level) {
    const plan = JSON.parse(JSON.stringify(planFor(level)));
    for (const n of termEl.querySelectorAll("[data-path]")) {
      let v = n.tagName === "SELECT" ? n.value : n.textContent.replace(/\s+/g, " ").trim();
      if (n.dataset.list) v = v.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
      if (n.dataset.path === "term") v = Math.min(4, Math.max(1, parseInt(v, 10) || termNo(plan)));
      if (Array.isArray(v) ? v.length : v !== "") setPath(plan, n.dataset.path, v);
    }
    if (JSON.stringify(plan) === JSON.stringify(terms[level])) delete edits[level]; else edits[level] = plan;
    localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
  }

  function editBar(level) {
    const bar = el("div", "ib-edit-bar");
    const btn = (label, cls, fn) => { const b = el("button", cls, label); b.addEventListener("click", fn); bar.appendChild(b); };
    const rerender = () => { fillWeeks(planFor(level)); renderTerm(planFor(level)); renderResults(); };
    if (editing) {
      btn("Save changes", null, () => { saveEdits(level); editing = false; rerender(); });
      btn("Cancel", "ghost-btn", () => { editing = false; rerender(); });
      bar.appendChild(el("span", "muted", "Click any underlined text to change it. Separate list items with commas."));
    } else {
      btn("Edit term plan", "ghost-btn", () => { editing = true; renderTerm(planFor(level)); });
      if (edits[level]) {
        btn("Reset to original plan", "ghost-btn", () => {
          if (!confirm("Discard your edits and restore the original term plan?")) return;
          delete edits[level];
          localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
          rerender();
        });
      }
    }
    return bar;
  }

  function renderTerm(term) {
    const level = term.level;
    const wrap = el("section", "ib-overview");
    const head = el("div", "ib-overview-head");
    const h2 = el("h2");
    h2.append(`${term.shortLabel} Term `, ed("term", termNo(term)), ": ", ed("story", term.story));
    head.appendChild(h2);
    const by = el("p", "muted");
    by.append("by ", ed("author", term.author), ` · ${term.levelLabel}`);
    head.appendChild(by);
    head.appendChild(editBar(level));
    if (edits[level] && !editing) head.appendChild(el("p", "ib-edited-note", "You are using an edited plan. New lessons follow your changes; lessons already generated keep the plan they were written with."));
    const facts = el("dl", "ib-facts");
    for (const [k, path, v, list] of [
      ["Wondering", "wondering", term.wondering],
      ["Connection", "connection", term.connection],
      ["Character values (CDP)", "cdpValues", term.cdpValues, true],
      ["Focus", "focus", term.focus],
      ["Language exposure", "languageExposure", term.languageExposure],
    ]) {
      facts.appendChild(el("dt", null, k));
      facts.appendChild(ed(path, v, null, "dd", list));
    }
    head.appendChild(facts);
    wrap.appendChild(head);

    const struct = el("details", "ib-details");
    struct.open = levelLessons(level) === 0 && !editing;
    struct.appendChild(el("summary", null, "Weekly lesson structure (3 x 30 mins)"));
    const cols = el("div", "ib-structure");
    for (const s of STRUCTURE) {
      const c = el("div", "ib-structure-col");
      c.appendChild(el("h4", null, s.id));
      c.appendChild(el("p", "muted", s.name));
      const ol = el("ol");
      for (const [n, m] of s.steps) ol.appendChild(el("li", null, `${n} (${m} mins)`));
      ol.appendChild(el("li", null, "Rehearse and Retrieve (routines)"));
      c.appendChild(ol);
      cols.appendChild(c);
    }
    struct.appendChild(cols);
    struct.appendChild(el("p", "muted", "IB02 and IB03: 18 children in two groups of 9 run Art & Craft and Tuff Tray at the same time with one teacher each, then swap in IB03 so every child does both. Each tuff tray set-up stays for 2 weeks; week 2 only adds on."));
    wrap.appendChild(struct);

    const trayD = el("details", "ib-details");
    trayD.open = levelLessons(level) === 0 || editing;
    trayD.appendChild(el("summary", null, "Tuff tray plan (4 set-ups x 2 weeks)"));
    trayD.appendChild(table(
      ["Weeks", "Focus & wondering", "Set-up (week 1) and add-on (week 2)", "Outcomes", "Vision"],
      term.blocks.map((b, i) => {
        const focus = el("div");
        focus.appendChild(ed(`blocks.${i}.title`, b.title, null, "strong"));
        focus.appendChild(ed(`blocks.${i}.focus`, b.focus, null, "p"));
        const wq = el("p", "ib-wonder", "Wondering: ");
        wq.appendChild(ed(`blocks.${i}.wondering`, b.wondering));
        focus.appendChild(wq);
        const setup = el("div");
        setup.appendChild(ed(`blocks.${i}.setup`, b.setup, null, "p"));
        setup.appendChild(ed(`blocks.${i}.addOn`, b.addOn, "ib-addon", "p"));
        const sf = el("p", "muted", "Safety: ");
        sf.appendChild(ed(`blocks.${i}.safety`, b.safety));
        setup.appendChild(sf);
        const vision = blockArtOk(level, i) ? svgBox(IBArt.tray(b, 2), "ib-thumb", `Tuff tray vision: ${b.title}`) : artHidden();
        return [`${b.weeks[0]}-${b.weeks[1]}`, focus, setup, b.outcomes.join("\n"), vision];
      }),
    ));
    wrap.appendChild(trayD);

    const mapD = el("details", "ib-details");
    mapD.open = levelLessons(level) === 0 || editing;
    mapD.appendChild(el("summary", null, `Term ${termNo(term)} activity map (week by week)`));
    mapD.appendChild(table(
      ["Week", "Story bite & language", "SEC value & codes", "Role play (IB01)", "Art & craft (IB02/IB03)", "EF focus IB01 / 02 / 03"],
      term.weeks.map((w, i) => [
        span(`${w.week}. `, ed(`weeks.${i}.title`, w.title)),
        span(ed(`weeks.${i}.storyBite`, w.storyBite, null, "p"),
          span(el("strong", null, "Key language: "), ed(`weeks.${i}.keyLanguage`, w.keyLanguage, null, "span", true)),
          span(el("strong", null, "Song: "), ed(`weeks.${i}.song`, w.song))),
        span(ed(`weeks.${i}.secValue`, w.secValue, null, "p"),
          span("SEC: ", ed(`weeks.${i}.secCode`, w.secCode, "ib-code")),
          span("C&L: ", ed(`weeks.${i}.llCode`, w.llCode, "ib-code"))),
        ed(`weeks.${i}.rolePlay`, w.rolePlay, null, "div"),
        span(ed(`weeks.${i}.artCraft.title`, w.artCraft.title, null, "strong"), ": ", ed(`weeks.${i}.artCraft.description`, w.artCraft.description)),
        efCell(w, i),
      ]),
    ));
    wrap.appendChild(mapD);
    if (editing) wrap.appendChild(editBar(level));
    termEl.replaceChildren(wrap);
    updateButtons();
  }

  // ===== results =====
  function renderResults() {
    const level = levelSel.value, term = terms[level] && planFor(level);
    if (!term) return;
    resultsEl.replaceChildren();
    for (const w of term.weeks) {
      const any = SESSIONS.some((s) => store[key(level, w.week, s)] || pending.has(key(level, w.week, s)));
      if (any) resultsEl.appendChild(weekSection(term, w));
    }
    updateButtons();
  }

  function renderWeek(level, week) {
    if (levelSel.value !== level || !terms[level]) return;
    const existing = document.getElementById(`ib-week-${level}-${week}`);
    const fresh = weekSection(planFor(level), planFor(level).weeks[week - 1]);
    if (existing) existing.replaceWith(fresh); else renderResults();
  }

  function blockFor(term, week) {
    return term.blocks.find((b) => week >= b.weeks[0] && week <= b.weeks[1]);
  }

  function weekSection(term, w) {
    const sec = el("section", "ib-week");
    sec.id = `ib-week-${term.level}-${w.week}`;
    const block = blockFor(term, w.week);
    const head = el("div", "ib-week-head");
    head.appendChild(el("h2", null, `Week ${w.week}: ${w.title}`));
    head.appendChild(el("p", "muted", `${w.secValue} · Tuff tray: ${block.title} (${w.week === block.weeks[0] ? "base set-up" : "set-up + add-on"})`));
    sec.appendChild(head);

    const res = el("div", "ib-resources");
    const sc = el("figure", "ib-figure");
    const artOk = weekArtOk(term.level, w.week);
    sc.appendChild(artOk ? svgBox(IBArt.scene(w.scene), "ib-art", `A3 scene card: ${w.scene.title}`) : artHidden());
    const cap = el("figcaption");
    cap.appendChild(el("strong", null, "A3 scene card for picture talk"));
    const ul = el("ul");
    w.scene.prompts.forEach((p) => ul.appendChild(el("li", null, p)));
    cap.appendChild(ul);
    sc.appendChild(cap);
    res.appendChild(sc);

    const tf = el("figure", "ib-figure");
    tf.appendChild(blockArtOk(term.level, term.blocks.indexOf(block))
      ? svgBox(IBArt.tray(block, w.week === block.weeks[0] ? 1 : 2), "ib-art", `Tuff tray vision: ${block.title}`)
      : artHidden());
    const tcap = el("figcaption");
    tcap.appendChild(el("strong", null, `Tuff tray vision: ${block.title}`));
    tcap.appendChild(el("p", null, `Wondering: ${block.wondering}`));
    tf.appendChild(tcap);
    res.appendChild(tf);
    sec.appendChild(res);

    const words = el("div", "ib-words");
    words.setAttribute("aria-label", "Word cards");
    if (artOk) w.words.forEach((wd, i) => words.appendChild(svgBox(IBArt.wordCard(wd, i), "ib-word", `Word card: ${wd.word}`)));
    const wl = el("p", "ib-words-label", `Word cards · key language: ${w.keyLanguage.join(", ")}`);
    sec.appendChild(wl);
    sec.appendChild(words);

    for (const s of SESSIONS) sec.appendChild(lessonSlot(term, w.week, s));
    return sec;
  }

  function lessonSlot(term, week, session) {
    const k = key(term.level, week, session);
    const lesson = store[k], state = pending.get(k);
    if (state === "busy" || state === "queued") {
      const d = el("div", "ib-lesson ib-lesson-pending");
      d.appendChild(el("span", "spinner"));
      d.appendChild(document.createTextNode(`${SESSION_ID[session]}: ${state === "busy" ? "writing this lesson…" : "waiting in queue…"}`));
      return d;
    }
    if (state && !lesson) {
      const d = el("div", "ib-lesson");
      d.appendChild(el("div", "error-banner", `${SESSION_ID[session]} failed: ${state}`));
      const b = el("button", "ghost-btn", `Retry ${SESSION_ID[session]}`);
      b.addEventListener("click", () => { pending.delete(k); enqueue(term.level, week, session); pump(); });
      d.appendChild(b);
      return d;
    }
    if (!lesson) {
      const d = el("div", "ib-lesson ib-lesson-pending");
      const b = el("button", "ghost-btn", `Generate ${SESSION_ID[session]}`);
      b.addEventListener("click", () => { enqueue(term.level, week, session); pump(); });
      d.appendChild(b);
      return d;
    }
    return lessonCard(lesson, term, week, session, state);
  }

  const chip = (text, cls) => el("span", `ib-chip ${cls || ""}`, text);

  function row(tbl, label, content, label2, content2) {
    const tr = el("tr");
    tr.appendChild(el("th", null, label));
    const td = el("td");
    if (label2) {
      td.appendChild(content);
      tr.appendChild(td);
      tr.appendChild(el("th", null, label2));
      const td2 = el("td");
      td2.appendChild(content2);
      tr.appendChild(td2);
    } else {
      td.colSpan = 3;
      td.appendChild(content);
      tr.appendChild(td);
    }
    tbl.appendChild(tr);
  }

  function frag(...nodes) {
    const f = document.createDocumentFragment();
    nodes.filter(Boolean).forEach((n) => f.appendChild(typeof n === "string" ? document.createTextNode(n) : n));
    return f;
  }

  function lessonCard(l, term, week, session, error) {
    const art = el("article", "ib-lesson");
    const head = el("header", "ib-lesson-head");
    const titles = el("div");
    titles.appendChild(el("h3", null, l.title));
    titles.appendChild(el("p", "ib-lesson-sub", `${l.lessonTypeName} · ${l.lessonTitle}`));
    head.appendChild(titles);
    const regen = el("button", "ghost-btn", "Regenerate");
    regen.addEventListener("click", () => { enqueue(term.level, week, session); pump(); });
    head.appendChild(regen);
    art.appendChild(head);
    if (error) art.appendChild(el("div", "error-banner", `Regeneration failed (showing the saved version): ${error}`));

    const t = el("table", "ib-table");
    row(t, "Wondering", frag(l.wondering, l.trayWondering && el("span", "ib-wonder", ` Tuff tray: ${l.trayWondering}`)));
    row(t, "Suggested Duration", frag(l.duration), "Learning Domain", frag(l.learningDomains.join(", ")));
    const ef = el("ul", "ib-ef");
    l.efSkills.forEach((e) => { const li = el("li"); li.appendChild(el("strong", null, `${e.skill}: `)); li.appendChild(document.createTextNode(e.how)); ef.appendChild(li); });
    row(t, "Disposition (PRAISE)", frag(el("strong", null, l.disposition.name), el("br"), l.disposition.description), "Executive Functioning Skills", ef);
    const ol = el("ol", "ib-objectives");
    const objCls = ["chip-ll", "chip-sec", "chip-dom", "chip-ace"];
    l.objectives.forEach((o, i) => {
      const li = el("li");
      li.appendChild(chip(o.label, objCls[i]));
      li.appendChild(document.createTextNode(` ${o.text} `));
      li.appendChild(el("span", "ib-code", `(${o.code})`));
      if (o.goal) li.appendChild(el("span", "ib-goal", `Learning goal: ${o.goal}`));
      ol.appendChild(li);
    });
    row(t, "Lesson Objectives", frag(el("p", "ib-cwbat", "Children will be able to:"), ol));
    if (l.groupRotation) row(t, "Group Organisation", frag(l.groupRotation, el("br"), el("span", "ib-addon", l.trayStage)));

    for (const s of l.steps) {
      const c = el("div");
      const mat = el("p", "ib-mat");
      mat.appendChild(el("strong", null, "Materials / Resources: "));
      mat.appendChild(document.createTextNode(s.materials.length ? s.materials.join("; ") : "None needed"));
      c.appendChild(mat);
      const pl = el("ul", "ib-proc");
      for (const p of s.process) {
        const li = el("li");
        const m = p.match(/^(Tuff Tray|Art & Craft):\s*(.*)$/i);
        if (m) { li.appendChild(chip(m[1], m[1].toLowerCase().startsWith("tuff") ? "chip-tray" : "chip-art")); li.appendChild(document.createTextNode(` ${m[2]}`)); } else li.textContent = p;
        pl.appendChild(li);
      }
      c.appendChild(pl);
      if (s.intentional.length) {
        const il = el("ul", "ib-intent");
        for (const x of s.intentional) {
          const li = el("li");
          li.appendChild(chip(x.link, LINK_CLASS[x.link]));
          li.appendChild(document.createTextNode(` ${x.how}`));
          il.appendChild(li);
        }
        c.appendChild(il);
      }
      row(t, `${s.name} (${s.minutes} mins)`, c);
    }
    row(t, "Rehearse and Retrieve", frag(el("strong", null, "Teacher Prompt: "), l.rehearseRetrieve.teacherPrompt, el("br"), el("strong", null, "Extension: "), l.rehearseRetrieve.extension));
    row(t, "Differentiation", frag(el("strong", null, "Support: "), l.differentiation.support, el("br"), el("strong", null, "Stretch: "), l.differentiation.stretch));
    const lf = el("ul", "ib-check");
    l.lookFors.forEach((x) => lf.appendChild(el("li", null, x)));
    row(t, "Look-fors (observation)", lf);
    const scroll = el("div", "ib-table-wrap");
    scroll.appendChild(t);
    art.appendChild(scroll);
    return art;
  }

  // ===== PowerPoint export (mirrors the Y2027 iBrain A4 portrait template) =====
  async function dataUrl(path) {
    const blob = await (await fetch(path)).blob();
    return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  }

  const P = { face: "Arial", size: 9, label: "F2F2F2", border: { type: "solid", pt: 0.75, color: "000000" } };
  const cellL = (text) => ({ text, options: { bold: true, fill: { color: P.label }, valign: "top" } });
  const runs = (parts) => parts.flatMap((p, i) => {
    const t = typeof p === "string" ? { text: p, options: {} } : p;
    return [{ text: t.text, options: { ...t.options, breakLine: i < parts.length - 1 } }];
  });

  function lessonRows(l) {
    const rows = [[{ text: l.title, options: { colspan: 4, bold: true, fontSize: 16, border: { type: "none" } } }]];
    const span3 = (parts) => ({ text: runs(parts), options: { colspan: 3, valign: "top" } });
    rows.push([cellL("Wondering"), span3([l.wondering + (l.trayWondering ? `  |  Tuff tray: ${l.trayWondering}` : "")])]);
    rows.push([cellL("Suggested Duration"), { text: l.duration }, cellL("Learning Domain"), { text: l.learningDomains.join(", ") }]);
    rows.push([
      cellL("Disposition (PRAISE)"),
      { text: runs([{ text: l.disposition.name, options: { bold: true } }, l.disposition.description]) },
      cellL("Executive Functioning Skills"),
      { text: runs(l.efSkills.map((e) => ({ text: `${e.skill}: ${e.how}` }))) },
    ]);
    rows.push([cellL("Lesson Objectives"), span3([
      { text: "Children will be able to:", options: { bold: true } },
      ...l.objectives.map((o, i) => `${i + 1}. [${o.label}] ${o.text} (${o.code})${o.goal ? ` | Learning goal: ${o.goal}` : ""}`),
    ])]);
    if (l.groupRotation) rows.push([cellL("Group Organisation"), span3([l.groupRotation, { text: l.trayStage, options: { italic: true } }])]);
    for (const s of l.steps) {
      rows.push([cellL(`${s.name}\n(${s.minutes} mins)`), span3([
        { text: `Materials / Resources: ${s.materials.length ? s.materials.join("; ") : "None needed"}`, options: { bold: true } },
        ...s.process.map((p) => `• ${p}`),
        ...s.intentional.map((x) => ({ text: `▸ ${x.link}: ${x.how}`, options: { italic: true, color: "1C5CAB" } })),
      ])]);
    }
    rows.push([cellL("Rehearse and Retrieve"), span3([`Teacher Prompt: ${l.rehearseRetrieve.teacherPrompt}`, `Extension: ${l.rehearseRetrieve.extension}`])]);
    rows.push([cellL("Differentiation"), span3([`Support: ${l.differentiation.support}`, `Stretch: ${l.differentiation.stretch}`])]);
    rows.push([cellL("Look-fors"), span3(l.lookFors.map((x) => `☐ ${x}`))]);
    return rows;
  }

  const TABLE_OPTS = {
    x: 0.35, y: 1.0, w: 6.8, colW: [1.3, 2.3, 1.3, 1.9], fontFace: P.face, fontSize: P.size, color: "000000",
    border: P.border, valign: "top", margin: 4, autoPage: false,
  };
  const PAGE_H = 10.83 - 1.0 - 0.8; // between the master's top and footer

  // pptxgenjs' own auto-paging misjudges heights badly, so rows are measured and packed here.
  const paras = (cell) => {
    const t = typeof cell === "string" ? cell : cell.text;
    if (typeof t === "string") return t.split("\n");
    return t.map((r) => r.text);
  };
  function cellH(cell, widthIn, fontSize) {
    const cpl = Math.max(8, Math.floor((widthIn - 0.12) * 72 / (fontSize * 0.5)));
    const lines = paras(cell).reduce((n, p) => n + Math.max(1, Math.ceil(p.length / cpl)), 0);
    return lines * fontSize * 1.22 / 72 + 0.14;
  }
  function rowH(row, colW, fontSize) {
    let col = 0, h = 0;
    for (const c of row) {
      const span = (c.options && c.options.colspan) || 1;
      const w = colW.slice(col, col + span).reduce((a, b) => a + b, 0);
      h = Math.max(h, cellH(c, w, (c.options && c.options.fontSize) || fontSize));
      col += span;
    }
    return h;
  }
  // Split a [label, span3-runs] row so its first part fits in `room` inches.
  function splitRow(row, colW, fontSize, room) {
    const [label, body] = row;
    if (row.length !== 2 || !Array.isArray(body.text) || body.text.length < 2) return null;
    const w = colW.slice(1).reduce((a, b) => a + b, 0);
    let k = 1;
    while (k < body.text.length && cellH({ text: body.text.slice(0, k + 1) }, w, fontSize) <= room) k++;
    if (cellH({ text: body.text.slice(0, k) }, w, fontSize) > room) return null;
    const fix = (runs) => runs.map((r, i) => ({ text: r.text, options: { ...r.options, breakLine: i < runs.length - 1 } }));
    const contLabel = { ...label, text: `${String(label.text).split("\n")[0]}\n(cont.)` };
    return [[label, { ...body, text: fix(body.text.slice(0, k)) }], [contLabel, { ...body, text: fix(body.text.slice(k)) }]];
  }
  function paginate(rows, headerRows, colW, fontSize) {
    const head = rows.slice(0, headerRows), body = rows.slice(headerRows);
    const headH = head.reduce((a, r) => a + rowH(r, colW, fontSize), 0);
    const pages = [];
    let cur = [], used = headH;
    while (body.length) {
      const r = body.shift(), h = rowH(r, colW, fontSize);
      if (used + h <= PAGE_H) { cur.push(r); used += h; continue; }
      const parts = splitRow(r, colW, fontSize, PAGE_H - used);
      if (parts && PAGE_H - used > 0.8) { cur.push(parts[0]); body.unshift(parts[1]); }
      else if (!cur.length) { cur.push(r); used += h; continue; } // a lone oversized row still gets its own page
      else body.unshift(r);
      pages.push(cur); cur = []; used = headH;
    }
    if (cur.length) pages.push(cur);
    return pages.map((p) => [...head, ...p]);
  }
  function addPagedTable(add, rows, opts = {}, headerRows = 1) {
    const o = { ...TABLE_OPTS, ...opts };
    for (const chunk of paginate(rows, headerRows, o.colW, o.fontSize)) add().addTable(chunk, { ...o });
  }

  async function exportPptx() {
    const level = levelSel.value, term = planFor(level);
    const lessons = Object.entries(store).filter(([k]) => k.startsWith(`${level}-`)).map(([, v]) => v)
      .sort((a, b) => a.week - b.week || a.session - b.session);
    if (!lessons.length) return;
    const btn = $("#ib-pptx");
    btn.disabled = true;
    btn.textContent = "Building PowerPoint…";
    try {
      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: "A4P", width: 7.5, height: 10.83 });
      pptx.layout = "A4P";
      const logo = await dataUrl("agape-logo.png");
      pptx.defineSlideMaster({
        title: "IBRAIN",
        background: { color: "FFFFFF" },
        margin: [1.0, 0.35, 0.75, 0.35],
        objects: [
          { image: { x: 6.15, y: 0.18, w: 1.05, h: 0.68, data: logo } },
          { text: { text: "© 2026 AGAPE Little Uni.            iBrain Lesson Plan", options: { x: 0.35, y: 10.35, w: 5.5, h: 0.3, fontFace: P.face, fontSize: 8, color: "333333" } } },
        ],
        slideNumber: { x: 6.75, y: 10.35, w: 0.4, h: 0.3, fontFace: P.face, fontSize: 8, color: "777777" },
      });
      const add = () => pptx.addSlide({ masterName: "IBRAIN" });

      const cover = add();
      cover.addImage({ data: logo, x: 2.25, y: 1.6, w: 3.0, h: 1.93 });
      cover.addText(`iBrain\n\n${term.shortLabel}\nTerm ${termNo(term)}\nLesson Plans`, { x: 0.5, y: 4.0, w: 6.5, h: 3.2, align: "center", fontFace: P.face, fontSize: 32, bold: true, color: "000000" });
      cover.addText(`${term.story} by ${term.author}`, { x: 0.5, y: 7.4, w: 6.5, h: 0.5, align: "center", fontFace: P.face, fontSize: 14, italic: true });

      const ov = add();
      ov.addText(`${term.shortLabel} Term ${termNo(term)} Overview`, { x: 0.35, y: 0.4, w: 5.6, h: 0.45, fontFace: P.face, fontSize: 18, bold: true });
      ov.addTable([
        [cellL("Wondering"), { text: term.wondering }],
        [cellL("Story"), { text: `${term.story} by ${term.author}` }],
        [cellL("Connection"), { text: term.connection }],
        [cellL("Character values (CDP)"), { text: term.cdpValues.join(", ") }],
        [cellL("Focus"), { text: term.focus }],
        [cellL("Language exposure"), { text: term.languageExposure }],
        [cellL("Lesson structure"), { text: runs(STRUCTURE.map((s) => `${s.id} ${s.name}: ${s.steps.map(([n, m]) => `${n} ${m}m`).join(" → ")} → Rehearse and Retrieve`)) }],
        [cellL("Class organisation"), { text: "18 children, 2 teachers. IB02/IB03: two groups of 9 run Art & Craft and Tuff Tray concurrently and swap in IB03. Each tuff tray set-up stays for 2 weeks; week 2 adds on." }],
      ], { ...TABLE_OPTS, colW: [1.6, 5.2] });

      addPagedTable(add, [
        [{ text: `iBrain Tuff Tray Plan Term ${termNo(term)} (${term.shortLabel})`, options: { colspan: 4, bold: true, fontSize: 16, border: { type: "none" } } }],
        [cellL("Weeks"), cellL("Focus & wondering"), cellL("Set-up and add-on"), cellL("Outcomes")],
        ...term.blocks.map((b) => [
          { text: `${b.weeks[0]}-${b.weeks[1]}` },
          { text: runs([{ text: b.title, options: { bold: true } }, b.focus, { text: `Wondering: ${b.wondering}`, options: { italic: true } }]) },
          { text: runs([b.setup, { text: b.addOn, options: { color: "B3125F" } }, `Safety: ${b.safety}`]) },
          { text: b.outcomes.join("\n") },
        ]),
      ], { colW: [0.6, 1.9, 3.1, 1.2] }, 2);

      addPagedTable(add, [
        [{ text: `Term ${termNo(term)} Activity Map (${term.shortLabel})`, options: { colspan: 5, bold: true, fontSize: 16, border: { type: "none" } } }],
        [cellL("Week"), cellL("Story bite"), cellL("SEC value / EF focus"), cellL("Role play (IB01)"), cellL("Art & craft (IB02/03)")],
        ...term.weeks.map((w) => [
          { text: `${w.week}. ${w.title}` },
          { text: w.storyBite },
          { text: `${w.secValue} (${w.secCode})\nEF: ${w.ef.join(" / ")}` },
          { text: w.rolePlay },
          { text: `${w.artCraft.title}: ${w.artCraft.description}` },
        ]),
      ], { colW: [0.9, 1.6, 1.2, 1.6, 1.5], fontSize: 8 }, 2);

      const weeks = [...new Set(lessons.map((l) => l.week))];
      for (const wk of weeks) {
        for (const l of lessons.filter((x) => x.week === wk)) addPagedTable(add, lessonRows(l));
        const w = term.weeks[wk - 1], block = blockFor(term, wk);
        const sceneOk = weekArtOk(level, wk), trayOk = blockArtOk(level, term.blocks.indexOf(block));
        if (!sceneOk && !trayOk) continue;
        const s1 = add();
        s1.addText(`${term.shortLabel} Term ${termNo(term)} iBrain Lesson ${wk} - Resources`, { x: 0.35, y: 0.4, w: 5.6, h: 0.45, fontFace: P.face, fontSize: 16, bold: true });
        if (sceneOk) {
          const sceneImg = await IBArt.toPng(IBArt.scene(w.scene));
          s1.addText("A3 scene card (print on A3 for picture talk)", { x: 0.35, y: 1.0, w: 6.8, h: 0.3, fontFace: P.face, fontSize: 11, bold: true });
          s1.addImage({ data: sceneImg.data, x: 0.35, y: 1.35, w: 6.8, h: (6.8 * sceneImg.h) / sceneImg.w });
          s1.addText(runs([{ text: "Picture talk questions:", options: { bold: true } }, ...w.scene.prompts.map((p) => `• ${p}`)]), { x: 0.35, y: 6.0, w: 6.8, h: 1.1, fontFace: P.face, fontSize: 10, valign: "top" });
        }
        if (trayOk) {
          const trayImg = await IBArt.toPng(IBArt.tray(block, wk === block.weeks[0] ? 1 : 2));
          s1.addText(`Tuff tray vision: ${block.title} (${wk === block.weeks[0] ? "base set-up" : "set-up + add-on"})`, { x: 0.35, y: 7.1, w: 6.8, h: 0.3, fontFace: P.face, fontSize: 11, bold: true });
          s1.addImage({ data: trayImg.data, x: 0.85, y: 7.4, w: 4.4, h: (4.4 * trayImg.h) / trayImg.w });
        }
        if (!sceneOk) continue;
        const s2 = add();
        s2.addText(`Week ${wk} word cards`, { x: 0.35, y: 0.4, w: 5.6, h: 0.45, fontFace: P.face, fontSize: 16, bold: true });
        for (let i = 0; i < w.words.length; i++) {
          const img = await IBArt.toPng(IBArt.wordCard(w.words[i], i));
          s2.addImage({ data: img.data, x: 0.45 + (i % 2) * 3.35, y: 1.1 + Math.floor(i / 2) * 2.7, w: 3.1, h: (3.1 * img.h) / img.w });
        }
      }
      await pptx.writeFile({ fileName: `iBrain ${term.shortLabel} Term ${termNo(term)} Lesson Plans.pptx` });
    } catch (e) {
      globalError(`PowerPoint export failed: ${e.message}`);
    } finally {
      btn.textContent = "Download PowerPoint (.pptx)";
      updateButtons();
    }
  }
  $("#ib-pptx").addEventListener("click", exportPptx);

  // ===== boot =====
  if (sessionStorage.getItem("lp_tab") === "tab-ib") selectTab($("#tab-ib"));
  document.addEventListener("app:unlocked", () => {
    if ($("#tab-ib").classList.contains("active")) loadTerm(levelSel.value);
  });
})();

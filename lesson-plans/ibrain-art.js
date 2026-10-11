"use strict";
// Vector illustrations for iBrain lessons: tuff tray set-up vision, A3 scene cards, word cards.
// Original artwork built from the Term 1 scaffold layouts (no copyrighted book art is reproduced).

const IBArt = (() => {
  const FONT = "Fredoka, 'Arial Rounded MT Bold', Nunito, Arial, sans-serif";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const RAINBOW = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#3949AB", "#8E24AA"];
  let uid = 0;

  // Deterministic pseudo-random so illustrations are identical on every render/export.
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function face(mood, r, ink = "#3D3229") {
    const e = r * 0.32, ey = -r * 0.15, w = r * 0.09;
    const eyes = `<circle cx="${-e}" cy="${ey}" r="${w * 1.2}" fill="${ink}"/><circle cx="${e}" cy="${ey}" r="${w * 1.2}" fill="${ink}"/>`;
    const m = r * 0.4, my = r * 0.3;
    const mouths = {
      happy: `<path d="M${-m} ${my - r * 0.1} Q0 ${my + r * 0.3} ${m} ${my - r * 0.1}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round"/>`,
      sad: `<path d="M${-m} ${my + r * 0.15} Q0 ${my - r * 0.2} ${m} ${my + r * 0.15}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round"/>`,
      angry: `<path d="M${-m} ${my + r * 0.1} L${m} ${my + r * 0.1}" stroke="${ink}" stroke-width="${w}" stroke-linecap="round"/><path d="M${-e * 1.6} ${ey - r * 0.32} L${-e * 0.5} ${ey - r * 0.16} M${e * 1.6} ${ey - r * 0.32} L${e * 0.5} ${ey - r * 0.16}" stroke="${ink}" stroke-width="${w}" stroke-linecap="round"/>`,
      scared: `<ellipse cx="0" cy="${my + r * 0.05}" rx="${r * 0.16}" ry="${r * 0.22}" fill="${ink}"/>`,
    };
    return eyes + (mouths[mood] || mouths.happy);
  }

  function fishShape(c, u, t) {
    const id = `f${uid++}`;
    let deco = "";
    if (t === "stripes") deco = [-0.5, -0.1, 0.3].map((x) => `<rect x="${x * u}" y="${-u}" width="${0.18 * u}" height="${2 * u}" fill="#fff" opacity=".7"/>`).join("");
    if (t === "spots") deco = [[-0.5, -0.2], [0, 0.25], [0.3, -0.25], [-0.2, 0.35]].map(([x, y]) => `<circle cx="${x * u}" cy="${y * u}" r="${0.13 * u}" fill="#fff" opacity=".75"/>`).join("");
    if (t === "shiny") deco = `<path d="M${-0.25 * u} 0 l${0.2 * u} ${-0.24 * u} l${0.2 * u} ${0.24 * u} l${-0.2 * u} ${0.24 * u}z" fill="url(#silver)" stroke="#fff" stroke-width="${0.04 * u}"/>${sparkle(-0.05 * u, -0.38 * u, 0.12 * u)}`;
    return `<clipPath id="${id}"><ellipse cx="0" cy="0" rx="${u}" ry="${0.62 * u}"/></clipPath>` +
      `<path d="M${0.85 * u} 0 L${1.45 * u} ${-0.5 * u} L${1.35 * u} 0 L${1.45 * u} ${0.5 * u}Z" fill="${c}" stroke="#3D3229" stroke-width="${0.05 * u}" stroke-linejoin="round"/>` +
      `<ellipse cx="0" cy="0" rx="${u}" ry="${0.62 * u}" fill="${c}" stroke="#3D3229" stroke-width="${0.05 * u}"/>` +
      `<g clip-path="url(#${id})">${deco}</g>` +
      `<circle cx="${-0.55 * u}" cy="${-0.12 * u}" r="${0.1 * u}" fill="#3D3229"/>` +
      `<path d="M${-0.85 * u} ${0.15 * u} q${0.12 * u} ${0.1 * u} ${0.22 * u} 0" fill="none" stroke="#3D3229" stroke-width="${0.05 * u}" stroke-linecap="round"/>`;
  }

  function sparkle(x, y, r) {
    return `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="#fff"/>`;
  }

  function rainbowFish(u, t) {
    const id = `rf${uid++}`;
    let scales = "";
    let i = 0;
    for (let row = -3; row <= 3; row++) {
      for (let col = -5; col <= 4; col++) {
        const x = col * 0.24 * u + (row % 2 ? 0.12 * u : 0), y = row * 0.2 * u;
        const silver = (row === 0 && col === -1) || (row === -1 && col === 1) || (row === 1 && col === 0);
        const fill = silver ? "url(#silver)" : RAINBOW[(i++ + row * 2 + 14) % 7];
        scales += `<path d="M${x - 0.14 * u} ${y} a${0.14 * u} ${0.14 * u} 0 0 0 ${0.28 * u} 0" fill="${fill}" stroke="#fff" stroke-width="${0.02 * u}" opacity=".95"/>`;
      }
    }
    const mood = t === "sad"
      ? `<path d="M${-0.85 * u} ${0.2 * u} q${0.12 * u} ${-0.1 * u} ${0.24 * u} 0" fill="none" stroke="#3D3229" stroke-width="${0.05 * u}" stroke-linecap="round"/>`
      : `<path d="M${-0.85 * u} ${0.15 * u} q${0.12 * u} ${0.1 * u} ${0.24 * u} 0" fill="none" stroke="#3D3229" stroke-width="${0.05 * u}" stroke-linecap="round"/>`;
    return `<clipPath id="${id}"><ellipse cx="0" cy="0" rx="${1.05 * u}" ry="${0.68 * u}"/></clipPath>` +
      `<path d="M${0.9 * u} 0 L${1.55 * u} ${-0.62 * u} Q${1.4 * u} 0 ${1.55 * u} ${0.62 * u}Z" fill="#8E24AA" stroke="#3D3229" stroke-width="${0.05 * u}" stroke-linejoin="round"/>` +
      `<path d="M${-0.35 * u} ${-0.45 * u} Q${-0.1 * u} ${-1.25 * u} ${0.65 * u} ${-1.05 * u} Q${0.45 * u} ${-0.7 * u} ${0.6 * u} ${-0.4 * u}Z" fill="#1E88E5" stroke="#3D3229" stroke-width="${0.05 * u}" stroke-linejoin="round"/>` +
      `<ellipse cx="0" cy="0" rx="${1.05 * u}" ry="${0.68 * u}" fill="#4FC3F7"/>` +
      `<g clip-path="url(#${id})">${scales}</g>` +
      `<ellipse cx="0" cy="0" rx="${1.05 * u}" ry="${0.68 * u}" fill="none" stroke="#3D3229" stroke-width="${0.05 * u}"/>` +
      `<ellipse cx="${-0.6 * u}" cy="${-0.1 * u}" rx="${0.2 * u}" ry="${0.2 * u}" fill="#fff" stroke="#3D3229" stroke-width="${0.04 * u}"/>` +
      `<circle cx="${-0.64 * u}" cy="${-0.1 * u}" r="${0.1 * u}" fill="#3D3229"/>` + mood +
      sparkle(-0.15 * u, -0.25 * u, 0.12 * u) + sparkle(0.35 * u, 0.2 * u, 0.1 * u);
  }

  // Draws one item at the origin. u = base unit in px.
  function item(it, u) {
    const c = it.c || "#888";
    if (it.k.startsWith("e:")) {
      return `<text x="0" y="0" font-size="${1.1 * u}" text-anchor="middle" dominant-baseline="central">${esc(it.k.slice(2))}</text>`;
    }
    switch (it.k) {
      case "water":
        return `<ellipse rx="${3 * u}" ry="${2.1 * u}" fill="#4FA3E3" opacity=".85"/>` +
          [1.4, 0.8].map((k) => `<ellipse rx="${k * u}" ry="${k * 0.6 * u}" fill="none" stroke="#fff" stroke-width="${0.08 * u}" opacity=".6"/>`).join("");
      case "sand":
        return `<path d="M${-2.4 * u} ${0.6 * u} Q${-2 * u} ${-1.2 * u} 0 ${-1 * u} Q${1.8 * u} ${-0.9 * u} ${1.6 * u} ${0.9 * u} Q0 ${1.6 * u} ${-2.4 * u} ${0.6 * u}Z" fill="#F3D9A4"/>` +
          Array.from({ length: 14 }, (_, i) => `<circle cx="${(((i * 37) % 30) / 10 - 1.6) * u}" cy="${(((i * 23) % 16) / 10 - 0.7) * u}" r="${0.05 * u}" fill="#C9A86A"/>`).join("");
      case "coral":
        return `<g stroke="${c}" stroke-width="${0.28 * u}" stroke-linecap="round" fill="none"><path d="M0 ${0.8 * u} L0 ${-0.2 * u} M0 ${0.2 * u} L${-0.5 * u} ${-0.5 * u} M0 ${0.1 * u} L${0.55 * u} ${-0.45 * u} M${-0.5 * u} ${-0.5 * u} L${-0.5 * u} ${-0.9 * u} M${0.55 * u} ${-0.45 * u} L${0.7 * u} ${-0.85 * u}"/></g>`;
      case "rock":
        return `<path d="M${-0.8 * u} ${0.3 * u} Q${-0.9 * u} ${-0.4 * u} ${-0.1 * u} ${-0.5 * u} Q${0.8 * u} ${-0.55 * u} ${0.85 * u} ${0.2 * u} Q${0.6 * u} ${0.6 * u} 0 ${0.55 * u} Q${-0.6 * u} ${0.6 * u} ${-0.8 * u} ${0.3 * u}Z" fill="#A1887F" stroke="#6D4C41" stroke-width="${0.05 * u}"/><path d="M${-0.4 * u} ${-0.25 * u} q${0.3 * u} ${-0.12 * u} ${0.5 * u} 0" stroke="#fff" stroke-width="${0.06 * u}" fill="none" opacity=".6"/>`;
      case "seaweed":
        return `<g fill="none" stroke="#2E8B57" stroke-width="${0.2 * u}" stroke-linecap="round"><path d="M0 ${u} q${-0.4 * u} ${-0.5 * u} 0 ${-1 * u} t0 ${-1 * u}"/><path d="M${0.35 * u} ${u} q${0.4 * u} ${-0.5 * u} 0 ${-0.9 * u} t0 ${-0.7 * u}"/></g>`;
      case "shell":
        return `<path d="M0 ${0.5 * u} L${-0.65 * u} ${-0.2 * u} Q0 ${-0.95 * u} ${0.65 * u} ${-0.2 * u}Z" fill="#F8C9A0" stroke="#C47F4B" stroke-width="${0.05 * u}" stroke-linejoin="round"/>` +
          [-0.4, -0.15, 0.15, 0.4].map((x) => `<path d="M0 ${0.45 * u} L${x * u} ${-0.45 * u}" stroke="#C47F4B" stroke-width="${0.04 * u}"/>`).join("");
      case "star": {
        let d = "";
        for (let i = 0; i < 10; i++) {
          const r = (i % 2 ? 0.32 : 0.75) * u, a = -Math.PI / 2 + (i * Math.PI) / 5;
          d += `${i ? "L" : "M"}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
        }
        return `<path d="${d}Z" fill="${c}" stroke="#3D3229" stroke-width="${0.05 * u}" stroke-linejoin="round"/><circle cx="${-0.12 * u}" cy="${-0.08 * u}" r="${0.06 * u}" fill="#3D3229"/><circle cx="${0.12 * u}" cy="${-0.08 * u}" r="${0.06 * u}" fill="#3D3229"/>`;
      }
      case "fish": return fishShape(c === "#888" ? "#4FC3F7" : c, 0.7 * u, it.t);
      case "rainbowfish": return rainbowFish(0.9 * u, it.t);
      case "disc":
        return `<circle r="${0.45 * u}" fill="url(#silver)" stroke="#9E9E9E" stroke-width="${0.04 * u}"/>${sparkle(0.12 * u, -0.12 * u, 0.15 * u)}`;
      case "mirror":
        return `<rect x="${-0.55 * u}" y="${-0.4 * u}" width="${1.1 * u}" height="${0.8 * u}" rx="${0.12 * u}" fill="#CFE8F3" stroke="#78909C" stroke-width="${0.06 * u}"/><path d="M${-0.3 * u} ${0.25 * u} L${0.05 * u} ${-0.25 * u} M${0 * u} ${0.25 * u} L${0.3 * u} ${-0.15 * u}" stroke="#fff" stroke-width="${0.08 * u}" stroke-linecap="round"/>`;
      case "card":
        return `<rect x="${-0.6 * u}" y="${-0.42 * u}" width="${1.2 * u}" height="${0.84 * u}" rx="${0.1 * u}" fill="#fff" stroke="#3D3229" stroke-width="${0.04 * u}"/><text y="${0.05 * u}" font-family="${FONT}" font-size="${0.32 * u}" text-anchor="middle" dominant-baseline="central" fill="#3D3229">${esc(it.t || "")}</text>`;
      case "torch":
        return `<path d="M${0.3 * u} ${-0.15 * u} L${1.4 * u} ${-0.6 * u} L${1.4 * u} ${0.6 * u} L${0.3 * u} ${0.15 * u}Z" fill="#FFF59D" opacity=".7"/><rect x="${-0.7 * u}" y="${-0.17 * u}" width="${0.8 * u}" height="${0.34 * u}" rx="${0.08 * u}" fill="#455A64"/><rect x="${0.08 * u}" y="${-0.25 * u}" width="${0.25 * u}" height="${0.5 * u}" rx="${0.06 * u}" fill="#FDD835"/>`;
      case "magnifier":
        return `<line x1="${0.3 * u}" y1="${0.3 * u}" x2="${0.8 * u}" y2="${0.8 * u}" stroke="#6D4C41" stroke-width="${0.22 * u}" stroke-linecap="round"/><circle r="${0.42 * u}" fill="#E3F2FD" fill-opacity=".6" stroke="#E53935" stroke-width="${0.14 * u}"/>`;
      case "texture": {
        const s = 0.55 * u, base = `<rect x="${-s}" y="${-s}" width="${2 * s}" height="${2 * s}" rx="${0.12 * u}"`;
        if (it.t === "bubble") return `${base} fill="#E1F5FE" stroke="#81D4FA" stroke-width="${0.04 * u}"/>` + [-0.3, 0, 0.3].flatMap((x) => [-0.3, 0, 0.3].map((y) => `<circle cx="${x * u}" cy="${y * u}" r="${0.11 * u}" fill="#fff" stroke="#81D4FA" stroke-width="${0.03 * u}"/>`)).join("");
        if (it.t === "felt") return `${base} fill="${c}"/><rect x="${-s * 0.8}" y="${-s * 0.8}" width="${1.6 * s}" height="${1.6 * s}" rx="${0.1 * u}" fill="none" stroke="#fff" stroke-width="${0.04 * u}" stroke-dasharray="${0.1 * u} ${0.08 * u}"/>`;
        if (it.t === "ridges") return `${base} fill="#D7B98E"/>` + [-0.36, -0.18, 0, 0.18, 0.36].map((x) => `<line x1="${x * u}" y1="${-s}" x2="${x * u}" y2="${s}" stroke="#A47D4F" stroke-width="${0.06 * u}"/>`).join("");
        if (it.t === "foil") return `${base} fill="url(#silver)"/><path d="M${-s} ${-0.1 * u} L${-0.1 * u} ${-s} M${-0.2 * u} ${s} L${s} ${-0.2 * u} M${-s} ${0.35 * u} L${0.35 * u} ${-s}" stroke="#fff" stroke-width="${0.04 * u}"/>`;
        return `${base} fill="#FFE082"/>` + [[-0.25, -0.2], [0.2, -0.25], [0, 0.15], [-0.3, 0.3], [0.3, 0.25]].map(([x, y]) => `<circle cx="${x * u}" cy="${y * u}" r="${0.08 * u}" fill="#E6B84A"/>`).join("");
      }
      case "photofish":
        return fishShape("#FFF3E0", 0.7 * u) + `<circle cx="${-0.05 * u}" cy="0" r="${0.32 * u}" fill="#FFCC80" stroke="#3D3229" stroke-width="${0.04 * u}"/><g transform="translate(${-0.05 * u},0)">${face("happy", 0.3 * u)}</g>`;
      case "hoop":
        return `<circle r="${0.42 * u}" fill="none" stroke="${c}" stroke-width="${0.16 * u}"/>`;
      case "basket":
        return `<path d="M${-0.7 * u} ${-0.2 * u} L${0.7 * u} ${-0.2 * u} L${0.5 * u} ${0.45 * u} L${-0.5 * u} ${0.45 * u}Z" fill="#C8A26B" stroke="#8D6E63" stroke-width="${0.05 * u}"/>` +
          [-0.35, 0, 0.35].map((x) => `<line x1="${x * u}" y1="${-0.2 * u}" x2="${x * 0.75 * u}" y2="${0.45 * u}" stroke="#8D6E63" stroke-width="${0.04 * u}"/>`).join("") +
          `<line x1="${-0.6 * u}" y1="${0.12 * u}" x2="${0.6 * u}" y2="${0.12 * u}" stroke="#8D6E63" stroke-width="${0.04 * u}"/>`;
      case "tongs":
        return `<path d="M${-0.6 * u} 0 L${0.6 * u} ${-0.25 * u} M${-0.6 * u} 0 L${0.6 * u} ${0.25 * u}" stroke="#26A69A" stroke-width="${0.14 * u}" stroke-linecap="round"/>`;
      case "paddle":
        return `<rect x="${-0.08 * u}" y="${0.3 * u}" width="${0.16 * u}" height="${0.5 * u}" fill="#3D3229"/><circle r="${0.38 * u}" fill="${c}" opacity=".55" stroke="#3D3229" stroke-width="${0.04 * u}"/>`;
      case "cubetray":
        return `<rect x="${-0.75 * u}" y="${-0.5 * u}" width="${1.5 * u}" height="${u}" rx="${0.1 * u}" fill="#ECEFF1" stroke="#90A4AE" stroke-width="${0.04 * u}"/>` +
          [0, 1, 2].flatMap((col) => [0, 1].map((row) => `<rect x="${(-0.65 + col * 0.45) * u}" y="${(-0.4 + row * 0.45) * u}" width="${0.4 * u}" height="${0.38 * u}" rx="${0.06 * u}" fill="${["#E53935", "#FDD835", "#1E88E5"][col]}" opacity=".75"/>`)).join("");
      case "pipette":
        return `<rect x="${-0.6 * u}" y="${-0.06 * u}" width="${0.9 * u}" height="${0.12 * u}" fill="#E3F2FD" stroke="#90A4AE" stroke-width="${0.03 * u}" transform="rotate(-20)"/><ellipse cx="${0.45 * u}" cy="${-0.17 * u}" rx="${0.2 * u}" ry="${0.14 * u}" fill="#FB8C00" transform="rotate(-20)"/>`;
      case "container":
        return `<rect x="${-0.48 * u}" y="${-0.55 * u}" width="${0.96 * u}" height="${1.1 * u}" rx="${0.2 * u}" fill="${c}" opacity=".9" stroke="#3D3229" stroke-width="${0.05 * u}"/><rect x="${-0.52 * u}" y="${-0.68 * u}" width="${1.04 * u}" height="${0.2 * u}" rx="${0.06 * u}" fill="#fff" stroke="#3D3229" stroke-width="${0.04 * u}"/>` + face(it.t, 0.38 * u);
      case "pompom": {
        const r = rng(7);
        const cols = ["#FDD835", "#1E88E5", "#E53935", "#8E24AA"];
        return Array.from({ length: 22 }, (_, i) => `<circle cx="${((r() - 0.5) * 1.8 * u).toFixed(1)}" cy="${((r() - 0.5) * 1.4 * u).toFixed(1)}" r="${0.17 * u}" fill="${cols[i % 4]}" stroke="#fff" stroke-width="${0.03 * u}"/>`).join("");
      }
      case "scoop":
        return `<ellipse cx="${-0.35 * u}" cy="0" rx="${0.3 * u}" ry="${0.22 * u}" fill="#90CAF9" stroke="#1E88E5" stroke-width="${0.05 * u}"/><rect x="${-0.08 * u}" y="${-0.07 * u}" width="${0.85 * u}" height="${0.14 * u}" rx="${0.07 * u}" fill="#1E88E5"/>`;
      case "face":
        return `<circle r="${0.45 * u}" fill="${c}" stroke="#3D3229" stroke-width="${0.05 * u}"/>` + face(it.t, 0.42 * u);
      case "namebottle":
        return `<rect x="${-0.22 * u}" y="${-0.45 * u}" width="${0.44 * u}" height="${0.9 * u}" rx="${0.12 * u}" fill="#E3F2FD" stroke="#3D3229" stroke-width="${0.04 * u}"/><rect x="${-0.12 * u}" y="${-0.6 * u}" width="${0.24 * u}" height="${0.16 * u}" fill="#E53935"/><rect x="${-0.2 * u}" y="${-0.05 * u}" width="${0.4 * u}" height="${0.2 * u}" fill="#fff"/><circle cx="${-0.08 * u}" cy="${0.3 * u}" r="${0.08 * u}" fill="#FDD835"/><circle cx="${0.08 * u}" cy="${0.32 * u}" r="${0.08 * u}" fill="#1E88E5"/>`;
      case "grass":
        return `<g stroke-linecap="round" fill="none">` + [-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => `<path d="M${x * u} ${0.5 * u} Q${(x + (i % 2 ? 0.2 : -0.2)) * u} 0 ${(x + (i % 2 ? 0.1 : -0.15)) * u} ${-0.6 * u}" stroke="${i % 2 ? "#3E8E4F" : "#7CB342"}" stroke-width="${0.12 * u}"/>`).join("") + `</g>`;
      case "binoculars":
        return `<circle cx="${-0.28 * u}" cy="0" r="${0.26 * u}" fill="#795548" stroke="#3E2723" stroke-width="${0.05 * u}"/><circle cx="${0.28 * u}" cy="0" r="${0.26 * u}" fill="#795548" stroke="#3E2723" stroke-width="${0.05 * u}"/><circle cx="${-0.28 * u}" cy="0" r="${0.12 * u}" fill="#B3E5FC"/><circle cx="${0.28 * u}" cy="0" r="${0.12 * u}" fill="#B3E5FC"/>`;
      case "river":
        return `<path d="M${-2.6 * u} ${-0.2 * u} Q${-1.2 * u} ${-1.1 * u} 0 ${-0.6 * u} T${2.4 * u} ${-0.7 * u} L${2.2 * u} ${0.9 * u} Q${0.8 * u} ${0.3 * u} 0 ${0.8 * u} T${-2.6 * u} ${1.1 * u}Z" fill="#4FA3E3" stroke="#1976D2" stroke-width="${0.06 * u}"/>` +
          [-1.4, 0, 1.2].map((x) => `<path d="M${x * u} ${0.1 * u} q${0.2 * u} ${-0.15 * u} ${0.4 * u} 0 t${0.4 * u} 0" fill="none" stroke="#fff" stroke-width="${0.07 * u}" stroke-linecap="round"/>`).join("");
      case "sponge":
        return `<rect x="${-0.4 * u}" y="${-0.28 * u}" width="${0.8 * u}" height="${0.56 * u}" rx="${0.1 * u}" fill="#FFE082" stroke="#E6B84A" stroke-width="${0.04 * u}"/><circle cx="${-0.15 * u}" cy="${-0.05 * u}" r="${0.06 * u}" fill="#E6B84A"/><circle cx="${0.15 * u}" cy="${0.08 * u}" r="${0.07 * u}" fill="#E6B84A"/>`;
      case "footprints":
        return [0, 1, 2, 3].map((i) => `<ellipse cx="${(i - 1.5) * 0.45 * u}" cy="${(i % 2 ? 0.15 : -0.15) * u}" rx="${0.17 * u}" ry="${0.1 * u}" fill="#5D4037" opacity=".8"/>`).join("");
      case "towel":
        return `<rect x="${-0.5 * u}" y="${-0.35 * u}" width="${u}" height="${0.7 * u}" rx="${0.08 * u}" fill="#81D4FA"/><rect x="${-0.5 * u}" y="${-0.1 * u}" width="${u}" height="${0.12 * u}" fill="#fff"/>`;
      case "tree":
        return `<rect x="${-0.1 * u}" y="${0.1 * u}" width="${0.2 * u}" height="${0.6 * u}" fill="#6D4C41"/><circle cy="${-0.2 * u}" r="${0.5 * u}" fill="#2E7D32" stroke="#1B5E20" stroke-width="${0.05 * u}"/><circle cx="${-0.2 * u}" cy="${-0.35 * u}" r="${0.12 * u}" fill="#43A047"/>`;
      case "pinecone":
        return `<ellipse rx="${0.25 * u}" ry="${0.4 * u}" fill="#8D6E63" stroke="#4E342E" stroke-width="${0.04 * u}"/>` + [-0.2, 0, 0.2].map((y) => `<path d="M${-0.22 * u} ${y * u} q${0.22 * u} ${0.12 * u} ${0.44 * u} 0" fill="none" stroke="#4E342E" stroke-width="${0.04 * u}"/>`).join("");
      case "stick":
        return `<path d="M${-0.8 * u} 0 L${0.8 * u} 0 M${0.2 * u} 0 L${0.5 * u} ${-0.3 * u}" stroke="#795548" stroke-width="${0.14 * u}" stroke-linecap="round"/>`;
      case "cotton": {
        const r = rng(11);
        return Array.from({ length: 7 }, () => `<circle cx="${((r() - 0.5) * 1.3 * u).toFixed(1)}" cy="${((r() - 0.5) * 0.8 * u).toFixed(1)}" r="${(0.25 + r() * 0.15) * u}" fill="#fff" stroke="#E0E0E0" stroke-width="${0.03 * u}"/>`).join("");
      }
      case "ice":
        return `<rect x="${-0.5 * u}" y="${-0.5 * u}" width="${u}" height="${u}" rx="${0.15 * u}" fill="#B3E5FC" fill-opacity=".75" stroke="#4FC3F7" stroke-width="${0.05 * u}"/><text font-size="${0.55 * u}" text-anchor="middle" dominant-baseline="central" opacity=".8">${esc(it.t || "")}</text><path d="M${-0.35 * u} ${-0.3 * u} l${0.25 * u} 0" stroke="#fff" stroke-width="${0.08 * u}" stroke-linecap="round"/>`;
      case "bottle":
        return `<rect x="${-0.25 * u}" y="${-0.35 * u}" width="${0.5 * u}" height="${0.8 * u}" rx="${0.12 * u}" fill="#FAFAFA" stroke="#90A4AE" stroke-width="${0.04 * u}"/><path d="M${-0.08 * u} ${-0.35 * u} L0 ${-0.65 * u} L${0.08 * u} ${-0.35 * u}Z" fill="#E53935"/><rect x="${-0.25 * u}" y="0" width="${0.5 * u}" height="${0.45 * u}" rx="${0.1 * u}" fill="#81D4FA" opacity=".6"/>`;
      case "cave":
        return `<path d="M${-1.1 * u} ${0.6 * u} Q${-1.1 * u} ${-0.9 * u} 0 ${-0.95 * u} Q${1.1 * u} ${-0.9 * u} ${1.1 * u} ${0.6 * u}Z" fill="#424242" stroke="#212121" stroke-width="${0.06 * u}"/><path d="M${-0.6 * u} ${0.6 * u} Q${-0.6 * u} ${-0.35 * u} 0 ${-0.4 * u} Q${0.6 * u} ${-0.35 * u} ${0.6 * u} ${0.6 * u}Z" fill="#111"/>`;
      case "bed":
        return `<rect x="${-0.8 * u}" y="${-0.2 * u}" width="${1.6 * u}" height="${0.6 * u}" rx="${0.08 * u}" fill="#8D6E63"/><rect x="${-0.75 * u}" y="${-0.4 * u}" width="${0.35 * u}" height="${0.25 * u}" rx="${0.08 * u}" fill="#fff"/><path d="M${-0.35 * u} ${-0.3 * u} L${0.8 * u} ${-0.3 * u} L${0.8 * u} ${0.2 * u} L${-0.35 * u} ${0.2 * u}Z" fill="#E2707C"/>` +
          [0, 0.35].map((x) => `<line x1="${x * u}" y1="${-0.3 * u}" x2="${x * u}" y2="${0.2 * u}" stroke="#fff" stroke-width="${0.05 * u}"/>`).join("") +
          [-0.2, 0.05, 0.3].map((x) => `<circle cx="${x * u}" cy="${-0.38 * u}" r="${0.1 * u}" fill="#FFCC80"/>`).join("");
      case "speech":
        return `<rect x="${-1.6 * u}" y="${-0.4 * u}" width="${3.2 * u}" height="${0.8 * u}" rx="${0.35 * u}" fill="#fff" stroke="#3D3229" stroke-width="${0.04 * u}"/><path d="M${-0.2 * u} ${0.38 * u} L0 ${0.8 * u} L${0.25 * u} ${0.38 * u}" fill="#fff" stroke="#3D3229" stroke-width="${0.04 * u}"/><text y="${0.02 * u}" font-family="${FONT}" font-size="${0.36 * u}" text-anchor="middle" dominant-baseline="central" fill="#3D3229">${esc(it.t || "")}</text>`;
      case "bubbles":
        return [[0, 0, 0.18], [0.3, -0.4, 0.12], [-0.15, -0.7, 0.09], [0.15, -1, 0.07]].map(([x, y, r]) => `<circle cx="${x * u}" cy="${y * u}" r="${r * u}" fill="none" stroke="#fff" stroke-width="${0.04 * u}" opacity=".8"/>`).join("");
      case "sun":
        return `<circle r="${0.5 * u}" fill="#FDD835"/>` + Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return `<line x1="${0.7 * u * Math.cos(a)}" y1="${0.7 * u * Math.sin(a)}" x2="${0.95 * u * Math.cos(a)}" y2="${0.95 * u * Math.sin(a)}" stroke="#FDD835" stroke-width="${0.1 * u}" stroke-linecap="round"/>`;
        }).join("");
      default:
        return `<circle r="${0.3 * u}" fill="${c}"/>`;
    }
  }

  function place(it, x, y, u) {
    const s = it.s || 1;
    const flip = it.r === 180 && /fish/.test(it.k);
    const rot = it.r && !flip ? ` rotate(${it.r})` : "";
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})${rot} scale(${flip ? -s : s},${s})">${item(it, u)}</g>`;
  }

  const DEFS = `<defs><linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#CFD8DC"/><stop offset=".55" stop-color="#ECEFF1"/><stop offset="1" stop-color="#90A4AE"/></linearGradient></defs>`;

  function trayBase(base, cx, cy, R) {
    const r = rng(base.length * 97);
    const strokes = (n, cols, len, w) => Array.from({ length: n }, () => {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R, x = cx + d * Math.cos(a), y = cy + d * Math.sin(a), t = r() * Math.PI;
      return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + len * Math.cos(t)).toFixed(1)}" y2="${(y + len * Math.sin(t)).toFixed(1)}" stroke="${cols[Math.floor(r() * cols.length)]}" stroke-width="${w}" stroke-linecap="round"/>`;
    }).join("");
    switch (base) {
      case "ocean": return `<rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="#1E6FB8"/>` + strokes(26, ["#4FA3E3", "#2B82CC"], 30, 5);
      case "ocean-light": return `<rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="#9FD3F2"/>` + strokes(18, ["#C9E8FA", "#7EC1EA"], 34, 5);
      case "shred": return `<rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="#2B82CC"/>` + strokes(260, ["#64B5F6", "#1565C0", "#66BB6A", "#90CAF9"], 26, 4);
      case "grass": return `<rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="#6BBF59"/>` + strokes(220, ["#3E8E4F", "#8BC34A", "#2E7D32"], 22, 4);
      case "mud": return `<rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="#6D4C41"/>` +
        Array.from({ length: 16 }, () => `<ellipse cx="${(cx + (r() - 0.5) * 1.6 * R).toFixed(1)}" cy="${(cy + (r() - 0.5) * 1.6 * R).toFixed(1)}" rx="${(10 + r() * 30).toFixed(1)}" ry="${(6 + r() * 14).toFixed(1)}" fill="${r() > 0.5 ? "#5D4037" : "#8D6E63"}"/>`).join("") +
        Array.from({ length: 10 }, () => `<path d="M${(cx + (r() - 0.5) * 1.5 * R).toFixed(1)} ${(cy + (r() - 0.5) * 1.5 * R).toFixed(1)} q8 -6 16 0" stroke="#BCAAA4" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("");
      case "snow": return `<rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="#E3F2FD"/>` + strokes(40, ["#FFFFFF", "#BBDEFB"], 18, 6);
      case "journey": {
        const zones = [["#6BBF59", "grass"], ["#4FA3E3", "river"], ["#6D4C41", "mud"], ["#2E7D32", "forest"], ["#ECEFF1", "snow"], ["#37474F", "cave"]];
        return zones.map(([col, name], i) => {
          const a0 = -Math.PI / 2 + (i * Math.PI) / 3, a1 = a0 + Math.PI / 3, am = (a0 + a1) / 2;
          const p = (a) => `${(cx + 1.2 * R * Math.cos(a)).toFixed(1)} ${(cy + 1.2 * R * Math.sin(a)).toFixed(1)}`;
          const lx = cx + 0.72 * R * Math.cos(am), ly = cy + 0.72 * R * Math.sin(am);
          return `<path d="M${cx} ${cy} L${p(a0)} L${p(a1)}Z" fill="${col}" stroke="#fff" stroke-width="3"/>` +
            `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-family="${FONT}" font-size="20" font-weight="600" text-anchor="middle" dominant-baseline="central" fill="${i === 4 ? "#3D3229" : "#fff"}">${i + 1}. ${name}</text>`;
        }).join("");
      }
      default: return `<rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="#9FD3F2"/>`;
    }
  }

  function wrap(text, max) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      if ((line + " " + w).trim().length > max && line) { lines.push(line); line = w; } else line = (line + " " + w).trim();
    }
    if (line) lines.push(line);
    return lines;
  }

  // weekInBlock: 1 = base set-up only, 2 = base + add-on (highlighted).
  function tray(block, weekInBlock) {
    const W = 1000, H = 660, cx = 350, cy = 330, R = 250, u = 40;
    const showAdd = weekInBlock === 2;
    const clip = `tc${uid++}`;
    const mats = block.materials.map((m, i) => ({ ...m, n: i + 1 })).filter((m) => showAdd || !m.addOn);
    let body = "", badges = "";
    for (const m of mats) {
      for (const it of m.items) {
        body += place(it, cx + it.x * R, cy + it.y * R, u);
        if (m.addOn) body += `<circle cx="${(cx + it.x * R).toFixed(1)}" cy="${(cy + it.y * R).toFixed(1)}" r="${(it.s || 1) * u * 0.95}" fill="none" stroke="#D6337F" stroke-width="3" stroke-dasharray="8 6"/>`;
      }
      const first = m.items[0];
      const bx = first ? cx + first.x * R + 26 : null, by = first ? cy + first.y * R - 26 : null;
      if (first) badges += `<circle cx="${bx}" cy="${by}" r="14" fill="${m.addOn ? "#D6337F" : "#3D3229"}" stroke="#fff" stroke-width="2.5"/><text x="${bx}" y="${by + 1}" font-family="${FONT}" font-size="15" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${m.n}</text>`;
    }
    // legend
    let ly = 70, legend = "";
    const lx = 700;
    legend += `<text x="${lx}" y="40" font-family="${FONT}" font-size="22" font-weight="700" fill="#3D3229">Tuff tray set-up</text>`;
    legend += `<text x="${lx}" y="${ly}" font-family="${FONT}" font-size="15" fill="#6B5D4F">Weeks ${block.weeks[0]}-${block.weeks[1]}${showAdd ? ` · Week ${block.weeks[1]} with add-on` : ` · Week ${block.weeks[0]} base`}</text>`;
    ly += 34;
    for (const m of block.materials.map((mm, i) => ({ ...mm, n: i + 1 }))) {
      if (m.addOn && !showAdd) continue;
      if (m.addOn && !legend.includes("Add-on")) {
        ly += 6;
        legend += `<text x="${lx}" y="${ly}" font-family="${FONT}" font-size="16" font-weight="700" fill="#D6337F">+ Week ${block.weeks[1]} Add-on</text>`;
        ly += 26;
      }
      const lines = wrap(m.label, 30);
      legend += `<circle cx="${lx + 12}" cy="${ly - 5}" r="12" fill="${m.addOn ? "#D6337F" : "#3D3229"}"/><text x="${lx + 12}" y="${ly - 4}" font-family="${FONT}" font-size="13" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${m.n}</text>`;
      lines.forEach((ln, j) => { legend += `<text x="${lx + 32}" y="${ly + j * 19}" font-family="${FONT}" font-size="15" fill="#3D3229">${esc(ln)}</text>`; });
      ly += lines.length * 19 + 12;
    }
    if (!showAdd) {
      ly += 6;
      legend += `<text x="${lx}" y="${ly}" font-family="${FONT}" font-size="14" fill="#A08F7C">Week ${block.weeks[1]}: add-on joins this set-up</text>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Tuff tray set-up: ${esc(block.title)}">${DEFS}` +
      `<rect width="${W}" height="${H}" fill="#FFFDF8"/>` +
      `<rect x="8" y="20" width="672" height="620" rx="26" fill="#EAD9BF"/>` +
      `<ellipse cx="${cx + 8}" cy="${cy + 14}" rx="${R + 28}" ry="${R + 24}" fill="#000" opacity=".12"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${R + 24}" fill="#2B2B2B"/><circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="#3A3A3A"/>` +
      `<clipPath id="${clip}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>` +
      `<g clip-path="url(#${clip})">${trayBase(block.base, cx, cy, R)}</g>` +
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#1A1A1A" stroke-width="3"/>` +
      body + badges + legend + `</svg>`;
  }

  function sceneBg(bg, W, H) {
    const r = rng(bg.length * 131);
    const sky = (c1, c2) => `<linearGradient id="sky${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><rect width="${W}" height="${H}" fill="url(#sky${uid++})"/>`;
    const blades = (y0, cols, n, h) => Array.from({ length: n }, () => {
      const x = r() * W, hh = h * (0.6 + r() * 0.6);
      return `<path d="M${x.toFixed(1)} ${y0} q${(r() - 0.5) * 30} ${-hh / 2} ${(r() - 0.5) * 20} ${-hh}" stroke="${cols[Math.floor(r() * cols.length)]}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }).join("");
    switch (bg) {
      case "sea": case "seacave": {
        let s = sky("#4FC3F7", "#0D47A1");
        s += Array.from({ length: 5 }, (_, i) => `<path d="M${120 + i * 150} 0 L${170 + i * 150} 0 L${90 + i * 160} ${H} L${40 + i * 160} ${H}Z" fill="#fff" opacity=".07"/>`).join("");
        s += `<path d="M0 ${H - 60} Q${W * 0.25} ${H - 95} ${W * 0.5} ${H - 65} T${W} ${H - 70} L${W} ${H} L0 ${H}Z" fill="#F3D9A4"/>`;
        s += place({ k: "seaweed" }, 40, H - 90, 45) + place({ k: "seaweed" }, W - 50, H - 95, 50) + place({ k: "coral", c: "#E2707C" }, 120, H - 75, 40) + place({ k: "coral", c: "#F4A259" }, W - 140, H - 75, 36) + place({ k: "shell" }, 300, H - 35, 30);
        if (bg === "seacave") s += `<path d="M${W * 0.45} ${H - 60} Q${W * 0.5} ${H * 0.1} ${W * 0.75} ${H * 0.08} Q${W} ${H * 0.1} ${W} ${H * 0.3} L${W} ${H - 60}Z" fill="#455A64"/><path d="M${W * 0.53} ${H - 60} Q${W * 0.56} ${H * 0.25} ${W * 0.72} ${H * 0.24} Q${W * 0.88} ${H * 0.25} ${W * 0.9} ${H - 60}Z" fill="#1C2A33"/>`;
        return s;
      }
      case "grass":
        return sky("#B3E5FC", "#E1F5FE") + `<path d="M0 ${H * 0.55} Q${W * 0.3} ${H * 0.45} ${W * 0.6} ${H * 0.55} T${W} ${H * 0.5} L${W} ${H} L0 ${H}Z" fill="#8BC34A"/>` + blades(H, ["#3E8E4F", "#2E7D32", "#7CB342"], 160, 120);
      case "river":
        return sky("#B3E5FC", "#E1F5FE") + `<rect y="${H * 0.45}" width="${W}" height="${H * 0.55}" fill="#8BC34A"/><path d="M0 ${H * 0.62} Q${W * 0.4} ${H * 0.55} ${W} ${H * 0.66} L${W} ${H * 0.92} Q${W * 0.5} ${H * 0.82} 0 ${H * 0.95}Z" fill="#4FA3E3"/>` +
          Array.from({ length: 8 }, (_, i) => `<path d="M${60 + i * 95} ${H * 0.78 + (i % 2) * 18} q15 -10 30 0 t30 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("");
      case "mud":
        return sky("#CFD8DC", "#ECEFF1") + `<path d="M0 ${H * 0.5} Q${W * 0.5} ${H * 0.42} ${W} ${H * 0.52} L${W} ${H} L0 ${H}Z" fill="#6D4C41"/>` +
          Array.from({ length: 14 }, () => `<ellipse cx="${(r() * W).toFixed(1)}" cy="${(H * 0.6 + r() * H * 0.35).toFixed(1)}" rx="${(20 + r() * 50).toFixed(1)}" ry="${(8 + r() * 14).toFixed(1)}" fill="${r() > 0.5 ? "#5D4037" : "#8D6E63"}"/>`).join("");
      case "forest": {
        let s = sky("#C8E6C9", "#E8F5E9") + `<rect y="${H * 0.7}" width="${W}" height="${H * 0.3}" fill="#795548"/>`;
        for (let i = 0; i < 9; i++) s += place({ k: "tree" }, 40 + i * 92 + (i % 2) * 20, H * 0.48 + (i % 2) * 30, 110 + (i % 3) * 20);
        return s;
      }
      case "snow":
        return sky("#90A4AE", "#CFD8DC") + `<path d="M0 ${H * 0.68} Q${W * 0.5} ${H * 0.6} ${W} ${H * 0.7} L${W} ${H} L0 ${H}Z" fill="#FAFAFA"/>` +
          Array.from({ length: 60 }, () => `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * H * 0.9).toFixed(1)}" r="${(2 + r() * 5).toFixed(1)}" fill="#fff" opacity=".9"/>`).join("") +
          [0.2, 0.5, 0.75].map((y) => `<path d="M${W * 0.1} ${H * y} q${W * 0.15} -40 ${W * 0.3} 0 t${W * 0.3} 0" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>`).join("");
      case "cave":
        return sky("#263238", "#000000") + `<path d="M0 0 L${W} 0 L${W} ${H} L${W * 0.92} ${H} Q${W * 0.9} ${H * 0.1} ${W * 0.5} ${H * 0.12} Q${W * 0.1} ${H * 0.1} ${W * 0.08} ${H} L0 ${H}Z" fill="#455A64"/><rect y="${H * 0.85}" width="${W}" height="${H * 0.15}" fill="#37474F"/>`;
      case "journey": {
        const cols = ["#6BBF59", "#4FA3E3", "#6D4C41", "#2E7D32", "#FAFAFA", "#37474F"];
        return sky("#B3E5FC", "#E1F5FE") + cols.map((c, i) => `<rect x="${(i * W) / 6}" y="${H * 0.55}" width="${W / 6 + 1}" height="${H * 0.45}" fill="${c}"/>`).join("") +
          `<path d="M0 ${H * 0.8} L${W} ${H * 0.8}" stroke="#FFE082" stroke-width="16" stroke-dasharray="30 18"/>`;
      }
      case "home":
        return `<rect width="${W}" height="${H}" fill="#FFE9C7"/><rect y="${H * 0.8}" width="${W}" height="${H * 0.2}" fill="#C8A26B"/><rect x="${W * 0.68}" y="${H * 0.12}" width="${W * 0.26}" height="${H * 0.36}" rx="10" fill="#1A237E" stroke="#fff" stroke-width="10"/><circle cx="${W * 0.75}" cy="${H * 0.2}" r="18" fill="#FFF59D"/><rect x="${W * 0.68}" y="${H * 0.38}" width="${W * 0.26}" height="${H * 0.1}" fill="#F3D9A4"/>`;
      default:
        return sky("#B3E5FC", "#E1F5FE");
    }
  }

  function scene(sc) {
    const W = 800, H = 500, u = 46;
    const items = sc.items.map((it) => place(it, it.x * W, it.y * H, u)).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H + 64}" width="${W}" height="${H + 64}" role="img" aria-label="Scene card: ${esc(sc.title)}">${DEFS}` +
      `<rect width="${W}" height="${H + 64}" rx="18" fill="#FFFDF8"/>` +
      `<clipPath id="sc${uid}"><rect width="${W}" height="${H}" rx="18"/></clipPath><g clip-path="url(#sc${uid++})">${sceneBg(sc.bg, W, H)}${items}</g>` +
      `<text x="${W / 2}" y="${H + 38}" font-family="${FONT}" font-size="30" font-weight="600" fill="#3D3229" text-anchor="middle">${esc(sc.title)}</text></svg>`;
  }

  const CARD_COLS = ["#D6337F", "#58B368", "#F4A259", "#2A78D6", "#8E24AA"];
  function wordCard(w, i) {
    const W = 300, H = 230;
    const icon = w.icon.startsWith("e:")
      ? `<text x="${W / 2}" y="92" font-size="86" text-anchor="middle" dominant-baseline="central">${esc(w.icon.slice(2))}</text>`
      : place(w.icon.includes(":") ? { k: w.icon.split(":")[0], t: w.icon.split(":")[1] } : { k: w.icon, c: "#F4A259" }, W / 2, 95, 80);
    const fs = w.word.length > 12 ? 30 : 40;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Word card: ${esc(w.word)}">${DEFS}` +
      `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="22" fill="#fff" stroke="${CARD_COLS[i % CARD_COLS.length]}" stroke-width="8"/>${icon}` +
      `<text x="${W / 2}" y="196" font-family="${FONT}" font-size="${fs}" font-weight="600" fill="#3D3229" text-anchor="middle">${esc(w.word)}</text></svg>`;
  }

  // Rasterise for PowerPoint export (fonts fall back to system fonts inside <img>).
  function toPng(svg, scale = 2) {
    return new Promise((resolve, reject) => {
      const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      const w = Number(m[1]), h = Number(m[2]);
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement("canvas");
        cv.width = w * scale;
        cv.height = h * scale;
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        resolve({ data: cv.toDataURL("image/png"), w, h });
      };
      img.onerror = () => reject(new Error("Could not render illustration"));
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }

  return { tray, scene, wordCard, toPng };
})();

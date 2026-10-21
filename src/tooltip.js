import { SERIES } from "./data.js";
import * as fmt from "./format.js";

const GAP = 10;
const EDGE = 4;

const SHORT_LABEL = {
  total: "Total",
  male: "Male",
  female: "Female",
  urban: "Urban",
  rural: "Rural",
};

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label, value, active) {
  return (
    `<div class="tip-row${active ? " is-active" : ""}">` +
    `<span>${esc(label)}</span><span>${esc(value)}</span></div>`
  );
}

export function createTooltip({ el, data }) {
  function render(d, state) {
    const c = d.c;
    const { year, metric, colorBy } = state;

    const series = Object.keys(SERIES)
      .map((key) => ({ key, value: data.valueAt(c, key, year) }))
      .filter((s) => s.value != null);
    const primary = series.find((s) => s.key === metric);
    const rest = series.filter((s) => s.key !== metric);

    const derived = [
      ["growth", "Growth rate", fmt.growth, data.growthAt(c, year)],
      ["urban", "Share urban", fmt.share, data.urbanShareAt(c, year)],
      ["sexRatio", "Males per female", fmt.ratio, data.sexRatioAt(c, year)],
    ].filter(([, , , v]) => v != null);

    const where = [c.subregion, c.region].filter(Boolean).join(" · ");

    let html = `<div class="tip-name">${esc(c.name)}</div>`;
    if (where) html += `<div class="tip-where">${esc(where)}</div>`;

    html += `<div class="tip-year">${year}`;
    if (data.isProjection(year))
      html += `<span class="tip-tag">projected</span>`;
    html += `</div>`;

    if (primary) {
      html +=
        `<div class="tip-primary"><span>${esc(SERIES[primary.key])}</span>` +
        `<span>${esc(fmt.count(primary.value))}</span></div>`;
    }

    html += `<div class="tip-rows">`;
    for (const s of rest) html += row(SHORT_LABEL[s.key], fmt.count(s.value));
    for (const [key, label, format, v] of derived) {
      html += row(label, format(v), key === colorBy);
    }
    html += `</div>`;

    if (c.historical) {
      const note = c.endedYear
        ? `Former entity · data through ${c.endedYear}`
        : "Former entity";
      html += `<div class="tip-note">${esc(note)}</div>`;
    }

    el.innerHTML = html;
    el.hidden = false;
  }

  function place(sx, sy, sr, width, height) {
    if (el.hidden) return;
    const tw = el.offsetWidth;
    const th = el.offsetHeight;

    let top = sy - sr - GAP - th;
    let side = "above";
    if (top < EDGE) {
      top = sy + sr + GAP;
      side = "below";
    }
    top = Math.max(EDGE, Math.min(height - th - EDGE, top));
    const left = Math.max(EDGE, Math.min(width - tw - EDGE, sx - tw / 2));

    el.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    el.dataset.side = side;
  }

  function hide() {
    el.hidden = true;
  }

  return { render, place, hide };
}

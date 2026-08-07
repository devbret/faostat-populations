import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const LIGHT = {
  surface: "#fcfcfb",
  plane: "#f9f9f7",
  ink: "#0b0b0b",
  ink2: "#52514e",
  muted: "#898781",
  axis: "#c3c2b7",
  border: "rgba(11,11,11,0.10)",

  divLow: "#2a78d6",
  divMid: "#f0efec",
  divHigh: "#e34948",

  seq: [
    "#cde2fb",
    "#b7d3f6",
    "#9ec5f4",
    "#86b6ef",
    "#6da7ec",
    "#5598e7",
    "#3987e5",
    "#2a78d6",
    "#256abf",
    "#1c5cab",
    "#184f95",
    "#104281",
    "#0d366b",
  ],
  accent: "#2a78d6",
};

const DARK = {
  surface: "#1a1a19",
  plane: "#0d0d0d",
  ink: "#ffffff",
  ink2: "#c3c2b7",
  muted: "#898781",
  axis: "#383835",
  border: "rgba(255,255,255,0.10)",
  divLow: "#3987e5",
  divMid: "#383835",
  divHigh: "#e66767",

  seq: [
    "#0d366b",
    "#104281",
    "#184f95",
    "#1c5cab",
    "#256abf",
    "#2a78d6",
    "#3987e5",
    "#5598e7",
    "#6da7ec",
    "#86b6ef",
    "#9ec5f4",
    "#b7d3f6",
    "#cde2fb",
  ],
  accent: "#3987e5",
};

export const REGION_ORDER = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

export const DOMAINS = {
  growth: [-2.5, 0, 2.5],
  urban: [0, 100],

  sexRatio: [1 / 1.2, 1, 1.2],
};

let mode = null;
let tokens = null;
const listeners = new Set();

function detect() {
  const stamped = document.documentElement.dataset.theme;
  if (stamped === "light" || stamped === "dark") return stamped;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function build() {
  mode = detect();
  const t = mode === "dark" ? DARK : LIGHT;

  const growth = d3
    .scaleLinear()
    .domain(DOMAINS.growth)
    .range([t.divLow, t.divMid, t.divHigh])
    .interpolate(d3.interpolateLab)
    .clamp(true);

  const urban = d3.scaleQuantize().domain(DOMAINS.urban).range(t.seq);

  const sexRatio = d3
    .scaleLinear()
    .domain(DOMAINS.sexRatio)
    .range([t.divLow, t.divMid, t.divHigh])
    .interpolate(d3.interpolateLab)
    .clamp(true);

  tokens = { ...t, mode, growth, urban, sexRatio };
  return tokens;
}

export function palette() {
  return tokens || build();
}

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function refresh() {
  const before = mode;
  build();
  if (before !== mode) listeners.forEach((fn) => fn(tokens));
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", refresh);

new MutationObserver(refresh).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});

build();

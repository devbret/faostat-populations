import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const EXCLUDED_AREAS = new Set([
  "World",
  "Europe",
  "Africa",
  "Asia",
  "Eastern Asia",
  "Americas",
  "North America",
  "Southern Asia",
  "South-eastern Asia",
  "Eastern Africa",
  "South America",
  "Western Africa",
  "Eastern Europe",
  "Western Europe",
  "China, mainland",
  "Western Asia",
  "Middle Africa",
  "Southern Europe",
  "Central America",
  "Northern Europe",
  "Northern America",
  "Northern Africa",
  "Southern Africa",
  "Central Asia",
  "Caribbean",
  "Oceana",
]);

const JSON_URL = "population_total.json";

const svg = d3.select("#viz");
const tooltip = d3.select("#tooltip");

function getSize() {
  const rect = svg.node().getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

let { width, height } = getSize();

const g = svg.append("g");

const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");
const yearSlider = document.getElementById("year");
const speedSlider = document.getElementById("speed");
const speedLabel = document.getElementById("speedLabel");
const yearLabel = document.getElementById("yearLabel");
const unitLabel = document.getElementById("unitLabel");

let countries = [];
let years = [];
let year = +yearSlider.value;

let timer = null;
let isPlaying = false;

function hasValueForYear(d, y) {
  const v = d.values?.[String(y)];
  return v != null && isFinite(v);
}

function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function labelText(d) {
  const nameOk = d.country && d.country.length <= 18;
  const bigEnough = d.r >= 10;
  return nameOk && bigEnough ? d.country : "";
}

const color = d3.scaleSequential(d3.interpolateTurbo).domain([0, 1]);

const sim = d3
  .forceSimulation()
  .force("x", d3.forceX(() => width / 2).strength(0.025))
  .force("y", d3.forceY(() => height / 2).strength(0.025))
  .force("collide", d3.forceCollide((d) => d.r * 1.15 + 12).iterations(4))
  .force("charge", d3.forceManyBody().strength(0.5));

sim.on("tick", () => {
  g.selectAll(".node").attr("transform", (d) => `translate(${d.x},${d.y})`);
});

let rScale = null;

function fmtPop(v, unit) {
  const given = d3.format(",.0f")(v);
  if (unit && unit.toLowerCase().includes("1000")) {
    const persons = d3.format(",.0f")(v * 1000);
    return `${given} (${persons} persons approx.)`;
  }
  return given;
}

function setTooltip(event, d) {
  const unit = d.unit || "";
  const v = d.values[String(year)];
  const valText = v == null ? "No data" : fmtPop(v, unit);

  tooltip.style(
    "transform",
    `translate(${event.clientX + 14}px, ${event.clientY + 14}px)`
  ).html(`
          <div class="t">${d.country}</div>
          <div><span class="m">Year:</span> ${year}</div>
          <div><span class="m">Population:</span> ${valText}</div>
          <div><span class="m">Unit:</span> ${unit}</div>
        `);
}

function hideTooltip() {
  tooltip.style("transform", "translate(-9999px, -9999px)");
}

function computeYears(data) {
  const set = new Set();
  for (const c of data) {
    for (const y of Object.keys(c.values || {})) set.add(+y);
  }
  return Array.from(set).sort((a, b) => a - b);
}

function maxForYear(y) {
  const ys = String(y);
  let m = 0;
  for (const c of countries) {
    const v = c.values?.[ys];
    if (v != null && isFinite(v)) m = Math.max(m, v);
  }
  return m;
}

function updateScalesAndRadii() {
  const m = maxForYear(year);
  rScale = d3
    .scaleSqrt()
    .domain([0, m || 1])
    .range([2, Math.min(width, height) / 8]);

  for (const d of countries) {
    const v = d.values?.[String(year)] ?? 0;
    d.r = rScale(v);
  }

  sim.force("collide", d3.forceCollide((d) => d.r * 1.15 + 12).iterations(4));
}

function updateYearUI() {
  yearLabel.textContent = year;
  yearSlider.value = year;
}

function updateUnitUI() {
  const u = countries.find((d) => d.unit)?.unit || "";
}

function render() {
  updateScalesAndRadii();
  updateYearUI();

  const active = countries
    .filter((d) => hasValueForYear(d, year))
    .map((d) => {
      const v = d.values[String(year)];
      d.r = rScale(v);
      return d;
    })
    .filter((d) => labelText(d) !== "");

  const nodes = g.selectAll(".node").data(active, (d) => d.country);

  const nodesEnter = nodes
    .enter()
    .append("g")
    .attr("class", "node")
    .on("pointermove", (event, d) => setTooltip(event, d))
    .on("pointerleave", hideTooltip);

  nodesEnter
    .append("circle")
    .attr("r", 0)
    .attr("fill", (d) => color(hash01(d.country)))
    .attr("fill-opacity", 0.75);

  nodesEnter
    .append("text")
    .attr("font-size", (d) => Math.max(9, Math.min(18, d.r / 2.2)))
    .text(labelText);

  const merged = nodesEnter.merge(nodes);

  merged
    .select("circle")
    .transition()
    .duration(850)
    .attr("r", (d) => d.r);

  merged
    .select("text")
    .text(labelText)
    .transition()
    .duration(300)
    .attr("font-size", (d) => Math.max(9, Math.min(18, d.r / 2.2)));

  nodes.exit().remove();

  sim.nodes(active);
  sim.alpha(0.9).restart();
}

function nextYear() {
  const idx = years.indexOf(year);
  const nextIdx = idx < 0 ? 0 : (idx + 1) % years.length;
  year = years[nextIdx];
  render();
}

function play() {
  if (isPlaying) return;
  isPlaying = true;
  playBtn.textContent = "Pause";

  const interval = +speedSlider.value;
  timer = d3.interval(() => nextYear(), interval);
}

function pause() {
  isPlaying = false;
  playBtn.textContent = "Play";
  if (timer) timer.stop();
  timer = null;
}

playBtn.addEventListener("click", () => {
  if (isPlaying) pause();
  else play();
});

resetBtn.addEventListener("click", () => {
  pause();
  year = years[0];
  render();
});

yearSlider.addEventListener("input", (e) => {
  year = +e.target.value;
  render();
});

speedSlider.addEventListener("input", (e) => {
  const v = +e.target.value;
  if (isPlaying) {
    pause();
    play();
  }
});

window.addEventListener("resize", () => {
  ({ width, height } = getSize());
  sim.force("x", d3.forceX(() => width / 2).strength(0.06));
  sim.force("y", d3.forceY(() => height / 2).strength(0.06));
  render();
});

const raw = await d3.json(JSON_URL);

countries = raw
  .filter((d) => !EXCLUDED_AREAS.has(d.country))
  .map((d) => ({
    country: d.country,
    unit: d.unit,
    values: d.values,
    x: Math.random() * width,
    y: Math.random() * height,
    r: 5,
  }));

years = computeYears(countries);

const minYear = years[0];
const maxYear = years[years.length - 1];
yearSlider.min = minYear;
yearSlider.max = maxYear;

year = Math.max(minYear, Math.min(+yearSlider.value, maxYear));

updateUnitUI();

render();

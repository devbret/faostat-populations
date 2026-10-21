import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { loadData } from "./src/data.js";
import { onThemeChange } from "./src/palette.js";
import { createPlayer } from "./src/player.js";
import { createBubbles } from "./src/bubbles.js";

const $ = (id) => document.getElementById(id);

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  year: 1950,
  metric: "total",
  colorBy: "growth",
  layout: "pack",
  search: "",
  reducedMotion: motionQuery.matches,
  width: 0,
  height: 0,
};

let data;
let player;
let bubbles;

init();

async function init() {
  try {
    data = await loadData();
  } catch (err) {
    $("loader").innerHTML =
      `<p class="load-error"><strong>Could not load the data.</strong></p>` +
      `<p>${err.message}</p>`;
    $("loader").dataset.state = "error";
    return;
  }

  $("loader").remove();

  const { meta } = data;
  state.year = meta.years[0];

  player = createPlayer({
    years: meta.years,
    onChange: onPlayerChange,
  });

  bubbles = createBubbles({
    svg: d3.select("#viz"),
    tooltipEl: $("tooltip"),
    data,
  });

  wireControls();
  wireKeyboard();

  onThemeChange(() => renderAll());
  motionQuery.addEventListener("change", (e) => {
    state.reducedMotion = e.matches;
    renderAll();
  });

  new ResizeObserver(measure).observe(document.body);
  measure();
}

function measure() {
  const svg = $("viz");
  const rect = svg.getBoundingClientRect();
  state.width = rect.width;
  state.height = rect.height;

  bubbles.resize(rect.width, rect.height);
  renderAll();
}

function renderAll() {
  bubbles.update({ ...state });
  renderYearChrome();
}

function renderYearChrome() {
  $("yearWatermark").textContent = state.year;
}

function onPlayerChange({ year, playing, rate }) {
  state.year = year;
  $("playFwdBtn").setAttribute("aria-pressed", String(playing));
  $("playFwdBtn").textContent = playing ? "❚❚" : "▶";
  $("speedLabel").value = `${rate} yr/s`;
  renderAll();
}

function wireControls() {
  $("playFwdBtn").addEventListener("click", () => player.toggle());
  $("stepFwdBtn").addEventListener("click", () => {
    player.pause();
    player.step(1);
  });
  $("stepBackBtn").addEventListener("click", () => {
    player.pause();
    player.step(-1);
  });
  $("toStartBtn").addEventListener("click", () => {
    player.pause();
    player.setYear(player.first);
  });
  $("toEndBtn").addEventListener("click", () => {
    player.pause();
    player.setYear(player.last);
  });

  $("speed").addEventListener("input", (e) => player.setRate(+e.target.value));
  $("endMode").addEventListener("change", (e) =>
    player.setEndMode(e.target.value),
  );

  $("metric").addEventListener("change", (e) => {
    state.metric = e.target.value;
    renderAll();
  });
  $("colorBy").addEventListener("change", (e) => {
    state.colorBy = e.target.value;
    renderAll();
  });
  $("layout").addEventListener("change", (e) => {
    state.layout = e.target.value;
    renderAll();
  });
  let searchTimer;
  $("search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    const value = e.target.value;
    searchTimer = setTimeout(() => {
      state.search = value.trim();
      renderAll();
    }, 120);
  });

  $("themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    root.dataset.theme = current === "dark" ? "light" : "dark";
  });
}

function wireKeyboard() {
  window.addEventListener("keydown", (event) => {
    const tag = event.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

    switch (event.key) {
      case " ":
        event.preventDefault();
        player.toggle();
        break;
      case "ArrowRight":
        event.preventDefault();
        player.pause();
        player.step(event.shiftKey ? 10 : 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        player.pause();
        player.step(event.shiftKey ? -10 : -1);
        break;
      case "Home":
        event.preventDefault();
        player.pause();
        player.setYear(player.first);
        break;
      case "End":
        event.preventDefault();
        player.pause();
        player.setYear(player.last);
        break;
      case "Escape":
        bubbles.dismissTooltip();
        break;
      default:
        break;
    }
  });
}

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { palette, DOMAINS } from "./palette.js";
import { shortName } from "./shortnames.js";
import * as fmt from "./format.js";

const TOP_INSET = 14;

const measure = document.createElement("canvas").getContext("2d");

function textWidth(text, fontSize) {
  measure.font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  return measure.measureText(text).width;
}

export function createBubbles({ svg, data }) {
  const root = svg.append("g").attr("class", "bubbles");
  const nodeLayer = root.append("g").attr("class", "nodes");
  const axisLayer = root.append("g").attr("class", "bubble-axis");
  const clusterLayer = root.append("g").attr("class", "cluster-labels");

  let width = 0;
  let height = 0;
  let state = null;
  let active = [];
  let rScale = null;
  let xScale = null;

  let k = 1;

  const zoom = d3
    .zoom()
    .scaleExtent([1, 24])
    .on("zoom", (event) => {
      k = event.transform.k;
      root.attr("transform", event.transform);
      applyZoomScaling();
    });

  svg.call(zoom).on("dblclick.zoom", () => resetZoom());

  const sim = d3.forceSimulation().velocityDecay(0.35).on("tick", ticked);

  function ticked() {
    const bottom = height - (xScale || state?.layout === "region" ? 44 : 12);
    for (const d of active) {
      d.x = Math.max(d.r + 2, Math.min(width - d.r - 2, d.x));
      d.y = Math.max(TOP_INSET + d.r, Math.min(bottom - d.r, d.y));
    }

    nodeLayer
      .selectAll("g.node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  function sizeOf(c, year) {
    return data.sizeValue(c, state.metric, year);
  }

  function radius(v) {
    return v == null ? 0 : Math.max(1, rScale(v));
  }

  function fillOf(d) {
    const t = palette();
    const v = data.colorValue(d.c, state.colorBy, state.year);
    if (v == null) return t.muted;
    if (state.colorBy === "growth") return t.growth(v);
    if (state.colorBy === "urban") return t.urban(v);
    if (state.colorBy === "sexRatio") return t.sexRatio(v);
    return t.accent;
  }

  function screenR(d) {
    return d.r * k;
  }

  function screenFont(d) {
    return Math.max(9, Math.min(20, screenR(d) / 2.4));
  }

  function labelFor(d) {
    if (screenR(d) < 11) return "";
    const label = shortName(d.c.name);
    return textWidth(label, screenFont(d)) <= screenR(d) * 1.7 ? label : "";
  }

  function fontFor(d) {
    return screenFont(d) / k;
  }

  function applyZoomScaling() {
    nodeLayer
      .selectAll("g.node")
      .select("text.bubble-label")
      .attr("font-size", fontFor)
      .text(labelFor);

    nodeLayer
      .selectAll("g.node")
      .select("circle.mark")
      .attr("stroke-width", 2 / k)
      .attr(
        "stroke-dasharray",
        state && data.isProjection(state.year) ? `${3 / k} ${2.5 / k}` : null,
      );

    axisLayer.selectAll(".tick text").attr("font-size", 11 / k);
    axisLayer.selectAll(".tick line").attr("stroke-width", 1 / k);
    axisLayer.select(".domain").attr("stroke-width", 1 / k);
    axisLayer.select("text.axis-caption").attr("font-size", 11 / k);
    clusterLayer.selectAll("text").attr("font-size", 12 / k);
  }

  function resetZoom() {
    svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
  }

  function constrainZoom() {
    zoom.translateExtent([
      [0, 0],
      [width, height],
    ]);
  }

  function matchesSearch(d) {
    if (!state.search) return true;
    return d.c.name.toLowerCase().includes(state.search.toLowerCase());
  }

  function buildScales() {
    const t = palette();
    rScale = d3
      .scaleSqrt()
      .domain([0, data.globalMax[state.metric] || 1])
      .range([0, Math.min(width, height) / 5.5]);

    axisLayer.selectAll("*").remove();
    clusterLayer.selectAll("*").remove();
    xScale = null;

    if (state.layout === "growth" || state.layout === "urban") {
      const domain =
        state.layout === "growth"
          ? [DOMAINS.growth[0], DOMAINS.growth[2]]
          : DOMAINS.urban;
      xScale = d3
        .scaleLinear()
        .domain(domain)
        .range([90, width - 60])
        .clamp(true);

      const axis = d3
        .axisBottom(xScale)
        .ticks(7)
        .tickFormat(
          state.layout === "growth"
            ? (v) => `${v > 0 ? "+" : ""}${v}%`
            : (v) => `${v}%`,
        )
        .tickSizeOuter(0);

      const gAxis = axisLayer
        .attr("transform", `translate(0,${height - 28})`)
        .call(axis);
      gAxis.select(".domain").attr("stroke", t.axis);
      gAxis.selectAll(".tick line").attr("stroke", t.axis);
      gAxis.selectAll(".tick text").attr("fill", t.muted).attr("font-size", 11);

      axisLayer
        .append("text")
        .attr("class", "axis-caption")
        .attr("x", width - 60)
        .attr("y", -10)
        .attr("text-anchor", "end")
        .attr("fill", t.muted)
        .attr("font-size", 11)

        .text(
          state.layout === "growth"
            ? "← shrinking · annual growth, 5-year rate · growing →"
            : "← rural · share of population urban · urban →",
        );
    }

    if (state.layout === "region") {
      const regions = data.regions;
      const band = (width - 120) / regions.length;
      clusterLayer.attr("transform", `translate(0,0)`);
      regions.forEach((region, i) => {
        const cx = 60 + band * (i + 0.5);
        clusterLayer
          .append("text")
          .attr("x", cx)
          .attr("y", height - 14)
          .attr("text-anchor", "middle")
          .attr("fill", t.ink2)
          .attr("font-size", 12)
          .attr("font-weight", 600)
          .text(region);
      });
    }
  }

  function clusterX(d) {
    const regions = data.regions;
    const band = (width - 120) / regions.length;
    const i = regions.indexOf(d.c.region);
    return 60 + band * (i + 0.5);
  }

  function applyForces() {
    const cx = width / 2;
    const cy = (height - 40) / 2;

    sim.force("collide", d3.forceCollide((d) => d.r + 1.2).iterations(3));

    if (state.layout === "growth" || state.layout === "urban") {
      const accessor =
        state.layout === "growth"
          ? (d) => data.growthAt(d.c, state.year)
          : (d) => data.urbanShareAt(d.c, state.year);
      sim
        .force(
          "x",
          d3
            .forceX((d) => {
              const v = accessor(d);
              return v == null ? cx : xScale(v);
            })
            .strength(0.55),
        )
        .force("y", d3.forceY(cy).strength(0.06));
    } else if (state.layout === "region") {
      sim
        .force("x", d3.forceX(clusterX).strength(0.35))
        .force("y", d3.forceY(cy).strength(0.06));
    } else {
      sim
        .force("x", d3.forceX(cx).strength(0.035))
        .force("y", d3.forceY(cy).strength(0.035));
    }
  }

  function update(next) {
    const prev = state;
    state = next;
    const t = palette();

    const metricChanged = !prev || prev.metric !== state.metric;
    const layoutChanged = !prev || prev.layout !== state.layout;
    if (metricChanged || layoutChanged || !rScale) buildScales();

    const rows = [];
    for (const c of data.countries) {
      const v = sizeOf(c, state.year);
      if (v == null) continue;
      rows.push({ c, v, r: radius(v) });
    }

    const byName = new Map(active.map((d) => [d.c.name, d]));
    active = rows.map((row) => {
      const existing = byName.get(row.c.name);
      if (existing) {
        existing.v = row.v;
        existing.r = row.r;
        return existing;
      }

      return {
        ...row,
        x: width / 2 + (Math.random() - 0.5) * 40,
        y: height / 2 + (Math.random() - 0.5) * 40,
      };
    });

    const isProjection = data.isProjection(state.year);

    const dur = state.reducedMotion ? 0 : 600;

    const nodes = nodeLayer.selectAll("g.node").data(active, (d) => d.c.name);

    nodes.exit().remove();

    const enter = nodes
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("role", "listitem")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    enter.append("circle").attr("class", "mark").attr("r", 0);
    enter.append("text").attr("class", "bubble-label");

    const merged = enter.merge(nodes);

    merged.attr(
      "aria-label",
      (d) =>
        `${d.c.name}, ${fmt.people(d.v)} in ${state.year}${
          isProjection ? ", projected" : ""
        }`,
    );

    merged
      .select("circle.mark")
      .attr("fill", fillOf)

      .attr("fill-opacity", (d) => (matchesSearch(d) ? 0.85 : 0.1))

      .attr("stroke", isProjection ? t.ink2 : t.surface)
      .attr("stroke-opacity", (d) => {
        if (!matchesSearch(d)) return 0.12;
        return isProjection ? 0.5 : 0.9;
      })
      .transition()
      .duration(dur)
      .attr("r", (d) => d.r);

    merged
      .select("text.bubble-label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("pointer-events", "none")
      .attr("fill", t.mode === "dark" ? "#ffffff" : "#0b0b0b")
      .attr("fill-opacity", (d) => (matchesSearch(d) ? 0.92 : 0.1))
      .attr("font-weight", 700);

    applyZoomScaling();
    applyForces();
    sim.nodes(active);

    sim.alpha(state.reducedMotion ? 0 : 0.32).restart();
    if (state.reducedMotion) {
      sim.tick(60);
      ticked();
    }
  }

  function resize(w, h) {
    width = w;
    height = h;
    constrainZoom();
    if (state) {
      buildScales();
      update(state);
    }
  }

  return { update, resize };
}

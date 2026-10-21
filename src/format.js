import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const K = 1000;

const fixed1 = d3.format(",.1f");
const comma = d3.format(",.0f");
const signed1 = d3.format("+.1f");
const fixed2 = d3.format(".2f");

export function people(thousands) {
  if (thousands == null) return "n/a";
  const n = thousands * K;
  if (n >= 1e9) return `${fixed1(n / 1e9)}B`;
  if (n >= 1e6) return `${fixed1(n / 1e6)}M`;
  if (n >= 1e3) return `${fixed1(n / 1e3)}K`;
  return comma(n);
}

export function count(thousands) {
  return thousands == null ? "n/a" : comma(thousands * K);
}

export function growth(pctPerYear) {
  return pctPerYear == null ? "n/a" : `${signed1(pctPerYear)}% / yr`;
}

export function share(pct) {
  return pct == null ? "n/a" : `${fixed1(pct)}%`;
}

export function ratio(value) {
  return value == null ? "n/a" : fixed2(value);
}

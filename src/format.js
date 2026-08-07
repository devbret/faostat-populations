import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const K = 1000;

const fixed1 = d3.format(",.1f");
const comma = d3.format(",.0f");

export function people(thousands) {
  if (thousands == null) return "n/a";
  const n = thousands * K;
  if (n >= 1e9) return `${fixed1(n / 1e9)}B`;
  if (n >= 1e6) return `${fixed1(n / 1e6)}M`;
  if (n >= 1e3) return `${fixed1(n / 1e3)}K`;
  return comma(n);
}

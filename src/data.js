import { REGION_ORDER } from "./palette.js";

const BUNDLE_URL = "population.json";

const GROWTH_WINDOW = 5;

export const SERIES = {
  total: "Total population",
  male: "Male population",
  female: "Female population",
  rural: "Rural population",
  urban: "Urban population",
};

export async function loadData() {
  const res = await fetch(BUNDLE_URL);
  if (!res.ok) {
    throw new Error(
      `Could not load ${BUNDLE_URL} (${res.status}). Run "python3 app.py" ` +
        `to generate it from the FAOSTAT CSV.`,
    );
  }
  const bundle = await res.json();
  return index(bundle);
}

function index(bundle) {
  const { meta, countries } = bundle;
  const years = meta.years;
  const yearIndex = new Map(years.map((y, i) => [y, i]));

  const api = {
    meta,
    countries,
    years,
    yearIndex,
    regions: REGION_ORDER.filter((r) => countries.some((c) => c.region === r)),

    isProjection: (year) => year > meta.lastEstimateYear,

    valueAt(c, series, year) {
      const i = yearIndex.get(year);
      if (i === undefined) return null;
      const arr = c[series];
      return arr ? arr[i] : null;
    },

    growthAt(c, year) {
      const arr = c.total;
      if (!arr) return null;
      const i = yearIndex.get(year);
      if (i === undefined) return null;

      for (let w = GROWTH_WINDOW; w >= 1; w--) {
        const j = i - w;
        if (j < 0) continue;
        if (arr[j] > 0 && arr[i] > 0) {
          return ((arr[i] / arr[j]) ** (1 / w) - 1) * 100;
        }
      }
      for (let w = 1; w <= GROWTH_WINDOW; w++) {
        const j = i + w;
        if (j >= arr.length) break;
        if (arr[j] > 0 && arr[i] > 0) {
          return ((arr[j] / arr[i]) ** (1 / w) - 1) * 100;
        }
      }
      return null;
    },

    urbanShareAt(c, year) {
      const u = api.valueAt(c, "urban", year);
      const r = api.valueAt(c, "rural", year);
      if (u == null || r == null) return null;
      const denom = u + r;
      return denom > 0 ? (u / denom) * 100 : null;
    },

    sexRatioAt(c, year) {
      const m = api.valueAt(c, "male", year);
      const f = api.valueAt(c, "female", year);
      return m != null && f > 0 ? m / f : null;
    },

    sizeValue(c, metric, year) {
      return api.valueAt(c, metric, year);
    },

    colorValue(c, colorBy, year) {
      switch (colorBy) {
        case "growth":
          return api.growthAt(c, year);
        case "urban":
          return api.urbanShareAt(c, year);
        case "sexRatio":
          return api.sexRatioAt(c, year);
        default:
          return null;
      }
    },
  };

  api.globalMax = {};
  for (const key of Object.keys(SERIES)) {
    let m = 0;
    for (const c of countries) {
      const arr = c[key];
      if (!arr) continue;
      for (const v of arr) if (v != null && v > m) m = v;
    }
    api.globalMax[key] = m;
  }

  return api;
}

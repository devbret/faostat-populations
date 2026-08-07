import json
import re
import sys

import pandas as pd

import regions

INPUT_CSV = "Population_E_All_Data.csv"
OUTPUT_JSON = "population.json"

ELEMENTS = {
    511: "total",
    512: "male",
    513: "female",
    551: "rural",
    561: "urban",
}

AGGREGATE_CODE_FLOOR = 5000

LAST_ESTIMATE_YEAR = 2023

SOURCE = ("FAOSTAT Annual Population (FAO), republishing UN World Population "
          "Prospects 2024 revision, medium variant")

def year_columns(df):
    return [c for c in df.columns if re.fullmatch(r"Y\d{4}", str(c))]

def main():
    try:
        df = pd.read_csv(INPUT_CSV, low_memory=False)
    except FileNotFoundError:
        sys.exit(
            f"{INPUT_CSV} not found. Download the 'All Data' CSV for Annual "
            "Population from https://www.fao.org/faostat/en/#data/OA and unzip "
            "it into this directory."
        )

    ycols = year_columns(df)
    years = [int(c[1:]) for c in ycols]

    df = df[df["Element Code"].isin(ELEMENTS)].copy()
    df = df[df["Area Code"] < AGGREGATE_CODE_FLOOR]
    df["m49"] = df["Area Code (M49)"].astype(str).str.lstrip("'")
    df = df[~df["m49"].isin(regions.DOUBLE_COUNTED)]

    units = set(df["Unit"].unique())
    if units != {"1000 No"}:
        sys.exit(f"Unexpected units in source data: {units}")

    unmapped = sorted(
        {(r.m49, r.Area) for r in df.itertuples()
         if regions.lookup(r.m49)[0] is None}
    )
    if unmapped:
        listing = "\n".join(f"  {m} {name}" for m, name in unmapped)
        sys.exit(
            "These areas have no M49 region mapping. Add them to regions.py:\n"
            + listing
        )

    countries = []
    for (area_code, m49, name), rows in df.groupby(
        ["Area Code", "m49", "Area"], sort=False
    ):
        region, subregion = regions.lookup(m49)
        hist = regions.HISTORICAL.get(m49)

        record = {
            "name": name,
            "m49": m49,
            "code": int(area_code),
            "region": region,
            "subregion": subregion,
        }
        if hist:
            record["historical"] = True
            if hist[1] is not None:
                record["endedYear"] = hist[1]

        has_any = False
        for _, row in rows.iterrows():
            key = ELEMENTS[row["Element Code"]]
            series = [
                round(float(row[c]), 3) if pd.notna(row[c]) else None
                for c in ycols
            ]
            if any(v is not None for v in series):
                record[key] = series
                has_any = True

        if has_any and "total" in record:
            countries.append(record)

    countries.sort(key=lambda c: c["name"])

    bundle = {
        "meta": {
            "unit": "1000 No",
            "unitLabel": "thousands of people",
            "multiplier": 1000,
            "years": years,
            "lastEstimateYear": LAST_ESTIMATE_YEAR,
            "source": SOURCE,
            "series": list(ELEMENTS.values()),
        },
        "countries": countries,
    }

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(bundle, f, separators=(",", ":"))

    n_hist = sum(1 for c in countries if c.get("historical"))
    coverage = {
        key: sum(1 for c in countries if key in c) for key in ELEMENTS.values()
    }
    print(f"Wrote {len(countries)} areas ({n_hist} historical) "
          f"x {len(years)} years [{years[0]}-{years[-1]}] to {OUTPUT_JSON}")
    print(f"  series coverage: {coverage}")
    print(f"  estimates through {LAST_ESTIMATE_YEAR}, "
          f"projections {LAST_ESTIMATE_YEAR + 1}-{years[-1]}")

if __name__ == "__main__":
    main()

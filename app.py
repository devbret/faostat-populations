import pandas as pd
import json
import re

INPUT_CSV = "Population_E_All_Data.csv"
OUTPUT_JSON = "population_total.json"

TOTAL_POPULATION_CODE = 511

df = pd.read_csv(INPUT_CSV)

year_cols = [c for c in df.columns if re.fullmatch(r"Y\d{4}", str(c))]

df = df[df["Element Code"] == TOTAL_POPULATION_CODE].copy()

df = df.drop_duplicates(subset=["Area"])

countries = []

for _, row in df.iterrows():
    yearly_values = {}

    for col in year_cols:
        value = row[col]
        if pd.notna(value):
            year = col[1:] 
            yearly_values[year] = float(value)

    countries.append({
        "country": row["Area"],
        "unit": row["Unit"],
        "values": yearly_values 
    })

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(countries, f, indent=2)

print(f"Wrote {len(countries)} countries to {OUTPUT_JSON}")

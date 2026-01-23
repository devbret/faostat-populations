# FAOSTAT Populations

![Screenshot feautring relatively sized bubbles representing total populations from countries around the world.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/c22bd4f7-d278-42ef-b10b-79f254065405.png)

Transforms CSV data into an interactive visualization to reveal how country populations change over time.

## Overview

The first program is a Python data-preparation script which converts a large population CSV dataset into JSON. It reads the source CSV, filters for total population records and removes duplicate countries. The final output is a concise JSON file where each country includes its name, unit of measurement and a dictionary of population values.

There is also a D3.js visualization to animate population changes over time using a bubble graph. It loads the generated JSON file, filters out regions and represents each country as circles whose radius reflects population magnitude for a given year. The data visualization also recalculates scales per year, prevents bubble overlap and provides tooltips.

## Other Notes

In terms of the [source CSV dataset](https://www.fao.org/faostat/en/#data/OA), it is publicly available and provides historical population data across many countries and regions.

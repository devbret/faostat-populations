# FAOSTAT Populations

![Screenshot feautring relatively sized bubbles representing total populations from countries around the world.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/c22bd4f7-d278-42ef-b10b-79f254065405.png)

Transforms CSV data into an interactive visualization to reveal how country populations change over time.

## Overview

The first program is a Python data-preparation script which converts a large population CSV dataset into JSON. It reads the source CSV, filters for total population records and removes duplicate countries. The final output is a concise JSON file where each country includes its name, unit of measurement and a dictionary of population values.

There is also a D3.js visualization to animate population changes over time using a bubble graph. It loads the generated JSON file, filters out regions and represents each country as circles whose radius reflects population magnitude for a given year. The data visualization also recalculates scales per year, prevents bubble overlap and provides tooltips.

## Set Up Instructions

Below are the required software programs and instructions for installing and using this application.

### Programs Needed

- [Git](https://git-scm.com/downloads)

- [Python](https://www.python.org/downloads/)

### Steps

1. Install the above programs

2. Open a terminal

3. Clone this repository using `git` by running the following command: `git clone git@github.com:devbret/faostat-populations.git`

4. Navigate to the repo's directory by running: `cd faostat-populations`

5. Create a virtual environment with this command: `python3 -m venv venv`

6. Activate your virtual environment using: `source venv/bin/activate`

7. Download the [source data](https://www.fao.org/faostat/en/#data/OA) as a CSV file

8. Place the `Population_E_All_Data.csv` file into the root directory of this repo

9. Process the raw data using the Python script by running the following command: `python3 app.py`

10. Launch the application's frontend by starting a Python server with the following command: `python3 -m http.server`

11. Access the heatmap visualization in a browser by visiting: `http://localhost:8000`

12. Explore and enjoy

## Other Considerations

This project repo is intended to demonstrate an ability to do the following:

- Transform raw population CSV data into structured JSON and interactively visualize the output

- Enable users to explore and compare changes in country populations over time

If you have any questions or would like to collaborate, please reach out either on GitHub or via [my website](https://bretbernhoft.com/).

# FAOSTAT Populations Bubble Visualization

![Screenshot feautring relatively sized bubbles representing total populations from countries around the world.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/c22bd4f7-d278-42ef-b10b-79f254065405.png)

Transform FAOSTAT population CSV data into an animated D3 bubble visualization for exploring country-level population changes over time.

## Application Overview

The first program is a Python data-preparation script which converts a large population CSV dataset into JSON. It reads the source CSV, filters for total population records and removes duplicate countries. The final output is a concise JSON file where each country includes its name, unit of measurement and a dictionary of population values.

There is also a D3.js visualization to animate population changes over time using a bubble graph. It loads the generated JSON file, filters out regions and represents each country as circles whose radius reflects population magnitude for a given year. The data visualization also recalculates scales per year, prevents bubble overlap and provides tooltips.

## Basic Setup Instructions

Below are the required software programs and instructions for installing and using this application on a Linux machine.

### Programs Needed

- [Git](https://git-scm.com/downloads)

- [Python](https://www.python.org/downloads/)

### Steps

1. Install the above programs

2. Open a terminal

3. Clone this repository: `git clone git@github.com:devbret/faostat-populations.git`

4. Navigate to the repo's directory: `cd faostat-populations`

5. Create a virtual environment: `python3 -m venv venv`

6. Activate your virtual environment: `source venv/bin/activate`

7. Download the [source data](https://www.fao.org/faostat/en/#data/OA) as a CSV file

8. Move the `Population_E_All_Data.csv` file into the root directory of this repo

9. Process the raw data: `python3 app.py`

10. Start an HTTP server: `python3 -m http.server`

11. Access the visualization in a browser: `http://localhost:8000`

12. When finished, stop the HTTP server: `CTRL + c`

13. Exit the virtual environment: `deactivate`

## Other Considerations

This project repo is intended to demonstrate an ability to do the following:

- Convert CSV data into structured JSON for country-level population visualization

- Create an interactive D3 bubble chart showing how national populations change over time

- Animate population changes with play, pause, reset, slider and speed controls

- Use bubble size, labels, colors and tooltips to make population differences easy to explore

If you have any questions or would like to collaborate, please reach out either on GitHub or via [my website](https://bretbernhoft.com/).

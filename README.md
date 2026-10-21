# FAOSTAT Populations Bubble Visualization

![Screenshot feautring relatively sized bubbles representing total populations from countries around the world.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/96f22440-391c-41ce-96c3-489d0f06e8e6.png)

Transform FAOSTAT population CSV data into an animated D3 bubble visualization for exploring country-level population changes over time.

## Application Overview

The first program is a Python data-preparation script which converts a large population CSV dataset into JSON. It reads the source CSV, filters for total population records and removes duplicate countries. The final output is a concise JSON file where each country includes its name, unit of measurement and a dictionary of population values.

There is also a D3.js visualization to animate population changes over time using a bubble graph. It loads the generated JSON file, filters out regions and represents each country as circles whose radius reflects population magnitude for a given year. The data visualization also recalculates scales per year, prevents bubble overlap and provides tooltips.

## Basic Setup Instructions

Below are the required software programs and instructions for installing and using this application on a Linux machine.

### Programs Needed

- [Git](https://git-scm.com/downloads)

- [Python](https://www.python.org/downloads/)

### Setup Steps

1. Install the above programs

2. Open a terminal

3. Clone this repository: `git clone git@github.com:devbret/faostat-populations.git`

4. Navigate to the repo's directory: `cd faostat-populations`

5. Create a virtual environment: `python3 -m venv venv`

6. Activate your virtual environment: `source venv/bin/activate`

7. Install the needed dependencies: `pip install -r requirements.txt`

8. Download the [source data](https://www.fao.org/faostat/en/#data/OA) as a CSV file

9. Move the `Population_E_All_Data.csv` file into the root directory of this repo

10. Process the raw data: `python3 app.py`

11. Start an HTTP server: `python3 -m http.server`

12. Access the visualization in a browser: `http://localhost:8000`

13. When finished, stop the HTTP server: `CTRL + c`

14. Exit the virtual environment: `deactivate`

## Other Considerations

The sections below cover details outside of setting up and running this application. The first subsection outlines technical skills this repository is meant to showcase, while the second explains the terms under which the code may be reused, along with how to get in touch.

### Abilities Demonstrated

This project repo is intended to demonstrate an ability to do the following:

- Convert CSV data into structured JSON for country-level population visualization

- Create an interactive D3 bubble chart showing how national populations change over time

- Animate population changes with play, pause, reset, slider and speed controls

- Use bubble size, labels, colors and tooltips to make population differences easy to explore

### License Information

This project is released under the MIT License, with the full text available in the [LICENSE](LICENSE) file. You are free to use, modify, publish and sell copies of this software, including for commercial purposes, provided the original copyright and permission notice are included in all copies or substantial portions of the software.

The software is provided "as is", without warranty of any kind and the author is not liable for any claim or damages arising from its use. Please note the FAOSTAT population data itself is distributed by the Food and Agriculture Organization under its own terms, which are separate from this repository's license.

If you have any questions or would like to collaborate, please reach out either on GitHub or via [my website](https://bretbernhoft.com/).

VegGuide Crawler
================

Overview
--------

This tool uses the [VegGuide.org REST API](https://www.vegguide.org/site/api-docs) to retrieves all the vegan 
locations from http://www.vegguide.org and retrieves the latitude & longitude coordinates of each entry from
http://open.mapquestapi.com/nominatim/v1/. Currently, it does not support downloading the images of each location.

Use
---

To use this tool, first install its dependencies.

    npm install

Now you can run **vegguide-crawler** with the following command.

    node index.js -f first_entry_number -l last_entry_number

After it finishes running, you should see a large file, which is either *output/entries.json* or the file you specified.

### Optional Arguments
* **-c** or **--conf**: the path to the config file
* **-f** or **--first**: the number of the first entry to crawl
* **-l** or **--last**: the number of the last entry to crawl
* **-o** or **--output**: the path to the output file

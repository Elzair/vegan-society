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

    node index.js first_entry_number last_entry_number

After it finishes running, you should see a large file, *output/locations.json*.

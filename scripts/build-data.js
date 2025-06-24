import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { csvParse } from "d3-dsv";
import { MagicArray, renderJSON, autoType } from "@onsvisual/robo-utils";
import rosae from "rosaenlg";
import { parse } from "node-html-parser";
import { geo_types, cols, source_dir, data_file, template_file, files_to_copy } from "./build-data.config.js";

// Load data CSV
let data_raw = readFileSync(source_dir + data_file, {encoding:'utf8', flag:'r'});
let data = new MagicArray(...csvParse(data_raw, autoType));

// Create the output directories (if they don't exist)
let dir = "./static/data/json";
if (!existsSync(dir)){
    mkdirSync(dir, { recursive: true });
}

// Load PUG file
let template = readFileSync(source_dir + template_file, {encoding:'utf8', flag:'r'});

// Process data file into array of LAs and keyed lookup of all geographies
let places = data.filter(d => geo_types.includes(d.areacd.slice(0,3)));
let lookup = {};
data.forEach(d => lookup[d.areacd] = d);

// Cycle through LAs (and null for "no area selected")
[...places, null].forEach(place => {
    // Render the PUG template for selected place
    const data = renderJSON(template, place, places, lookup, rosae, parse);

    // Set the save path (default.json is when no area is selected)
    const path = `./static/data/json/${place ? place.areacd : "default"}.json`;

    // Write JSON output
    writeFileSync(path, JSON.stringify(data));
    console.log(`Wrote ${path}`);
});

// Generate filtered CSV (only including cols and geo_types defined in config.js file)
let csv_str = cols.join(",") + "\n";
let rows = []
places.forEach(place => rows.push(cols.map(col => {
    let val = place[col];
    return typeof val == "string" && val.includes(",") ? `"${val}"` : val;
}).join(",")));
csv_str += rows.join("\n");

// Write filtered CSV output
let path = "./static/data/places.csv";
writeFileSync(path, csv_str);
console.log(`Wrote ${path}`);
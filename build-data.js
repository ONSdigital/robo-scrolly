import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { csvParse, autoType } from "d3-dsv";
import { format } from "d3-format";
import { render } from "rosaenlg";
import { parse } from "node-html-parser";
import parseColor from "parse-color";
import { geo_types, cols, data_url, template_url } from "./build-data.config.js";

// MagicArray class simplifies sorting and filtering of arrays
class MagicArray extends Array {
	sortBy(key) {
		return this[0][key] && typeof this[0][key] === "number" ?
			new MagicArray(...this).sort((a, b) => b[key] - a[key]) :
			this[0][key] && typeof this[0][key] === "string" ? 
			new MagicArray(...this).sort((a, b) => a[key].localeCompare(b[key])) :
			this;
	}
	filterBy(key, val) {
		return !this[0][key] ? this :
			this.filter(d => d[key] === val);
	}
	trim(int) {
		return typeof int !== "number" ? this :
			int >= 0 ? this.slice(0, Math.floor(int)) :
			this.slice(Math.floor(int));
	}
	flip() {
		return new MagicArray(...this).reverse();
	}
}

// Load data CSV
let data_raw = readFileSync(data_url, {encoding:'utf8', flag:'r'});
let data = csvParse(data_raw, autoType);

// Create the output directories (if they don't exist)
let dir = "./static/data/json";
if (!existsSync(dir)){
    mkdirSync(dir, { recursive: true });
}

// Load PUG file
let template = readFileSync(template_url, {encoding:'utf8', flag:'r'});

// Process data file into array of LAs and keyed lookup of all geographies
let places = new MagicArray(...data.filter(d => geo_types.includes(d.areacd.slice(0,3))));
let lookup = {};
data.forEach(d => lookup[d.areacd] = d);

// Cycle through LAs (and null for "no area selected")
[...places, null].forEach(place => {
    // Render PUG template with data for selected LA
    let sections_raw = render(template, {place, places, lookup, format, language: 'en_US'});
    // Fix to remove spaces added between numbers and prefix/suffix symbols by RosaeNLG
	sections_raw = sections_raw.replace(/(?<=\d)\s+((?=%)|(?=p{2}))/g, "");
	sections_raw = sections_raw.replace(/(?<=[£€\$])\s+(?=\d)/g, "");
    // Fix to add spaces after closing </mark> </em> or <strong> tags unless followed by one of . , <
	sections_raw = sections_raw.replace(/((?<=<\/span>)|(?<=<\/mark>)|(?<=<\/strong>)|(?<=<\/em>)|(?<=<\/[abi]>))(?![\.,<:;])/g, " ");

    // Process <mark> tags for text colour contrast
    // THIS OUGHT TO BE HANDLED IN THE HTML PARSER SECTION BELOW!!
    let marks = sections_raw.match(/<mark([^<]*?)>/g);
    if (Array.isArray(marks)) {
        marks = marks.filter((d,i,arr) => arr.indexOf(d) == i && d.includes("background-color"));
        if (marks[0]) {
            let colors = marks.map(d => d.match(/(?<=background-color:\s).+(?=[";])/)[0]);
            colors.forEach(color => {
                let rgb = parseColor(color).rgb;
                let text_color = (((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000) > 125 ? "black" : "white";
                sections_raw = sections_raw.replaceAll(`background-color: ${color}`, `background-color: ${color}; color: ${text_color};`);
            });
        }
    }

    // Process HTML output of RosaeNLG into structured JSON
    let sections = [];
    let notes = [];
    let root = parse(sections_raw); // Convert HTML string into DOM-type object for parsing

    // Parse the DOM structure
    // Loop through main sections
    root.childNodes.forEach(node => {
        if (node.getAttribute) {
            let obj = {};
            if (node.getAttribute("id")) obj.id = node.getAttribute("id");
            if (node.getAttribute("class")) obj.type = node.getAttribute("class");
            let content = "";
            let subsections = [];

            // Loop through children (h2, p, subsections etc)
            node.childNodes.forEach(child => {
                if (child.tagName == "SECTION") {
                    subsections.push(child);
                } else if (child.tagName == "PROP" && child.getAttribute("class")) {
                    let prop = child.getAttribute("class");
                    let val = prop == "highlighted" ? child.innerText.replaceAll(" ","").split(",") : child.innerText;
                    obj[prop] = val;
                } else {
                    content += child.outerHTML;
                }
            });
            if (content.length > 0) obj.content = content;

            // If there are sub-sections (eg. for scrollers), process these similarly sections
            // This could probably better be done recursively
            if (subsections[0]) {
                let subs = [];
                subsections.forEach(sub => {
                    let obj = {};
                    if (sub.getAttribute("id")) obj.id = sub.getAttribute("id");
                    if (sub.getAttribute("class")) obj.type = sub.getAttribute("class");
                    let content = "";
                    sub.childNodes.forEach(child => {
                        if (child.tagName == "PROP" && child.getAttribute("class")) {
                            let prop = child.getAttribute("class");
                            let val = prop == "highlighted" ? child.innerText.replaceAll(" ","").split(",") : child.innerText;
                            obj[prop] = val;
                        } else {
                            content += child.outerHTML;
                        }
                    });
                    if (content.length > 0) obj.content = content;
                    subs.push(obj);
                });
                obj.sections = subs;
            }
            sections.push(obj);
        } else {
            // Extract HTML notes (these are slightly mangled by RosaeNLG, but it actually makes them easier to extract)
            notes.push(node._rawText.replaceAll("<! --","").replaceAll("-->",""));
        }
    });

    // Build the data object to be saved to JSON
    let data = { sections };
    if (place) data.place = place;
    if (place && place.regioncd && lookup[place.regioncd]) data.region = lookup[place.regioncd];
    if (place && place.ctrycd && lookup[place.ctrycd]) data.ctry = lookup[place.ctrycd];
    if (notes[0]) data.notes = notes;

    // Set the save path (default.json is when no area is selected)
    let path = `./static/data/json/${place ? place.areacd : "default"}.json`;

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
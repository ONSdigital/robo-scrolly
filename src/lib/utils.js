import { csvParse, autoType } from "d3-dsv";
import { feature } from "topojson-client";
import ckmeans from "ckmeans";

// CORE FUNCTIONS
export function getMotion() {
	let mediaQuery = true; // window.matchMedia("(prefers-reduced-motion: reduce)"); // Check if browser prefers reduced motion
	return !mediaQuery || mediaQuery.matches ? false : true; // return true for motion, false for no motion
}

// DEMO-SPECIFIC FUNCTIONS
export async function getData(url, fetch = window.fetch) {
	let response = await fetch(url);
	let string = await response.text();
	let data = csvParse(string, autoType);
	return data.sort((a, b) => a.areanm.localeCompare(b.areanm));
}

export async function getPlace(url, fetch = window.fetch) {
	let response = await fetch(url);
	return await response.json();
}

export async function getTopo(url, layer, fetch = window.fetch) {
	let response = await fetch(url);
	let json = await response.json();
	let geojson = await feature(json, layer);
	return geojson;
}

export function getColor(value, breaks, colors) {
	let color;
	let found = false;
	let i = 1;
	while (found == false) {
		if (value <= breaks[i]) {
			color = colors[i - 1];
			found = true;
		} else {
			i++;
		}
	}
	return color ? color : "lightgrey";
}

export function getBreaks(vals) {
	vals.sort((a, b) => a - b);
	let breaks = ckmeans(vals, 5);
	breaks.push(vals[vals.length - 1]);
	return breaks;
}

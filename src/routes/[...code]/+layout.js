// This script loads all of the data that is relevant to ALL areas
// Loading this data in the LAYOUT means that it doesn't need to be reloaded when the area is changed

import { base } from "$app/paths";
import bbox from "@turf/bbox";
import { getData, getTopo } from "$lib/utils";

export async function load({ fetch }) {
	let geojson = await getTopo(`${base}/data/geo_lad2015.json`, 'LAD15merc', fetch);
	let mapbounds = bbox(geojson);
	let places = await getData(`${base}/data/places.csv`, fetch); // Array of data for all places
	let lookup = {}; // Places data as a lookup
	places.forEach(p => lookup[p.areacd] = p);

  return {geojson, mapbounds, places, lookup};
}
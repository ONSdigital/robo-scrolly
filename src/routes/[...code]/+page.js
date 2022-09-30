export const prerender = true;

import { base } from "$app/paths";
import { getPlace, getBreaks, getColor } from "$lib/utils";
import { colors } from "$lib/config";

export async function load({ params, parent, fetch }) {
  // Get common data loaded by +layout.js
  const { geojson, mapbounds, places, lookup } = await parent();

  // Get specific data for selected place
	let selected = params.code.replace("/", ""); // GSS code for selected district
	let content = await getPlace(`${base}/data/json/${lookup[selected] ? selected : 'default'}.json`, fetch);
	let place = lookup[selected] ? lookup[selected] : null; // Data for selected area
	if (!place) selected = null;
	let region = place && place.regioncd ? place.regioncd : null; // Region GSS code for selected area
	let ctry = place && place.ctrycd ? place.ctrycd : null; // Country GSS code for selected area
	let siblings = region ? places.filter(p => p.regioncd == region).map(p => p.areacd) :
		ctry ? places.filter(p => p.ctrycd == ctry).map(p => p.areacd) :
		null; // Array of GSS codes for sibling areas (within same region/ctry)
	
	// Calculate colour breaks for map
	const keys = ["long_term_illness_2011_pc", "limited_lot_2011_pc", "unpaid_care_20_plus_2011_pc"];
	for (const key of keys) {
		let breaks = getBreaks(places.map(d => d[key]));
		places.forEach(d => d[key + "_color"] = getColor(d[key], breaks, colors.seq));
	}

	return {geojson, mapbounds, places, lookup, selected, content, place, region, ctry, siblings};
}

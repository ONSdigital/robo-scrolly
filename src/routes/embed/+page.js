export const prerender = true;

import { base } from "$app/paths";
import { getData } from "$lib/utils";

export async function load({ fetch }) {
	let places = await getData(`${base}/data/places.csv`, fetch); // Array of data for all places

  return {places};
}
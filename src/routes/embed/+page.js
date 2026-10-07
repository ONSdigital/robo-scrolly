export const prerender = true;

import { asset } from "$app/paths";
import { getData } from "$lib/utils";

export async function load({ fetch }) {
	let places = await getData(asset("/data/places.csv"), fetch); // Array of data for all places

	return { places };
}

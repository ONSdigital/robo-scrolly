/** @type {import('@sveltejs/kit').Config} */
import adapter from "@sveltejs/adapter-static";

const production = process.env.NODE_ENV === "production";

const config = {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: adapter({
			// Options below are defaults
			pages: "build",
			assets: "build"
		}),
		prerender: {
			entries: ["/", "/embed/"],
			handleHttpError: "warn",
			handleMissingId: "warn"
		},
		paths: {
			base: production ? "/robo-scrolly" : "",
			// Absolute paths, as in SvelteKit 1, because the page builds absolute ons.gov.uk URLs
			// (canonical and og:url tags)
			relative: false
		}
	}
};

export default config;

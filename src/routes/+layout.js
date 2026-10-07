import * as env from "$env/static/public";

// Preview builds aren't prerendered: they're a single 404.html fallback page (see svelte.config.js)
export const prerender = env?.PUBLIC_APP_ENV !== "preview";

// Every page has a trailing slash (eg. /robo-scrolly/E06000001/), as in the old trailingSlash config
export const trailingSlash = "always";

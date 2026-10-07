// vite.config.js
import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	// layercake (used by @onsvisual/svelte-charts) ships .svelte files, so it has to be bundled for SSR
	ssr: {
		noExternal: ["layercake"]
	}
};

export default config;

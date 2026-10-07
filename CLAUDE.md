# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A SvelteKit 2 / Svelte 5 scrollytelling template for semi-automated ("robo-journalism") area articles on ons.gov.uk. A Pug template and a wide CSV (one row per area) are rendered ahead of time into one JSON file per area, and the app is prerendered into a static site with one page per area, in which scroll-triggered charts and maps change as the reader moves through the text. Templates are usually written in [robo-editor](https://onsdigital.github.io/robo-editor/) (its `template.pug` is this repo's demo). Sibling templates: [robo-article](https://github.com/ONSvisual/robo-article) (standard article) and [robo-embed](https://github.com/ONSvisual/robo-embed) (iframe embed).

The components are still written in Svelte 3/4 syntax (they run in Svelte 5's legacy mode). The plan is to replace most of `src/lib/` with `@onsvisual/svelte-components` and convert to runes then, so don't convert components that are due to be replaced.

## Commands

```bash
npm run build:data      # render demo-data/ into static/data/ (see scripts/build-data.config.js)
npm run dev             # dev server at localhost:5173
npm run build           # production build to build/, then js-fix
npm run lint            # prettier --check
npm run format          # prettier --write
```

There are no tests. `static/data/json/` and `static/data/places.csv` are generated and gitignored, so run `build:data` before `dev` or `build` on a fresh checkout. Unlike robo-article and robo-embed, `package-lock.json` is tracked.

Formatting (`.prettierrc`): tabs (width 4), print width 100, no trailing commas, matching robo-utils.

## Architecture

**Data build (Node, `scripts/build-data.js`).** Reads the CSV and Pug template named in `scripts/build-data.config.js`, keeps rows whose code prefix is in `geo_types`, and for each area (plus `null`, meaning no area selected) calls robo-utils' `renderJSON`. It writes `static/data/json/<areacd>.json` (and `default.json`), plus `static/data/places.csv` with only the `cols` columns, which every page loads for the charts, maps and area list (so any column a chart or map uses must be in `cols`). After a run where every page rendered without a Pug error, it deletes JSON files for areas that are no longer in the data; it prints a summary and exits with code 1 if any page failed. The demo data is from the 2001 and 2011 censuses (disability and unpaid care).

**Routes.**

- `[...code]`: the article, for `/` (no area selected) and `/<areacd>/`. `+layout.js` loads the map boundaries (`static/data/geo_lad2015.json`, a TopoJSON with layer `LAD15merc`) and `places.csv` once; `+page.js` loads the area's JSON and works out map colour breaks. Selecting an area calls `goto()` with `noScroll`, so the reader stays where they are.
- `embed`: an embeddable area picker that navigates `window.top` to the article.
- `src/routes/+layout.js` sets `trailingSlash = "always"`. `svelte.config.js` prerenders `/` and `/embed/`, and the crawler finds every area page through the list of areas at the end of the article.

**Section types and scrollers.** The rendered JSON is `{ sections, ... }`, where each top-level Pug `section` has its class as `type`. `[...code]/+page.svelte` switches on it: `Header` (with the area select and animation toggle), `Filler`, `Section` (HTML content) and `Scroller`. A `Scroller` section's nested sections are its steps; the chart or map in its background is chosen in `+page.svelte` by the scroller's `id` (`scatter`, `map1`, `map2`), and each step runs the function in `actions[scrollerId][stepId]` (eg. `actions.map1.map1_b`) when it scrolls into view. So adding or renaming a scroller or step in the template needs a matching change in `+page.svelte`.

**Charts and maps.** `ScatterChart` comes from `@onsvisual/svelte-charts` (0.4), which ships LayerCake as `.svelte` files, so `vite.config.js` bundles `layercake` for SSR. Maps use `@onsvisual/svelte-maps` (2.x, MapLibre 6), with the base style in `static/data/mapstyle.json`; `+page.svelte` points MapLibre at its bundled worker script in a `<script module>` block, which svelte-maps 2 requires. When testing maps in a browser, keep the tab visible: MapLibre doesn't render, and svelte-maps doesn't add its layers, in a hidden tab.

**Base paths.** `paths.base` is `/robo-scrolly` in production and empty in dev, and paths are absolute (`relative: false`) because the page builds absolute `https://www.ons.gov.uk/...` URLs for its canonical and `og:` tags. Use `asset()` for files in `static/` and `resolve()` for routes, from `$app/paths` (not the deprecated `base`/`assets`). `scripts/js-fix.js` prepends `//js` to every JS file in `build/_app` to avoid MIME type errors on the ONS servers.

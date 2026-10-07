# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A SvelteKit 2 / Svelte 5 scrollytelling template for semi-automated ("robo-journalism") area articles on ons.gov.uk. A Pug template and a wide CSV (one row per area) are rendered ahead of time into one JSON file per area, and the app is prerendered into a static site with one page per area, in which scroll-triggered charts and maps change as the reader moves through the text. Templates are usually written in [robo-editor](https://onsdigital.github.io/robo-editor/) (its `template.pug` is this repo's demo). Sibling templates: [robo-article](https://github.com/ONSvisual/robo-article) (standard article) and [robo-embed](https://github.com/ONSvisual/robo-embed) (iframe embed).

The UI comes from `@onsvisual/svelte-components` (there are no local components; `src/lib/` only holds `config.js` and `utils.js`), and its CSS is the only stylesheet. The app's own code uses runes. svelte-components is still written in Svelte 4 syntax: its components dispatch events, so listen with `on:change` / `on:clear` on them, while DOM elements use `onclick`.

## Commands

```bash
npm run build:data      # render demo-data/ (or the source in src/app.config.js) into static/data/
npm run dev             # dev server at localhost:5173
npm run build           # production build to build/, then js-fix
npm run build:preview   # build with base_preview
npm run lint            # prettier --check
npm run format          # prettier --write
```

There are no tests. `static/data/json/` and `static/data/places.csv` are generated and gitignored, so run `build:data` before `dev` or `build` on a fresh checkout. Unlike robo-article and robo-embed, `package-lock.json` is tracked.

Formatting (`.prettierrc`): tabs (width 4), print width 100, no trailing commas, matching robo-utils.

## Architecture

**Data build (Node, `scripts/build-data.js`).** Reads the CSV and Pug template named in `src/app.config.js`, keeps rows whose code prefix is in `filter` (all rows if it's empty), and for each area (plus `null`, meaning no area selected) calls robo-utils' `renderJSON`. It writes `static/data/json/<areacd>.json` (and `default.json`), plus `static/data/places.csv` with only the `cols` columns, which every page loads for the charts, maps and area list (so any column a chart or map uses must be in `cols`). After a run where every page rendered without a Pug error, it deletes JSON files for areas that are no longer in the data; it prints a summary and exits with code 1 if any page failed. The demo data is from the 2001 and 2011 censuses (disability and unpaid care).

**Routes.**

- `[...code]`: the article, for `/` (no area selected) and `/<areacd>/`. `+layout.js` loads the map boundaries (`static/data/geo_lad2015.json`, a TopoJSON with layer `LAD15merc`) and `places.csv` once; `+page.js` loads the area's JSON and works out map colour breaks. Selecting an area calls `goto()` with `noScroll`, so the reader stays where they are.
- `embed`: an embeddable area picker that navigates `window.top` to the article.
- `src/routes/+layout.js` sets `trailingSlash = "always"`. `svelte.config.js` prerenders `/` and `/embed/`, and the crawler finds every area page through the list of areas at the end of the article (in a `Details`, whose links stay in the page when it's closed).

**Section types and scrollers.** The rendered JSON is `{ sections, ... }`, where each top-level Pug `section` has its class as `type`. `[...code]/+page.svelte` switches on it: `Header` becomes a `Hero` (from `prop.title`, `prop.lede` and `prop.label`, the area select's label, plus any HTML, followed by the animation checkbox and area select), `Filler` a `Highlight`, `Section` a `Section` (with `prop.title` as its heading), and `Scroller` a `Scroller`. A `Scroller` section's nested sections are its steps (`ScrollerSection`s); the chart or map in its background is chosen in `+page.svelte` by the scroller's `id` (`scatter`, `map1`, `map2`), and each step runs the function in `actions[scrollerId][stepId]` (eg. `actions.map1.map1_b`) when it scrolls into view. So adding or renaming a scroller or step in the template needs a matching change in `+page.svelte`.

**Charts and maps.** `ScatterChart` comes from `@onsvisual/svelte-charts` (0.4), which ships LayerCake as `.svelte` files, so `vite.config.js` bundles `layercake` for SSR. Maps use `@onsvisual/svelte-maps` (2.x, MapLibre 6), with the base style in `static/data/mapstyle.json`; `+page.svelte` points MapLibre at its bundled worker script in a `<script module>` block, which svelte-maps 2 requires. When testing in a browser, keep the tab visible and scroll with real scroll events (eg. the mouse wheel): MapLibre doesn't render, and svelte-maps doesn't add its layers, in a hidden tab, and the svelte-components `Scroller` only re-measures on scroll events, so jumping to a step with `scrollIntoView()` can leave its background unpinned.

**Base paths.** `base_prod` and `base_preview` in `src/app.config.js` set `paths.base`, the same way as robo-article and robo-embed: a path builds absolute URLs, and `null` (the production default) builds relative ones, so the app can be deployed to any path. The URLs that must be absolute (the canonical link and `og:` tags) are built from `app_url` in the same file, which doesn't affect the build; don't build them from `resolve()`/`asset()`, which return relative paths (eg. `../`) in a relative build. In dev there's no base. Use `asset()` for files in `static/` and `resolve()` for routes, from `$app/paths` (not the deprecated `base`/`assets`). `scripts/js-fix.js` prepends `//js` to every JS file in `build/_app` to avoid MIME type errors on the ONS servers.

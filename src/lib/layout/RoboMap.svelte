<script>
    //import the stuff from svelte maps
    import { Map, MapSource, MapLayer } from "@onsvisual/svelte-maps";
    // this import the base map style
    import style from "$lib/mapstyles/style-ons-light.json";
    //import topojson function to convert topojson to geojson
    import { feature } from "topojson-client";
    // import boundaries for LTLA
    import ltla from "$lib/boundaries/ltla2021.json";
    // import boundaries for regions
    import regions from "$lib/boundaries/rgn2021.json";
    //import turf/bbox to work out the bounding box of a region
    import bbox from "@turf/bbox";
    //use equal interval to work out breaks
    import { equalIntervalBreaks } from "simple-statistics";
    //simple function to set the colours given some data, breaks and colours
    import { getColor } from "$lib/utils.js";

    export let section = {};

    // binding for the map
    let map

    //define some colour for our scale
    const colors = ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"];

    //set selected to the area from the robo
    $:selected = section.selected;

    //convert topojsons to geojsons
    let laBoundaries = feature(ltla, ltla.objects.ltla);
    let regionBoundaries = feature(regions, regions.objects.rgn);

    //just select the parent region
    $:myregion = regionBoundaries.features.filter(
        (d) => d.properties.areacd == section.regioncd
    )[0];

    //and use it to find the bounding box with turf, then use that bbox when setting the map
    $:regionBbox = bbox(myregion);

    //generate equal breaks
    $:breaks = equalIntervalBreaks(section.data.map((d) => d.x).sort(), 5);
    
    //add colours to the data
    $:section.data.forEach((d) => {
        d.color = getColor(d.x, breaks, colors);
    });

    //reactive statement to move the map if a different area is selected
    $:if(map) map.fitBounds(regionBbox)
</script>

<h3 class="chart-title">{section.title}</h3>
<div class="map">
    <Map
        id={section.id}
        {style}
        bind:map={map}
        interactive={true}
        location={{
            bounds: regionBbox,
        }}
    >
        <MapSource
            id="ltla"
            type="geojson"
            data={laBoundaries}
            promoteId="areacd"
            maxzoom={13}
        >
            <MapLayer
                id="ltla"
                data={section.data}
                type="fill"
                select={true}
                bind:selected
                paint={{
                    "fill-color": [
                        "case",
                        ["!=", ["feature-state", "color"], null],
                        ["feature-state", "color"],
                        "rgba(255, 255, 255, 0)",
                    ],
                    "fill-opacity": 0.7,
                }}
                order="water_name"
            />
            <MapLayer
                id="ltla-line"
                type="line"
                paint={{
                    "line-color": [
                        "case",
                        ["==", ["feature-state", "selected"], true],
                        "black",
                        ["==", ["feature-state", "hovered"], true],
                        "orange",
                        "rgba(255, 255, 255, 0)",
                    ],
                    "line-width": [
                        "case",
                        ["==", ["feature-state", "selected"], true],
                        2,
                        1,
                    ],
                }}
            />
        </MapSource>
    </Map>
</div>
<div class="chart-footer">{section.footer}</div>

<style>
    .map {
        height: var(--height, 200px);
    }
</style>

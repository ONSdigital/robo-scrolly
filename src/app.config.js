// APP CONFIG

// Base paths
// A path builds the app for that directory, with absolute URLs. null builds it with relative URLs,
// so it can be deployed to any path.
export const base_prod = null; // Directory on the ONS website
export const base_preview = "/robo-scrolly"; // Directory on datavisweb preview server or Github Pages

// Public address of the app, with no trailing slash. This is only used where the app needs a full,
// absolute URL (the canonical link and share tags). It doesn't affect the build or the paths the app
// uses, which are set by base_prod and base_preview above.
export const app_url = "https://www.ons.gov.uk/robo-scrolly";

// BUILD DATA CONFIG

// Locations of data file and template (path to a local or shared drive)
export const source_dir = "./demo-data";
export const data_file = "data.csv";
export const template_file = "template.pug";

// 3-letter ID prefixes to filter from CSV id column
export const filter = ["E06", "E07", "E08", "E09", "W06"];

// Columns to extract from CSV
export const cols = [
	"areacd",
	"areanm",
	"regioncd",
	"ctrycd",
	"long_term_illness_2011_pc",
	"limited_lot_2011_pc",
	"unpaid_care_20_plus_2011_pc"
];

// Other files to copy from source_dir (OPTIONAL)
export const files_to_copy = [];

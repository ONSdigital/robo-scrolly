// APP CONFIG

// Base paths
export const base_prod = '/robo-scrolly'; // Directory on the ONS website
export const base_preview = '/robo-scrolly'; // Directory on datavisweb preview server or Github Pages

// Optional redirect URL for embedded landing page
export const redirect_url = null;

// BUILD DATA CONFIG

// Locations of data file and template (path to a local or shared drive)
export const source_dir = "./demo-data"
export const data_file = "data.csv";
export const template_file = "template.pug";

// 3-letter ID prefixes to filter from CSV id column
export const filter = ["E06","E07","E08","E09","N09","S12","W06"];

// Columns to extract from CSV
export const cols = [
  "areacd", "areanm", "regioncd", "ctrycd", 
  "long_term_illness_2011_pc", "limited_lot_2011_pc", "unpaid_care_20_plus_2011_pc"
];

// Other files to copy from source_dir (OPTIONAL)
export const files_to_copy = [];
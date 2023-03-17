// Locations of data file and template (absolute path to a local or shared drive)
export const source_dir = "Z:/tools/robo-editor/data/"
export const data_file = "data.csv";
export const template_file = "template.pug";

// LA geography types to filter from CSV
export const geo_types = ["E06","E07","E08","E09","W06"];

// Columns to extract from CSV
export const cols = [
    "areacd", "areanm", "regioncd", "ctrycd", 
    "long_term_illness_2011_pc", "limited_lot_2011_pc", "unpaid_care_20_plus_2011_pc"
];

// Other files to copy from source_dir (OPTIONAL)
export const files_to_copy = [];
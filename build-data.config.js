// Locations of data file and template (absolute path to a local or shared drive)
export const data_url = "Z:/robo-editor/data/data.csv";
export const template_url = "Z:/robo-editor/data/template.pug";

// LA geography types to filter from CSV
export const geo_types = ["E06","E07","E08","E09","W06"];

// Columns to extract from CSV
export const cols = [
    "areacd", "areanm", "regioncd", "ctrycd", 
    "long_term_illness_2011_pc", "limited_lot_2011_pc", "unpaid_care_20_plus_2011_pc"
];
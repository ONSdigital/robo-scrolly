// Locations of data file and template (absolute path to a local or shared drive)
export const source_dir = "./demo-data/"
export const data_file = "data.csv";
export const template_file = "template.pug";

// LA geography types to filter from CSV
export const geo_types = ["E06","E07","E08","E09","N09","S12","W06"];

// Columns to extract from CSV
export const cols = [
    "areacd", "areanm", "parentcd"
];

// Other files to copy from source_dir (OPTIONAL)
export const files_to_copy = [];
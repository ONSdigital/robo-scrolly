import { readFileSync, writeFileSync } from "fs";

const path = "./node_modules/layercake/package.json";

const json = JSON.parse(readFileSync(path, {encoding:'utf8', flag:'r'}));

if (json?.exports?.["."] !== "./dist/index.js") {
  json.exports = {".": "./dist/index.js"};
  writeFileSync(path, JSON.stringify(json, null, 2));
  console.log("Fixed layercake package.json");
}
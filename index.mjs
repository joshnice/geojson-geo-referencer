import { readFile, writeFile } from "fs/promises";
import { modifyFeatureWithFactor, findHighestAndLowestCoordinates, getAvgLongLat } from "./coordinate-helpers.mjs";
import { getCutOff, filterCoordinates } from "./filter-helpers.mjs";

const file = await readFile("./files/input.json", { encoding: "utf8" });

const cleanJsonData = file.replace(/^\uFEFF/, '');

const featureCollection = JSON.parse(cleanJsonData);

const { highestLong, highestLat } = findHighestAndLowestCoordinates(featureCollection);

const longFactor = 180 / highestLong;
const latFactor = 90 / highestLat;

const features = featureCollection.features.map((feature) => modifyFeatureWithFactor(feature, longFactor, latFactor));

const scaledFeatureCollection = { type: "FeatureCollection", features };

const { highestLong: geoReferencedHighestLong, highestLat: geoReferencedHighestLat, lowestLat: geoReferenecedLowestLat, lowestLong: geoReferencedLowestLong } = findHighestAndLowestCoordinates(scaledFeatureCollection);

const { lat: geoRefAvgLat, long: geoRefAvgLong } = getAvgLongLat(scaledFeatureCollection);

const longCutOff = getCutOff(geoRefAvgLong, geoReferencedLowestLong, geoReferencedHighestLong);
const latCutOff = getCutOff(geoRefAvgLat, geoReferenecedLowestLat, geoReferencedHighestLat);

const filteredScaleCoordinates = filterCoordinates(scaledFeatureCollection, longCutOff, latCutOff, ["Point"]);

await writeFile("./files/output.json", JSON.stringify(filteredScaleCoordinates), { encoding: "utf8" });

await writeFile("./files/output-scale-factor.json", JSON.stringify({ latFactor, longFactor }), { encoding: "utf8" });
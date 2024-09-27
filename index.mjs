import { readFile, writeFile } from "fs/promises";
import { flatternFeatureCoordinates, modifyFeatureWithFactor } from "./coordinate-helpers.mjs";

const file = await readFile("./files/input.json", { encoding: "utf8" });

const cleanJsonData = file.replace(/^\uFEFF/, '');

const featureCollection = JSON.parse(cleanJsonData);

let highestLong = -Infinity;
let highestLat = -Infinity;
let lowestLong = Infinity;
let lowestLat = Infinity;

featureCollection.features.forEach((feature) => {

    const flatternedCoordinates = flatternFeatureCoordinates(feature);

    flatternedCoordinates.forEach(([long, lat]) => {

        if (long > highestLong) {
            highestLong = long;
        }

        if (lat > highestLat) {
            highestLat = lat;
        }

        if (lowestLong > long) {
            lowestLong = long;
        }

        if (lowestLat > lat) {
            lowestLat = lat;
        }

    });

});

const longFactor = 180 / highestLong;
console.log("longFactor", longFactor);
const latFactor = 90 / highestLat;
console.log("latFactor", latFactor);

const features = featureCollection.features.map((feature) => modifyFeatureWithFactor(feature, longFactor, latFactor));

const scaledFeatureCollection = { type: "FeatureCollection", features };

await writeFile("./files/output.json", JSON.stringify(scaledFeatureCollection), { encoding: "utf8" });

await writeFile("./files/output-scale-factor.json", JSON.stringify({ latFactor, longFactor }), { encoding: "utf8" });
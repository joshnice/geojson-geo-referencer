import { FeatureCollection, LineString, Feature } from "geojson";
import { length } from "@turf/length"

export function optimiseFeatureCollection(featureCollection: FeatureCollection, filterLength: number): FeatureCollection {
    const filteredFeatures: Feature<LineString>[] = [];
    featureCollection.features.forEach((feature) => {
        if (feature.geometry.type === "LineString") {
            const lengthOfLine = length(feature, { units: "meters" });
            if (lengthOfLine > filterLength) {
                filteredFeatures.push(feature as Feature<LineString>);
            }
        }
    });
    return { type: "FeatureCollection", features: filteredFeatures };

}
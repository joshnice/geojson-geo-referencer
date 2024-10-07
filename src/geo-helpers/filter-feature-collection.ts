import { FeatureCollection, LineString, Feature } from "geojson";
import { length } from "@turf/length";
import { flattenFeatureCoordinates } from "./coordinate-helpers";
import { createFeatureCollection } from "./feature-collection";

export function optimiseFeatureCollectionViaLength(
	featureCollection: FeatureCollection,
	filterLength: number,
): FeatureCollection {
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

export function filterCoordinatesViaMaxLongLat(
	featureCollection: FeatureCollection,
	maxLong: number,
	maxLat: number,
	filterGeomType: Feature["geometry"]["type"][],
) {
	const validFeatures: Feature[] = [];
	featureCollection.features.forEach((feature) => {
		const validFilterType = !filterGeomType.includes(feature.geometry.type);
		const validCoords = !flattenFeatureCoordinates(feature).some(
			([long, lat]) => long > maxLong || lat > maxLat,
		);
		if (validFilterType && validCoords) {
			validFeatures.push(feature);
		}
		return validFeatures;
	}, []);
	return createFeatureCollection(validFeatures);
}

export function calculateAdjustedAverage(
	avg: number,
	low: number,
	high: number,
) {
	const avgMinHigh = high - avg;
	const avgMinusLow = avg - low;
	const incrementLong = avgMinHigh > avgMinusLow ? avgMinusLow : avgMinHigh;
	return avg + incrementLong;
}

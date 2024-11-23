import type { FeatureCollection, Feature } from "geojson";
import { flattenFeatureCoordinates } from "./coordinate-helpers";
import { createFeatureCollection } from "./feature-collection";

export function filterCoordinatesViaMaxLongLat(
	featureCollection: FeatureCollection,
	maxLong: number,
	maxLat: number,
) {
	const validFeatures: Feature[] = [];

	featureCollection.features.forEach((feature) => {
		const validCoords = !flattenFeatureCoordinates(feature).some(
			([long, lat]) => long > maxLong || lat > maxLat,
		);
		if (validCoords) {
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

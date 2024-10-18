import type { FeatureCollection, Feature } from "geojson";
import { flattenFeatureCoordinates } from "./coordinate-helpers";
import { createFeatureCollection } from "./feature-collection";

export function filterCoordinatesViaMaxLongLat(
	featureCollection: FeatureCollection,
	maxLong: number,
	maxLat: number,
	filterGeomType: Feature["geometry"]["type"][],
) {
	const validFeatures: Feature[] = [];
	// biome-ignore lint/complexity/noForEach: <explanation>
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

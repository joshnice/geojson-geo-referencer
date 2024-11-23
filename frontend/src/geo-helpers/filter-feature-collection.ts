import type { FeatureCollection, Feature } from "geojson";
import { calculateDistanceBetweenCoordinates, flattenFeatureCoordinates } from "./coordinate-helpers";
import { createFeatureCollection } from "./feature-collection";

export function filterFeatureCollectionOnDistance(featureCollection: FeatureCollection, center: [number, number], factor: number) {
	let sum = 0;

	featureCollection.features.forEach((feature) => {
		const coords = flattenFeatureCoordinates(feature);
		const sumOfDistances = coords.map((pos) => calculateDistanceBetweenCoordinates(pos as [number, number], center)).reduce((sum, val) => sum + val, 0);
		const avgDistance = sumOfDistances / coords.length;
		sum += avgDistance;
	});

	const avg = sum / featureCollection.features.length;

	const filteredFeatures: Feature[] = [];

	featureCollection.features.forEach((feature) => {
		const coords = flattenFeatureCoordinates(feature);
		const sumOfDistances = coords.map((pos) => calculateDistanceBetweenCoordinates(pos as [number, number], center)).reduce((sum, val) => sum + val, 0);
		const avgDistance = sumOfDistances / coords.length;
		let allowed = true;
		if (avg * (1 + factor) < avgDistance) {
			allowed = false;
		}

		if (avg * (1 - factor) > avgDistance) {
			allowed = false;
		}

		if (allowed) {
			filteredFeatures.push(feature);
		}
	});

	return createFeatureCollection(filteredFeatures);
}

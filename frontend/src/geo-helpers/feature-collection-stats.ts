import type { FeatureCollection, Feature } from "geojson";
import { calculateDistanceBetweenCoordinates, flattenFeatureCoordinates } from "./coordinate-helpers";
import { createFeatureCollection } from "./feature-collection";

export function getAvgLongLat(featureCollection: FeatureCollection) {
	let longTot = 0;
	let latTot = 0;
	let coordCount = 0;

	featureCollection.features.forEach((feature) => {
		const flatternedCoordinates = flattenFeatureCoordinates(feature);

		flatternedCoordinates.forEach(([long, lat]) => {
			coordCount += 1;
			longTot += long;
			latTot += lat;
		});
	});

	return { lat: latTot / coordCount, long: longTot / coordCount };
}

export function filterFeatureCollectionOnDistance(featureCollection: FeatureCollection, center: [number, number], factor: number) {
	let sum = 0;
	let highest = Number.NEGATIVE_INFINITY;

	featureCollection.features.forEach((feature) => {
		const coords = flattenFeatureCoordinates(feature);
		const sumOfDistances = coords.map((pos) => calculateDistanceBetweenCoordinates(pos as [number, number], center)).reduce((sum, val) => sum + val, 0);
		const avgDistance = sumOfDistances / coords.length;
		sum += avgDistance;
		if (highest < avgDistance) {
			highest = avgDistance;
		}
	});

	const avg = sum / featureCollection.features.length;
	console.log("avg", avg);
	console.log("highest", highest);

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

import type { FeatureCollection, Feature } from "geojson";
import { destination } from "@turf/destination";
import { calculateBearingBetweenCoordinates, calculateDistanceBetweenCoordinates, flattenFeatureCoordinates } from "./coordinate-helpers";
import { changeCenterPointOfFeatureCollection } from "./feature-collection-position";

export function createFeatureCollection(
	features: Feature[],
): FeatureCollection {
	return { type: "FeatureCollection", features };
}

export function findHighestAndLowestCoordinatesInFeatureCollection(
	featureCollection: FeatureCollection,
) {
	let highestLong = Number.NEGATIVE_INFINITY;
	let highestLat = Number.NEGATIVE_INFINITY;
	let lowestLong = Number.POSITIVE_INFINITY;
	let lowestLat = Number.POSITIVE_INFINITY;

	// biome-ignore lint/complexity/noForEach: <explanation>
	featureCollection.features.forEach((feature) => {
		const flattenedCoordinates = flattenFeatureCoordinates(feature);

		// biome-ignore lint/complexity/noForEach: <explanation>
		flattenedCoordinates.forEach(([long, lat]) => {
			if (long > highestLong) {
				highestLong = long;
			}

			if (lat > highestLat) {
				highestLat = lat;
			}

			if (long < lowestLong) {
				lowestLong = long;
			}

			if (lat < lowestLat) {
				lowestLat = lat;
			}
		});
	});

	return { highestLong, highestLat, lowestLat, lowestLong };
}

const ORIGIN: [number, number] = [0, 0];

export async function transformNonValidGeoJSONToValid(
	featureCollection: FeatureCollection,
	units: "meters",
): Promise<{
	featureCollection: FeatureCollection;
	scaleFactor: { latFactor: number; longFactor: number };
}> {

	const centeredFeatureCollection = changeCenterPointOfFeatureCollection(featureCollection);

	const geoRefFeatures: Feature[] = [];
	// biome-ignore lint/complexity/noForEach: <explanation>
	centeredFeatureCollection.features.forEach((feature) => {
		switch (feature.geometry.type) {
			case "LineString": {
				const coords: [number, number][] = [];
				// biome-ignore lint/complexity/noForEach: <explanation>
				feature.geometry.coordinates.forEach((coord) => {
					const distanceFromOrigin = calculateDistanceBetweenCoordinates(ORIGIN, coord as [number, number]);
					const bearingFromOrigin = calculateBearingBetweenCoordinates(ORIGIN, coord as [number, number])
					const newCoord = destination(ORIGIN, distanceFromOrigin, bearingFromOrigin + 90, { units });
					coords.push([newCoord.geometry.coordinates[0], newCoord.geometry.coordinates[1]]);
				});
				const updatedFeature: Feature = { type: "Feature", geometry: { coordinates: coords, type: "LineString" }, properties: {} };
				geoRefFeatures.push(updatedFeature);
				break;
			}
			default:
				// Do nothing
				break;
		}
	});


	return {
		featureCollection: createFeatureCollection(geoRefFeatures),
		scaleFactor: { longFactor: 1, latFactor: 1 },
	};
}

export function getClosestCadCoordinate(
	featureCollection: FeatureCollection,
	coordinate: [number, number],
) {
	let totalDiff = Number.POSITIVE_INFINITY;
	let closestCoordinate: [number, number] | null = null;

	// biome-ignore lint/complexity/noForEach: <explanation>
	featureCollection.features.forEach((feature) => {
		const flattenedCoordinates = flattenFeatureCoordinates(feature);

		// biome-ignore lint/complexity/noForEach: <explanation>
		flattenedCoordinates.forEach(([long, lat]) => {
			const diff =
				Math.abs(long - coordinate[0]) + Math.abs(lat - coordinate[1]);
			if (diff < totalDiff) {
				totalDiff = diff;
				closestCoordinate = [long, lat];
			}
		});
	});

	if (closestCoordinate == null) {
		throw new Error("No closest coordinate found");
	}

	return closestCoordinate;
}

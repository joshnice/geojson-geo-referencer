import { rhumbDestination } from "@turf/rhumb-destination";
import type { Feature, FeatureCollection } from "geojson";
import type { Units } from "../types/units";
import { calculateBearingBetweenCoordinates, calculateDistanceBetweenCoordinates, flattenFeatureCoordinates } from "./coordinate-helpers";
import { changeCenterPointOfFeatureCollection } from "./feature-collection-position";

export function createFeatureCollection(features: Feature[]): FeatureCollection {
	return { type: "FeatureCollection", features };
}

export function findHighestAndLowestCoordinatesInFeatureCollection(featureCollection: FeatureCollection) {
	let highestLong = Number.NEGATIVE_INFINITY;
	let highestLat = Number.NEGATIVE_INFINITY;
	let lowestLong = Number.POSITIVE_INFINITY;
	let lowestLat = Number.POSITIVE_INFINITY;

	featureCollection.features.forEach((feature) => {
		const flattenedCoordinates = flattenFeatureCoordinates(feature);

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

export async function transformNonValidGeoJSONToValid(
	featureCollection: FeatureCollection,
	units: Units,
	origin: [number, number],
): Promise<{
	featureCollection: FeatureCollection;
	nonScaledFeatureCollection: FeatureCollection;
}> {
	const centeredFeatureCollection = changeCenterPointOfFeatureCollection(featureCollection);

	const geoRefFeatures: Feature[] = [];

	centeredFeatureCollection.features.forEach((feature) => {
		switch (feature.geometry.type) {
			case "LineString": {
				const coords: [number, number][] = [];

				feature.geometry.coordinates.forEach((coord) => {
					const distanceFromOrigin = calculateDistanceBetweenCoordinates(origin, coord as [number, number]);
					const bearingFromOrigin = calculateBearingBetweenCoordinates(coord as [number, number], origin);
					const newCoord = rhumbDestination(origin, distanceFromOrigin, bearingFromOrigin, { units: units });
					coords.push([newCoord.geometry.coordinates[0], newCoord.geometry.coordinates[1]]);
				});
				const updatedFeature: Feature = {
					type: "Feature",
					geometry: { coordinates: coords, type: "LineString" },
					properties: feature.properties,
				};
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
		nonScaledFeatureCollection: featureCollection,
	};
}

export function getClosestCadCoordinate(featureCollection: FeatureCollection, coordinate: [number, number]) {
	let totalDiff = Number.POSITIVE_INFINITY;
	let closestCoordinate: [number, number] | null = null;

	featureCollection.features.forEach((feature) => {
		const flattenedCoordinates = flattenFeatureCoordinates(feature);

		flattenedCoordinates.forEach(([long, lat]) => {
			const diff = Math.abs(long - coordinate[0]) + Math.abs(lat - coordinate[1]);
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

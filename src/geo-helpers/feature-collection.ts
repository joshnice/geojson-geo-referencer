import type { FeatureCollection, Feature } from "geojson";
import { flattenFeatureCoordinates } from "./coordinate-helpers";
import { parseFileToJSON } from "../file-helpers/file-to-json";
import { modifyFeatureWithFactor } from "./translate-feature";
import {
	calculateAdjustedAverage,
	filterCoordinatesViaMaxLongLat,
} from "./filter-feature-collection";
import { getAvgLongLat } from "./feature-collection-stats";

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

export async function transformNonValidGeoJSONToValid(
	featureCollection: FeatureCollection,
): Promise<{
	featureCollection: FeatureCollection;
	scaleFactor: { latFactor: number; longFactor: number };
}> {
	const { highestLong, highestLat, lowestLat, lowestLong } =
		findHighestAndLowestCoordinatesInFeatureCollection(featureCollection);

	const unsignedLowestLong = lowestLong * -1;
	const highestUnsignedLong =
		highestLong > unsignedLowestLong ? highestLong : unsignedLowestLong;
	const unsignedLowestLat = lowestLat * -1;
	const highestUnsignedLat =
		highestLat > unsignedLowestLat ? highestLat : unsignedLowestLat;

	const longFactor = 2 / highestUnsignedLong;
	const latFactor = 1 / highestUnsignedLat;

	const features = featureCollection.features.map((feature) =>
		modifyFeatureWithFactor(feature, longFactor, latFactor),
	);

	const scaledFeatureCollection = createFeatureCollection(features);

	const {
		highestLong: geoReferencedHighestLong,
		highestLat: geoReferencedHighestLat,
		lowestLat: geoReferencedLowestLat,
		lowestLong: geoReferencedLowestLong,
	} = findHighestAndLowestCoordinatesInFeatureCollection(
		scaledFeatureCollection,
	);

	const { lat: geoRefAvgLat, long: geoRefAvgLong } = getAvgLongLat(
		scaledFeatureCollection,
	);

	const longCutOff = calculateAdjustedAverage(
		geoRefAvgLong,
		geoReferencedLowestLong,
		geoReferencedHighestLong,
	);

	const latCutOff = calculateAdjustedAverage(
		geoRefAvgLat,
		geoReferencedLowestLat,
		geoReferencedHighestLat,
	);

	return {
		// Ideally we would not use this
		featureCollection: filterCoordinatesViaMaxLongLat(
			scaledFeatureCollection,
			longCutOff,
			latCutOff,
			["Point"],
		),
		scaleFactor: { longFactor, latFactor },
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

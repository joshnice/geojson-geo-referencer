import { FeatureCollection, Feature } from "geojson";
import { flattenFeatureCoordinates } from "./coordinate-helpers";
import { parseFileToJSON } from "../file-helpers/file-to-json";
import { modifyFeatureWithFactor } from "./translate-feature";
import {
	calculateAdjustedAverage,
	filterCoordinatesViaMaxLongLat,
} from "./filter-feature-collection";
import { getAvgLongLat } from "./stats";

export function createFeatureCollection(
	features: Feature[],
): FeatureCollection {
	return { type: "FeatureCollection", features };
}

export function findHighestAndLowestCoordinatesInFeatureCollection(
	featureCollection: FeatureCollection,
) {
	let highestLong = -Infinity;
	let highestLat = -Infinity;
	let lowestLong = Infinity;
	let lowestLat = Infinity;

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

export async function transformNonValidGeoJSONToValid(file: File): Promise<{
	featureCollection: FeatureCollection;
	scaleFactor: { latFactor: number; longFactor: number };
}> {
	const featureCollection = await parseFileToJSON<FeatureCollection>(file);

	const { highestLong, highestLat, lowestLat, lowestLong } =
		findHighestAndLowestCoordinatesInFeatureCollection(featureCollection);

	const unsignedLowestLong = lowestLong * -1;
	const highestUnsignedLong = highestLong > unsignedLowestLong ? highestLong : unsignedLowestLong;
	const unsignedLowestLat = lowestLat * -1;
	const highestUnsignedLat = highestLat > unsignedLowestLat ? highestLat : unsignedLowestLat;

	const longFactor = 180 / highestUnsignedLong;
	const latFactor = 90 / highestUnsignedLat;

	const features = featureCollection.features.map((feature) =>
		modifyFeatureWithFactor(feature, longFactor, latFactor),
	);

	const scaledFeatureCollection = createFeatureCollection(features);

	const {
		highestLong: geoReferencedHighestLong,
		highestLat: geoReferencedHighestLat,
		lowestLat: geoReferenecedLowestLat,
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
		geoReferenecedLowestLat,
		geoReferencedHighestLat,
	);

	return {
		featureCollection: filterCoordinatesViaMaxLongLat(
			scaledFeatureCollection,
			longCutOff,
			latCutOff,
			["Point"],
		),
		scaleFactor: { longFactor, latFactor },
	};
}

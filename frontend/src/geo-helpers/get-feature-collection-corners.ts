import type { FeatureCollection } from "geojson";
import { flattenFeatureCoordinates } from "./coordinate-helpers";

export type CornerPosition =
	| "top-left"
	| "top-right"
	| "bottom-right"
	| "bottom-left";

export function getCornerCoordinate(
	featureCollection: FeatureCollection,
	cornerPosition: CornerPosition,
): [number, number] {
	let cornerCoordinate: [number, number] | null = null;


	featureCollection.features.forEach((feature) => {
		const flattenedCoordinates = flattenFeatureCoordinates(feature);

		flattenedCoordinates.forEach((compCoord) => {
			if (cornerCoordinate == null) {
				cornerCoordinate = compCoord as [number, number];
			}

			if (
				compareCorner(
					cornerPosition,
					cornerCoordinate,
					compCoord as [number, number],
				)
			) {
				cornerCoordinate = compCoord as [number, number];
			}
		});
	});

	if (cornerCoordinate == null) {
		throw new Error();
	}

	return cornerCoordinate;
}

function compareCorner(
	cornerPosition: CornerPosition,
	current: [number, number],
	comparison: [number, number],
) {
	const [compLong, compLat] = comparison;
	const [currentLong, currentLat] = current;
	switch (cornerPosition) {
		case "top-left":
			return compLong < currentLong && compLat > currentLat;
		case "top-right":
			return compLong > currentLong && compLat > currentLat;
		case "bottom-left":
			return compLong < currentLong && compLat < currentLat;
		case "bottom-right":
			return compLong > currentLong && compLat < currentLat;
	}
}

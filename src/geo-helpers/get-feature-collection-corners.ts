import type { FeatureCollection } from "geojson";
import { flattenFeatureCoordinates } from "./coordinate-helpers";

export type CornerPositon = "top-left" | "top-right" | "bottom-right" | "bottom-left";

export function getCornerCoordinate(
	featureCollection: FeatureCollection,
	cornerPositon: CornerPositon,
): [number, number] {
	let cornerCoordinate: [number, number] | null = null;

	// biome-ignore lint/complexity/noForEach: <explanation>
	featureCollection.features.forEach((feature) => {
		const flatterenedCoordaintes = flattenFeatureCoordinates(feature);
		// biome-ignore lint/complexity/noForEach: <explanation>
		flatterenedCoordaintes.forEach((compCoord) => {
			if (cornerCoordinate == null) {
				cornerCoordinate = compCoord as [number, number];
			}

			if (
				compareCorner(
					cornerPositon,
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
	cornerPositon: CornerPositon,
	current: [number, number],
	comparsion: [number, number],
) {
	const [compLong, compLat] = comparsion;
	const [currentLong, currentLat] = current;
	switch (cornerPositon) {
		case "top-left":
			return compLong < currentLong && compLat > currentLat;
		case "top-right":
			return compLong > currentLong && compLat > currentLat;
		case "bottom-left":
			return compLong < currentLong && compLat < currentLat;
		case "bottom-right":
			return compLong < currentLong && compLat > currentLat;
	}
}

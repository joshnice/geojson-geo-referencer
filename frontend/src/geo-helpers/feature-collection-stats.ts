import type { FeatureCollection } from "geojson";
import { flattenFeatureCoordinates } from "./coordinate-helpers";

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

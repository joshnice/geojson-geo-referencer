import { FeatureCollection, Feature, LineString } from "geojson";

export function moveFeatureCollection(
	featureCollection: FeatureCollection,
	start: [number, number],
	end: [number, number],
) {
	const longDiff = start[0] - end[0];
	const latDiff = start[1] - end[1];
	const newFeatures: FeatureCollection = {
		type: "FeatureCollection",
		features: [],
	};
	featureCollection.features.forEach((f) => {
		if (f.geometry.type === "LineString") {
			const newFeatureCoords: Feature<LineString>["geometry"]["coordinates"] =
				[];
			f.geometry.coordinates.forEach(([long, lat]) => {
				newFeatureCoords.push([long + longDiff, lat + latDiff]);
			});
			newFeatures.features.push({
				...f,
				geometry: { ...f.geometry, coordinates: newFeatureCoords },
			});
		}
	});
	return newFeatures;
}

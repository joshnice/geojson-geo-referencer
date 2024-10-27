import type { Feature } from "geojson";

export function flattenFeatureCoordinates(feature: Feature) {
	switch (feature.geometry.type) {
		case "Point":
			return [feature.geometry.coordinates];
		case "LineString":
			return feature.geometry.coordinates;
		case "Polygon":
			return feature.geometry.coordinates[0];
		default:
			throw new Error(`Not handled geometry type ${feature.geometry.type}`);
	}
}

export function roundCoordinate(coordinate: [number, number], dp = 6): [number, number] {
	return coordinate.map(num => Number.parseFloat(num.toFixed(dp))) as [number, number];
}
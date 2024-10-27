import type { Feature } from "geojson";

export function modifyFeatureWithFactor(
	feature: Feature,
	longFactor: number,
	latFactor: number,
) {
	switch (feature.geometry.type) {
		case "Point": {
			const coords = [
				feature.geometry.coordinates[0] * longFactor,
				feature.geometry.coordinates[1] * latFactor,
			];
			return {
				...feature,
				geometry: { ...feature.geometry, coordinates: coords },
			};
		}
		case "LineString": {
			const coords = feature.geometry.coordinates.map((c) => [
				c[0] * longFactor,
				c[1] * latFactor,
			]);
			return {
				...feature,
				geometry: { ...feature.geometry, coordinates: coords },
			};
		}
		case "Polygon": {
			const coords = feature.geometry.coordinates[0].map((c) => [
				c[0] * longFactor,
				c[1] * latFactor,
			]);
			return {
				...feature,
				geometry: { ...feature.geometry, coordinates: [coords] },
			};
		}
		default:
			throw new Error(`Not handled geometry type ${feature.geometry.type}`);
	}
}

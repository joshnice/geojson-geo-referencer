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
	return coordinate.map((num) => Number.parseFloat(num.toFixed(dp))) as [number, number];
}

export function findCenterOfTwoCoordinates(coordinateA: [number, number], coordinateB: [number, number]): [number, number] {
	const long = (coordinateA[0] + coordinateB[0]) / 2;
	const lat = (coordinateA[1] + coordinateB[1]) / 2;
	return [long, lat];
}

export function calculateDistanceBetweenCoordinates(coordinateA: [number, number], coordinateB: [number, number]) {
	const dx = coordinateA[0] - coordinateB[0];
	const dy = coordinateA[1] - coordinateB[1];

	// Apply the Pythagorean theorem to get the distance
	const distance = Math.sqrt(dx * dx + dy * dy);

	// Return the calculated distance
	return distance;
}

export function calculateBearingBetweenCoordinates(coordinateA: [number, number], coordinateB: [number, number]) {
	const dx = coordinateA[0] - coordinateB[0];
	const dy = coordinateB[1] - coordinateA[1];

	// Calculate the angle in radians
	let angle = Math.atan2(dy, dx) * (180 / Math.PI);

	// Normalize the bearing to be within 0 to 360 degrees
	angle = (angle + 90) % 360;

	return angle;
}

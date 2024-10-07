import { Feature, LineString } from "geojson";

export function createLine(
	coordinates: [number, number][],
): Feature<LineString> {
	return {
		type: "Feature",
		geometry: { type: "LineString", coordinates },
		properties: {},
	};
}

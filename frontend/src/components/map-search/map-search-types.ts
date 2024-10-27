import type { FeatureCollection, Point } from "geojson";

type MapboxSearchResultProperty = {
    full_address: string;
    bbox: [number, number, number, number];
}

export type MapboxSearchResults = FeatureCollection<Point, MapboxSearchResultProperty>
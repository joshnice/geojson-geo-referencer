import { FeatureCollection, Feature } from "geojson";

export function createFeatureCollection(features: Feature[]): FeatureCollection {
    return { type: "FeatureCollection", features }
}
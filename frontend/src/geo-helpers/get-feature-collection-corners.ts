import { FeatureCollection } from "geojson";
import { flatternFeatureCoordinates } from "./coordinate-helpers";

export function getTopLeftCoordinate(featureCollection: FeatureCollection): [number, number] {
    let topLeftCoordinate: [number, number] | null = null;

    featureCollection.features.forEach((feature) => {
        const flatterenedCoordaintes = flatternFeatureCoordinates(feature);
        flatterenedCoordaintes.forEach(([long, lat]) => {

            if (topLeftCoordinate == null) {
                topLeftCoordinate = [long, lat];
            }

            if (long < topLeftCoordinate[0] && lat > topLeftCoordinate[1]) {
                topLeftCoordinate = [long, lat];
            }
        });

    });

    if (topLeftCoordinate == null) {
        throw new Error();
    }

    return topLeftCoordinate;
}

export function getTopRightCoordinate(featureCollection: FeatureCollection): [number, number] {
    let topLeftCoordinate: [number, number] | null = null;

    featureCollection.features.forEach((feature) => {
        const flatterenedCoordaintes = flatternFeatureCoordinates(feature);
        flatterenedCoordaintes.forEach(([long, lat]) => {

            if (topLeftCoordinate == null) {
                topLeftCoordinate = [long, lat];
            }

            if (long > topLeftCoordinate[0] && lat > topLeftCoordinate[1]) {
                topLeftCoordinate = [long, lat];
            }
        });

    });

    if (topLeftCoordinate == null) {
        throw new Error();
    }

    return topLeftCoordinate;
}
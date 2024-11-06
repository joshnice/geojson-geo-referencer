import type { FeatureCollection, Feature } from "geojson";
import { getCornerCoordinate } from "./get-feature-collection-corners";
import { findCenterOfTwoCoordinates } from "./coordinate-helpers";
import { modifyFeatureWithVector } from "./translate-feature";
import { createFeatureCollection } from "./feature-collection";

export function findCenterOfFeatureCollection(featureCollection: FeatureCollection) {
    const bottomLeft = getCornerCoordinate(featureCollection, "bottom-left");
    const bottomRight = getCornerCoordinate(featureCollection, "bottom-right");
    const topRight = getCornerCoordinate(featureCollection, "top-right");
    const topLeft = getCornerCoordinate(featureCollection, "top-left");

    const topLeftBottomRightMidPoint = findCenterOfTwoCoordinates(topLeft, bottomRight);
    const topRightBottomLeftMidPoint = findCenterOfTwoCoordinates(topRight, bottomLeft);

    return findCenterOfTwoCoordinates(topLeftBottomRightMidPoint, topRightBottomLeftMidPoint);
}

export function changeCenterPointOfFeatureCollection(featureCollection: FeatureCollection, newCenter = [0, 0]) {
    const currentCenter = findCenterOfFeatureCollection(featureCollection);
    const oldCenterToNewVector: [number, number] = [newCenter[0] - currentCenter[0], newCenter[1] - currentCenter[1]];
    const centeredFeatures: Feature[] = []
    // biome-ignore lint/complexity/noForEach: <explanation>
    featureCollection.features.forEach((feature) => {
        const newFeature = modifyFeatureWithVector(feature, oldCenterToNewVector);
        centeredFeatures.push(newFeature);
    });
    return createFeatureCollection(centeredFeatures);
}



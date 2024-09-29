import { flatternFeatureCoordinates } from "./coordinate-helpers.mjs";

export function getCutOff(avg, low, high) {
    const avgMinHigh = high - avg;
    const avgMinusLow = avg - low;
    const incrementLong = avgMinHigh > avgMinusLow ? avgMinusLow : avgMinHigh;
    return avg + incrementLong;
}

export function filterCoordinates(featureCollection, maxLong, maxLat, filterTypes) {
    const validFeatures = featureCollection.features.reduce((validFeatures, feature) => {

        const flatternedCoordinates = flatternFeatureCoordinates(feature);

        const invalid = filterTypes.includes(feature.geometry.type) || flatternedCoordinates.some(([long, lat]) => long > maxLong || lat > maxLat);

        if (!invalid) {
            validFeatures.push(feature);
        }

        return validFeatures;

    }, []);

    return { type: "FeatureCollection", features: validFeatures };
}
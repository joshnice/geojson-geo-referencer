
/**
 * @param {Feature} feature 
 * @returns {[number, number][]}
 */
export function flatternFeatureCoordinates(feature) {
    switch (feature.geometry.type) {
        case "Point":
            return [feature.geometry.coordinates];
        case "LineString":
            return feature.geometry.coordinates;
        case "Polygon":
            return feature.geometry.coordinates[0];
        default:
            throw new Error(`Not handled geometry type ${feature.geometry.type}`)
    }
}

/**
 * @param {Feature} feature 
 * @param {number} longFactor 
 * @param {number} latFactor 
 * @returns {Feature}
 */
export function modifyFeatureWithFactor(feature, longFactor, latFactor) {
    switch (feature.geometry.type) {
        case "Point": {
            const coords = [feature.geometry.coordinates[0] * longFactor, feature.geometry.coordinates[1] * latFactor]
            return { ...feature, geometry: { ...feature.geometry, coordinates: coords } };
        }
        case "LineString": {
            const coords = feature.geometry.coordinates.map((c) => [c[0] * longFactor, c[1] * latFactor])
            return { ...feature, geometry: { ...feature.geometry, coordinates: coords } };
        }
        case "Polygon": {
            const coords = feature.geometry.coordinates[0].map((c) => [c[0] * longFactor, c[1] * latFactor])
            return { ...feature, geometry: { ...feature.geometry, coordinates: [coords] } };
        }
        default:
            throw new Error(`Not handled geometry type ${feature.geometry.type}`)
    }
}

/**
 * @returns {{ highestLong: number, highestLat: number, lowestLat: number, lowestLong: number }}
 */
export function findHighestAndLowestCoordinates(featureCollection) {
    let highestLong = -Infinity;
    let highestLat = -Infinity;
    let lowestLong = Infinity;
    let lowestLat = Infinity;

    featureCollection.features.forEach((feature) => {

        const flatternedCoordinates = flatternFeatureCoordinates(feature);

        flatternedCoordinates.forEach(([long, lat]) => {

            if (long > highestLong) {
                highestLong = long;
            }

            if (lat > highestLat) {
                highestLat = lat;
            }

            if (long < lowestLong) {
                lowestLong = long;
            }

            if (lat < lowestLat) {
                lowestLat = lat;
            }

        });

    });

    return { highestLong, highestLat, lowestLat, lowestLong }
}

export function getAvgLongLat(featureCollection) {
    let longTot = 0;
    let latTot = 0;
    let coordCount = 0;

    featureCollection.features.forEach((feature) => {

        const flatternedCoordinates = flatternFeatureCoordinates(feature);

        flatternedCoordinates.forEach(([long, lat]) => {
            coordCount += 1;
            longTot += long;
            latTot += lat;
        });
    });

    return { lat: latTot / coordCount, long: longTot / coordCount }
}


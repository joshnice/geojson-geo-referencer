
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
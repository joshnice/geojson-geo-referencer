import type { Corners, GeoReferenceCadResult } from "../../mapbox/types";

export function constructGeoReferenceString(values: GeoReferenceCadResult) {
    return `-4point_coordinate_mapping:${stringifyCoords(values.orignalCadPosition)}, ${stringifyCoords(values.realWorldPosition)}`
}

function stringifyCoords(corners: Corners) {
    return `{(${corners.topLeft[0]},${corners.topLeft[1]}), (${corners.topRight[0]},${corners.topRight[1]}), (${corners.bottomLeft[0]},${corners.bottomLeft[1]}), (${corners.bottomRight[0]},${corners.bottomRight[1]})}`
}
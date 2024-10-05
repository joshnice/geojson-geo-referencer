import mapboxgl, { FillLayerSpecification, LineLayerSpecification, Map, SymbolLayerSpecification } from "mapbox-gl";
import { FeatureCollection, Feature, Polygon, LineString } from "geojson";
import { Subjects } from "./types";
import { bbox } from "@turf/bbox";
import center from "@turf/center";
import { rhumbDistance } from "@turf/rhumb-distance"
import { rhumbDestination } from "@turf/rhumb-destination"
import { rhumbBearing } from "@turf/rhumb-bearing"
import { createFeatureCollection } from "../geo-helpers/feature-collection";
import { getTopLeftCoordinate, getTopRightCoordinate } from "../geo-helpers/get-feature-collection-corners";

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg';

const CAD_WIDTH_METERS = 100;

export class MapboxCad {
    private map: Map | null = null;

    private sourceId = "cad-source";

    private fillLayer: FillLayerSpecification = {
        id: "fill-layer",
        type: "fill",
        paint: {
            "fill-color": "green"
        },
        source: this.sourceId,
        filter: ["==", ["geometry-type"], "Polygon"]
    };

    private lineLayer: LineLayerSpecification = {
        id: "line-layer",
        type: "line",
        paint: {
            "line-color": "red",
            "line-width": 5
        },
        source: this.sourceId,
        filter: ["==", ["geometry-type"], "LineString"]
    };

    constructor(element: HTMLDivElement, file: File, subjects: Subjects) {
        this.createMap(element, file, subjects.$click);
        this.setUpSubjects(subjects);
    }

    private async createMap(element: HTMLDivElement, file: File, $click: Subjects["$click"]) {
        const geojson = await this.loadGeojson(file);
        const topLeftCoord = getTopLeftCoordinate(geojson);
        const topRightCoord = getTopRightCoordinate(geojson);
        const notScaledCadWidth = rhumbDistance(topLeftCoord, topRightCoord, { units: "meters" });
        const widthScaleFactor = CAD_WIDTH_METERS / notScaledCadWidth;

        const newFeatures: Feature[] = [];
        geojson.features.forEach((feature) => {
            if (feature.geometry.type === "LineString") {
                const newCoords = feature.geometry.coordinates.map(([lng, lat]) => {
                    const lengthBetweenRefPointAndCoord = rhumbDistance(topLeftCoord, [lng, lat], { units: "meters" });
                    const metersAlongGuideLine = lengthBetweenRefPointAndCoord * widthScaleFactor;
                    const bearing = rhumbBearing(topLeftCoord, [lng, lat]);
                    const dest = rhumbDestination(topLeftCoord, metersAlongGuideLine, bearing, { units: "meters" });
                    return dest.geometry.coordinates;
                });
                newFeatures.push({
                    type: "Feature", geometry: { coordinates: newCoords, type: "LineString" },
                    properties: {}
                });
            }
        });
        const newFeatureCollection = createFeatureCollection(newFeatures);

        const [one, two, three, four] = bbox(newFeatureCollection);

        this.map = new mapboxgl.Map({
            container: element,
            center: [0, 0],
            zoom: 1,
            projection: "mercator",
            maxPitch: 0,
            style: "mapbox://styles/mapbox/light-v11",
            maxZoom: 24,
        });

        this.map.doubleClickZoom.disable();

        this.map.once("idle", () => {
            this.addSource(newFeatureCollection);
            this.addLayers();
            this.map?.fitBounds([one, two, three, four], { duration: 0 })
        });

        this.map.on("click", (e) => {
            const canvasClick: [number, number] = [e.point.x, e.point.y];
            const coordinateClick: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            $click.next({ canvas: canvasClick, lngLat: coordinateClick });
        })
    }

    private addSource(geojson: FeatureCollection) {

        this.map?.addSource(this.sourceId, {
            type: "geojson",
            data: geojson
        })
    }

    private addLayers() {
        this.map?.addLayer(this.lineLayer);
    }

    private async loadGeojson(file: File): Promise<FeatureCollection> {
        return new Promise((res) => {
            const reader = new FileReader();
            let geojson;

            reader.onload = function (e) {
                if (e.target != null) {
                    const fileContent = e.target.result;
                    geojson = eval(`(${fileContent})`);
                    res(geojson);
                }
            }

            reader.readAsText(file);
        })
    }

    private setUpSubjects(subjects: Subjects) {
        subjects.$zoom.subscribe((val) => {
            if (val === "in") {
                this.map?.zoomIn();
            }

            if (val === "out") {
                this.map?.zoomOut();
            }
        })

        subjects.$moveCadToCenter.subscribe(() => {

            const centerOfMap = this.map?.getCenter();
            const [mapCenterPointLong, mapCenterPointLat]: [number, number] = [centerOfMap?.lng as number, centerOfMap?.lat as number];

            const geojson = this.map?.getSource(this.sourceId);
            if (geojson?.type === "geojson") {
                const featureCollection = geojson._data;
                if (typeof featureCollection !== "string") {
                    const [geojsonLong, geojsonLat] = center(featureCollection).geometry.coordinates;
                    const longDiff = mapCenterPointLong - geojsonLong;
                    const latDiff = mapCenterPointLat - geojsonLat;
                    const newFeatures: FeatureCollection = { type: "FeatureCollection", features: [] };
                    if (featureCollection.type === "FeatureCollection") {
                        featureCollection.features.forEach((f) => {
                            if (f.geometry.type === "LineString") {
                                const newFeatureCoords: Feature<LineString>["geometry"]["coordinates"] = [];
                                f.geometry.coordinates.forEach(([long, lat]) => {
                                    newFeatureCoords.push([long + longDiff, lat + latDiff]);
                                });
                                newFeatures.features.push({ ...f, geometry: { ...f.geometry, coordinates: newFeatureCoords } })
                            }
                        });
                        geojson.setData(newFeatures);
                    }
                }
            }
        });
    }
}
import mapboxgl, { FillLayerSpecification, LineLayerSpecification, Map } from "mapbox-gl";
import { FeatureCollection, Feature } from "geojson";
import { Subjects } from "./types";
import { bbox } from "@turf/bbox";
import center from "@turf/center";
import { rhumbDistance } from "@turf/rhumb-distance"
import { rhumbDestination } from "@turf/rhumb-destination"
import { rhumbBearing } from "@turf/rhumb-bearing"
import { transformRotate } from "@turf/transform-rotate"
import { createFeatureCollection } from "../geo-helpers/feature-collection";
import { getCornerCoordinate } from "../geo-helpers/get-feature-collection-corners";
import { moveFeatureCollection } from "../geo-helpers/move-geojson";
import { optimiseFeatureCollection } from "../geo-helpers/filter-feature-collection";

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg';

const CAD_WIDTH_METERS = 100;

const scaleFactor = { latFactor: 0.14761747623608987, longFactor: 0.1089453888215829 }

export class MapboxCad {
    private map: Map | null = null;

    private sourceId = "cad-source";

    private previousRotation = 0;

    private startingDragPos: [number, number] | null = null;

    private lastMovement = 0;

    private originalTopLeftCoords: [number, number] = [0, 0];

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
        this.createMap(element, file);
        this.setUpSubjects(subjects);
    }

    private async createMap(element: HTMLDivElement, file: File) {
        const geojson = await this.loadGeojson(file);
        this.originalTopLeftCoords = getCornerCoordinate(geojson, "top-left");
        const topLeftCoord = getCornerCoordinate(geojson, "top-left");
        const topRightCoord = getCornerCoordinate(geojson, "top-right");
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

        const filteredFeatureCollection = optimiseFeatureCollection(createFeatureCollection(newFeatures), 1);

        const [one, two, three, four] = bbox(filteredFeatureCollection);

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
            this.addSource(filteredFeatureCollection);
            this.addLayers();
            this.map?.fitBounds([one, two, three, four], { duration: 0 });
            this.cadLayerEventListeners();
        });
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
        subjects.$moveCadToCenter.subscribe(() => {
            const centerOfMap = this.map?.getCenter();
            const start: [number, number] = [centerOfMap?.lng as number, centerOfMap?.lat as number];
            const featureCollection = this.getCadGeojson();
            const end = center(featureCollection).geometry.coordinates;
            const newFeatures = moveFeatureCollection(featureCollection, start, end as [number, number]);
            this.setCadGeojson(newFeatures);
        });

        subjects.$rotation.subscribe((rotation) => {
            if (!Number.isNaN(rotation)) {
                const cadGeoJSON = this.getCadGeojson();
                const resetCadGeoJSON = transformRotate(cadGeoJSON, this.previousRotation * -1);
                this.previousRotation = rotation;
                const rotatedGeoJSON = transformRotate(resetCadGeoJSON, rotation);
                this.setCadGeojson(rotatedGeoJSON);
            }
        })

        subjects.$geoReferenceCad.subscribe(() => {
            const cadGeoJSON = this.getCadGeojson();
            const [topLeftLong, topLeftLat] = getCornerCoordinate(cadGeoJSON, "top-left");
            const topRight = getCornerCoordinate(cadGeoJSON, "top-right");
            const bottomLeft = getCornerCoordinate(cadGeoJSON, "bottom-left");
            const bottomRight = getCornerCoordinate(cadGeoJSON, "bottom-right");

            console.log("this.originalTopLeftCoords", this.originalTopLeftCoords);

            const topLeftCadCoordLong = this.originalTopLeftCoords[0] / scaleFactor.longFactor;
            const topLeftCadCoordLat = this.originalTopLeftCoords[1] / scaleFactor.latFactor;

            console.log("Top left CAD Long", topLeftCadCoordLong, "Geo Long", topLeftLong);
            console.log("Top left CAD Lat", topLeftCadCoordLat, "Geo Lat", topLeftLat)
        });
    }

    private getCadGeojson(): FeatureCollection {
        const geojson = this.map?.getSource(this.sourceId);
        if (geojson?.type === "geojson") {
            const featureCollection = geojson._data;
            if (typeof featureCollection !== "string" && featureCollection.type === "FeatureCollection") {
                return featureCollection;
            }
        }
        throw new Error();
    }

    private setCadGeojson(updatedCadGeojson: FeatureCollection) {
        const geojson = this.map?.getSource(this.sourceId);
        if (geojson?.type === "geojson") {
            geojson.setData(updatedCadGeojson)
        }
    }


    private cadLayerEventListeners() {

        this.map?.on("mouseenter", this.lineLayer.id, () => {
            if (this.map) {
                this.map.setPaintProperty(this.lineLayer.id, "line-color", "blue");
                this.map.getCanvas().style.cursor = "move";
            }

        });

        this.map?.on("mouseleave", this.lineLayer.id, () => {
            if (this.map && this.startingDragPos == null) {
                this.map.setPaintProperty(this.lineLayer.id, "line-color", "red");
                this.map.getCanvas().style.cursor = "grab";
            }
        });

        this.map?.on("mousedown", this.lineLayer.id, (event) => {
            this.startingDragPos = event.lngLat.toArray();
            event.preventDefault();
        });

        this.map?.on("mouseup", () => {
            if (this.startingDragPos != null && this.map != null) {
                this.map.setPaintProperty(this.lineLayer.id, "line-color", "red");
                this.map.getCanvas().style.cursor = "grab";
                this.startingDragPos = null;
            }
        });

        this.map?.on("mousemove", (event) => {
            if (this.startingDragPos && this.lastMovement < performance.now() - 50) {
                this.lastMovement = performance.now();
                const cadGeoJSON = this.getCadGeojson();
                const updatedFeatureCollection = moveFeatureCollection(cadGeoJSON, event.lngLat.toArray(), this.startingDragPos);
                this.startingDragPos = event.lngLat.toArray();
                this.setCadGeojson(updatedFeatureCollection);
            }
        });
    }

}
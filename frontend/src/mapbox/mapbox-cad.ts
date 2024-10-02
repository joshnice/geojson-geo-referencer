import mapboxgl, { FillLayerSpecification, LineLayerSpecification, Map, SymbolLayerSpecification } from "mapbox-gl";
import { FeatureCollection, Feature, Polygon } from "geojson";
import { Subjects } from "./types";
import { bbox } from "@turf/bbox";
import { length } from "@turf/length"
import { bboxPolygon } from "@turf/bbox-polygon";
import { transformScale } from "@turf/transform-scale";
import { createLine } from "../geo-helpers/line";

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg';

const CAD_WIDTH_METERS = 200;

export class MapboxCad {
    private map: Map | null = null;

    private sourceId = "cad-source";

    private boundsSourceId = "bounds";

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


    private textLayer: SymbolLayerSpecification = {
        id: "symbol-layer",
        type: "symbol",
        layout: {
            "text-field": ["get", "text"]
        },
        source: this.sourceId,
        filter: ["==", ["geometry-type"], "Point"]
    }

    private boundsLayer: FillLayerSpecification = {
        id: "bounds",
        type: "fill",
        source: this.boundsSourceId,
    }

    constructor(element: HTMLDivElement, file: File, subjects: Subjects) {
        this.createMap(element, file, subjects.$click);
        this.setUpSubjects(subjects);
    }

    private async createMap(element: HTMLDivElement, file: File, $click: Subjects["$click"]) {

        const geojson = await this.loadGeojson(file);
        const bounds = bboxPolygon(bbox(geojson));
        const refrencePoint = bounds.geometry.coordinates[0][3] as [number, number];
        const coordTwoWidth = bounds.geometry.coordinates[0][2] as [number, number];
        const referenceLine = createLine([refrencePoint, coordTwoWidth]);
        const boundsWidth = length(referenceLine, { units: "meters" });
        const widthScaleFactor = CAD_WIDTH_METERS / boundsWidth;
        transformScale(geojson, widthScaleFactor, { origin: refrencePoint, mutate: true });

        // Original way with issue of curved geojson
        // const newFeatures: Feature[] = [];
        // geojson.features.forEach((feature) => {
        //     if (feature.geometry.type === "LineString") {
        //         const newCoords = feature.geometry.coordinates.map(([lng, lat]) => {
        //             const guideLine = createLine([refrencePoint, [lng, lat]]);
        //             const lengthOfGuideLine = length(guideLine, { units: "meters" });
        //             const alongGuideLineAmount = widthScaleFactor * lengthOfGuideLine;
        //             return along(guideLine, alongGuideLineAmount, { units: "meters" }).geometry.coordinates;
        //         });
        //         feature.geometry.coordinates = newCoords;
        //         newFeatures.push(feature);
        //     }
        // });
        // const newFeatureCollection = createFeatureCollection(newFeatures);

        const [one, two, three, four] = bbox(geojson);

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
            this.addSource(geojson, bounds);
            this.addLayers();
            this.map?.fitBounds([one, two, three, four])
        });

        this.map.on("click", (e) => {
            const canvasClick: [number, number] = [e.point.x, e.point.y];
            const coordinateClick: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            $click.next({ canvas: canvasClick, lngLat: coordinateClick });
        })
    }

    private addSource(geojson: FeatureCollection, bounds: Feature<Polygon>) {

        this.map?.addSource(this.boundsSourceId, {
            type: "geojson",
            data: { type: "FeatureCollection", features: [bounds] }
        })

        this.map?.addSource(this.sourceId, {
            type: "geojson",
            data: geojson
        })
    }

    private addLayers() {
        // this.map?.addLayer(this.bound    sLayer);
        // this.map?.addLayer(this.fillLayer);
        this.map?.addLayer(this.lineLayer);
        // this.map?.addLayer(this.textLayer);
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
    }
}
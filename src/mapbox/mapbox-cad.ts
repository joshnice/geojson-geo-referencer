import mapboxgl, {
	type Layer,
	type LineLayerSpecification,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
	type Map,
	type StyleSpecification,
} from "mapbox-gl";
import type { FeatureCollection } from "geojson";
import type { Subjects } from "./types";
import { bbox } from "@turf/bbox";
import {
	getClosestCadCoordinate as getClosestFeatureCollectionCoordinate,
	transformNonValidGeoJSONToValid,
} from "../geo-helpers/feature-collection";
import { parseFileToJSON } from "../file-helpers/file-to-json";
import type { Subject } from "rxjs";
import {
	type CornerPosition,
	getCornerCoordinate,
} from "../geo-helpers/get-feature-collection-corners";

mapboxgl.accessToken =
	"pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export class MapboxCad {
	private map: Map | null = null;

	private sourceId = "cad-source";

	private originalGeoJSON: FeatureCollection | null = null;

	private transformedGeoJSON: FeatureCollection | null = null;

	private originalCadScaleFactor: { latFactor: number; longFactor: number } = {
		latFactor: 0,
		longFactor: 0,
	};

	private lineLayer: LineLayerSpecification = {
		id: "line-layer",
		type: "line",
		paint: {
			"line-color": "red",
			"line-width": 1,
			"line-opacity": 0.7
		},
		source: this.sourceId,
		filter: ["==", ["geometry-type"], "LineString"],
	};

	private $eventLock: Subject<MouseEvent> | null = null;

	constructor(
		element: HTMLDivElement,
		cadGeojson: File,
		cadStyle: File | null,
		subjects: Subjects,
	) {
		this.createMap(element, cadGeojson, cadStyle);
		this.setUpSubjects(subjects);
	}

	private async createMap(
		element: HTMLDivElement,
		geoJSONFile: File,
		cadStyleFile: File | null,
	) {
		this.originalGeoJSON =
			await parseFileToJSON<FeatureCollection>(geoJSONFile);

		const { featureCollection: transformedFeatureCollection, scaleFactor } =
			await transformNonValidGeoJSONToValid(this.originalGeoJSON);

		this.originalCadScaleFactor = scaleFactor;

		const [one, two, three, four] = bbox(transformedFeatureCollection);

		this.map = new mapboxgl.Map({
			container: element,
			center: [0, 0],
			zoom: 1,
			projection: "mercator",
			maxPitch: 0,
			style: {
				layers: [],
				sources: {},
				version: 8,
				glyphs: "mapbox://fonts/joshnice/{fontstack}/{range}.pbf",
			},
			maxZoom: 24,
		});

		this.disableMapMovement();

		const canvasElement = this.map.getCanvas();

		canvasElement.addEventListener("mousedown", (event) => {
			this.$eventLock?.next(event);
		});

		canvasElement.addEventListener("mouseup", (event) => {
			this.$eventLock?.next(event);
		});

		canvasElement.addEventListener("mousemove", (event) => {
			this.$eventLock?.next(event);
		});

		canvasElement.addEventListener("wheel", (event) => {
			this.$eventLock?.next(event);
		});

		this.map.doubleClickZoom.disable();

		const styleSpec = cadStyleFile
			? await parseFileToJSON<StyleSpecification>(cadStyleFile)
			: null;

		if (cadStyleFile) {
			// biome-ignore lint/complexity/noForEach: <explanation>
			styleSpec?.layers.forEach((l) => {
				if (l.type === "line") {
					l.paint = { ...l.paint, "line-opacity": 0.7, "line-width": 1 };
				}

				if (l.type === "fill") {
					l.paint = { ...l.paint, "fill-opacity": 0.7 };
				}
			});
		}

		this.transformedGeoJSON = transformedFeatureCollection;

		if (this.map.idle()) {
			this.addSource(transformedFeatureCollection);
			this.addLayers(styleSpec ? styleSpec.layers : []);
			this.map?.fitBounds([one, two, three, four], { duration: 0 });
		} else {
			this.map.once("load", () => {
				this.addSource(transformedFeatureCollection);
				this.addLayers(styleSpec ? styleSpec.layers : []);
				this.map?.fitBounds([one, two, three, four], { duration: 0 });
			});
		}
	}

	private addSource(geojson: FeatureCollection) {
		this.map?.addSource(this.sourceId, {
			type: "geojson",
			data: geojson,
		});
	}

	private addLayers(layers: Layer[]) {
		if (layers.length !== 0) {
			// biome-ignore lint/complexity/noForEach: <explanation>
			layers.forEach((l) => {
				l.source = this.sourceId;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete l["source-layer"];
				this.map?.addLayer(l);
			});
		} else {
			this.map?.addLayer(this.lineLayer);
		}
	}

	private setUpSubjects(subjects: Subjects) {
		subjects.$rotation.subscribe((rotation) => {
			this.map?.setBearing(rotation);
		});

		subjects.$moveCad.subscribe((move) => {
			if (move) {
				this.enableMapMovement();
			} else {
				this.disableMapMovement();
			}
		});

		subjects.$geoReferenceCad.subscribe(() => {
			const topLeft = this.getCornerForGeoReference("top-left");
			const topRight = this.getCornerForGeoReference("top-right");
			const bottomLeft = this.getCornerForGeoReference("bottom-left");
			const bottomRight = this.getCornerForGeoReference("bottom-right");

			subjects.$getMapBackgroundPostion.next({
				canvasPositions: {
					topLeft: topLeft.canvas,
					topRight: topRight.canvas,
					bottomLeft: bottomLeft.canvas,
					bottomRight: bottomRight.canvas,
				},
				originalCadPosition: {
					topLeft: topLeft.cad,
					topRight: topRight.cad,
					bottomLeft: bottomLeft.cad,
					bottomRight: bottomRight.cad,
				},
			});
		});

		this.$eventLock = subjects.$eventLock;
	}

	private getCornerForGeoReference(cornerPosition: CornerPosition) {
		if (this.transformedGeoJSON == null || this.originalGeoJSON == null) {
			throw new Error("Cad GeoJSON is null");
		}

		const corner = getCornerCoordinate(this.transformedGeoJSON, cornerPosition);
		const cornerScaled: [number, number] = [
			corner[0] / this.originalCadScaleFactor.longFactor,
			corner[1] / this.originalCadScaleFactor.latFactor,
		];
		const canvasCoords = this.map?.unproject(corner).toArray();

		if (canvasCoords == null) {
			throw new Error("Not all coordinates can be seen");
		}

		return {
			canvas: canvasCoords,
			cad: getClosestFeatureCollectionCoordinate(
				this.originalGeoJSON,
				cornerScaled,
			),
		};
	}

	private enableMapMovement() {
		this.map?.dragPan.enable();
		this.map?.boxZoom.enable();
		this.map?.scrollZoom.enable();
		this.map?.touchZoomRotate.enable();
		this.map?.dragRotate.enable();
		this.map?.keyboard.enable();
		this.map?.doubleClickZoom.enable();
	}

	private disableMapMovement() {
		this.map?.dragPan.disable();
		this.map?.boxZoom.disable();
		this.map?.scrollZoom.disable();
		this.map?.touchZoomRotate.disable();
		this.map?.dragRotate.disable();
		this.map?.keyboard.disable();
		this.map?.doubleClickZoom.disable();
	}
}

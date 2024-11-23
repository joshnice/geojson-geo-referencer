import mapboxgl, {
	type SymbolLayerSpecification,
	type FillLayerSpecification,
	type LineLayerSpecification,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
	type Map,
	type StyleSpecification,
} from "mapbox-gl";
import type { FeatureCollection } from "geojson";
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
import type { SubjectContext } from "../state/subjects-context";

mapboxgl.accessToken =
	"pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export class MapboxCad {
	private map: Map | null = null;

	private sourceId = "cad-source";

	private originalGeoJSON: FeatureCollection | null = null;

	private transformedGeoJSON: FeatureCollection | null = null;

	private nonGeoReferencedGeoJSON: FeatureCollection | null = null;


	private fillLayer: FillLayerSpecification = {
		id: "fill-layer",
		type: "fill",
		paint: {
			"fill-opacity": 0.7,
			"fill-color": "green"
		},
		source: this.sourceId,
		filter: ["==", ["geometry-type"], "Polygon"],
	}

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

	private textLayer: SymbolLayerSpecification = {
		id: "text-layer",
		type: "symbol",
		layout: {
			"text-field": ["get", "text"]
		},
		source: this.sourceId,
		filter: ["==", ["geometry-type"], "Point"],
	}

	private $eventLock: Subject<MouseEvent> | null = null;

	constructor(
		element: HTMLDivElement,
		subjects: SubjectContext,
	) {
		this.createMap(element);
		this.setUpSubjects(subjects);
		this.handleMapRotatation(subjects);
	}

	private async createMap(
		element: HTMLDivElement,
	) {


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
			bearingSnap: 0,
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
	}

	private addSource(geojson: FeatureCollection) {
		this.map?.addSource(this.sourceId, {
			type: "geojson",
			data: geojson,
		});
	}

	private handleMapRotatation(subjects: SubjectContext) {
		this.map?.on("rotate", () => {
			subjects.$rotation.next(this.getMapBearingValue())
		})

		subjects.$rotation.subscribe((rotation) => {
			if (rotation !== this.getMapBearingValue()) {
				const bearing = this.getMapBearingValue(rotation);
				this.map?.setBearing(bearing);
			}
		});
	}

	private getMapBearingValue(bearing = this.map?.getBearing()) {
		if (bearing != null) {
			const parsedBearing = bearing < 0 ? 360 + bearing : bearing;
			return Number.parseFloat(parsedBearing.toString());
		}
		throw new Error("Bearing is null");
	}

	private setUpSubjects(subjects: SubjectContext) {

		subjects.$moveCadPosition.subscribe((move) => {
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

		subjects.$cadGeoJSONUpload.subscribe(async ({ file: geoJSONFile, unit }) => {
			this.originalGeoJSON =
				await parseFileToJSON<FeatureCollection>(geoJSONFile);

			const { featureCollection: transformedFeatureCollection, nonScaledFeatureCollection } =
				await transformNonValidGeoJSONToValid(this.originalGeoJSON, unit);

			this.transformedGeoJSON = transformedFeatureCollection;
			this.nonGeoReferencedGeoJSON = nonScaledFeatureCollection;

			const [one, two, three, four] = bbox(transformedFeatureCollection);

			this.addSource(transformedFeatureCollection);
			if (!this.map?.getStyle()?.layers.find((l) => l.source === this.sourceId)) {
				this.map?.addLayer(this.lineLayer);
				this.map?.addLayer(this.fillLayer);
				this.map?.addLayer(this.textLayer);
			}
			this.map?.fitBounds([one, two, three, four], { duration: 0 });
			const zoom = this.map?.getZoom();
			if (zoom == null) {
				throw new Error();
			}
			subjects.$cadUploadFinished.next(zoom);
		});

		subjects.$cadStyleUpload.subscribe(async (styleFile) => {
			const styleSpec = await parseFileToJSON<StyleSpecification>(styleFile)


			styleSpec?.layers.forEach((l) => {
				l.source = this.sourceId;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete l["source-layer"];
				if (l.type === "line") {
					l.paint = { ...l.paint, "line-opacity": 0.7, "line-width": 1 };
				}

				if (l.type === "fill") {
					l.paint = { ...l.paint, "fill-opacity": 0.7 };
				}
			});


			this.map?.getStyle()?.layers.forEach((layer) => {
				if (layer.source === this.sourceId) {
					this.map?.removeLayer(layer.id);
				}
			});


			styleSpec.layers.forEach((layer) => {
				this.map?.addLayer(layer);
			});
		});

		subjects.$zoom.subscribe((zoom) => {
			this.map?.setZoom(zoom);
		});
	}

	private getCornerForGeoReference(cornerPosition: CornerPosition) {
		if (this.transformedGeoJSON == null || this.originalGeoJSON == null || this.nonGeoReferencedGeoJSON == null) {
			throw new Error("Cad GeoJSON is null");
		}

		const corner = getCornerCoordinate(this.transformedGeoJSON, cornerPosition);
		const cornerScaled = getCornerCoordinate(this.nonGeoReferencedGeoJSON, cornerPosition);

		const canvasCoords = this.map?.project(corner);

		if (canvasCoords == null) {
			throw new Error("Not all coordinates can be seen");
		}

		return {
			canvas: [canvasCoords.x, canvasCoords.y] as [number, number],
			cad: getClosestFeatureCollectionCoordinate(
				this.originalGeoJSON,
				cornerScaled,
			),
		};
	}

	private enableMapMovement() {
		this.map?.dragPan.enable();
		this.map?.touchZoomRotate.enable();
		this.map?.dragRotate.enable();
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

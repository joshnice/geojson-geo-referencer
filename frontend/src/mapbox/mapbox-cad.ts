import { bbox } from "@turf/bbox";
import type { FeatureCollection } from "geojson";
import mapboxgl, { type SymbolLayerSpecification, type FillLayerSpecification, type LineLayerSpecification, Map as MapboxMap, type StyleSpecification } from "mapbox-gl";
import { parseFileToJSON } from "../file-helpers/file-to-json";
import { getClosestCadCoordinate as getClosestFeatureCollectionCoordinate, transformNonValidGeoJSONToValid } from "../geo-helpers/feature-collection";
import { getAvgLongLat } from "../geo-helpers/feature-collection-stats";
import { type CornerPosition, getCornerCoordinate } from "../geo-helpers/get-feature-collection-corners";
import type { SubjectContext } from "../state/subjects-context";

mapboxgl.accessToken = "pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export class MapboxCad {
	private map: MapboxMap | null = null;

	private sourceId = "cad-source";

	private originalGeoJSON: FeatureCollection | null = null;

	private transformedGeoJSON: FeatureCollection | null = null;

	private nonGeoReferencedGeoJSON: FeatureCollection | null = null;

	private origin: [number, number] | null = null;

	private mapBackgroundCenter: [number, number] = [0, 0];

	private hasGeoJsonBeenAdded = false;

	private fillLayer: FillLayerSpecification = {
		id: "fill-layer",
		type: "fill",
		paint: {
			"fill-opacity": 0.7,
			"fill-color": "green",
		},
		source: this.sourceId,
		filter: ["==", ["geometry-type"], "Polygon"],
	};

	private lineLayer: LineLayerSpecification = {
		id: "line-layer",
		type: "line",
		paint: {
			"line-color": "red",
			"line-width": 1,
			"line-opacity": 0.7,
		},
		source: this.sourceId,
		filter: ["==", ["geometry-type"], "LineString"],
	};

	private textLayer: SymbolLayerSpecification = {
		id: "text-layer",
		type: "symbol",
		layout: {
			"text-field": ["get", "text"],
		},
		source: this.sourceId,
		filter: ["==", ["geometry-type"], "Point"],
	};

	private $eventLock: SubjectContext["$eventLock"] | null = null;

	private $zoom: SubjectContext["$zoom"] | null = null;

	private $filteredLayerIds: SubjectContext["$filteredLayerIds"] | null = null;

	constructor(element: HTMLDivElement, subjects: SubjectContext) {
		this.createMap(element);
		this.setUpSubjects(subjects);
		this.handleMapRotatation(subjects);
	}

	private async createMap(element: HTMLDivElement) {
		this.map = new MapboxMap({
			container: element,
			center: [0, 0],
			zoom: 2,
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
			const zoom = this.map?.getZoom();
			// Let's add a toggle for this
			if (zoom != null && this.hasGeoJsonBeenAdded) {
				this.$zoom?.next({ value: zoom, source: "map" });
			}
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

	private updateSource(geojson: FeatureCollection) {
		const source = this.map?.getSource(this.sourceId);
		if (source == null) {
			throw new Error(`Source ${this.sourceId} has not been added to the map yet.`);
		}
		if (source.type === "geojson") {
			source.setData(geojson);
		}
	}

	private handleMapRotatation(subjects: SubjectContext) {
		this.map?.on("rotate", () => {
			subjects.$rotation.next(this.getMapBearingValue());
		});

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

		// Set subjects for class
		this.$eventLock = subjects.$eventLock;
		this.$zoom = subjects.$zoom;
		this.$filteredLayerIds = subjects.$filteredLayerIds;

		subjects.$backgroundMapCenter.subscribe((center) => {
			this.mapBackgroundCenter = center;
		});

		subjects.$cadGeoJSONUpload.subscribe(async ({ file: geoJSONFile, units: unit }) => {
			this.originalGeoJSON = await parseFileToJSON<FeatureCollection>(geoJSONFile);

			const { featureCollection: transformedFeatureCollection, nonScaledFeatureCollection } = await transformNonValidGeoJSONToValid(this.originalGeoJSON, unit, this.origin ?? this.mapBackgroundCenter);

			this.transformedGeoJSON = transformedFeatureCollection;
			this.nonGeoReferencedGeoJSON = nonScaledFeatureCollection;

			const [one, two, three, four] = bbox(transformedFeatureCollection);

			this.addSource(transformedFeatureCollection);
			if (!this.map?.getStyle()?.layers.find((l) => l.source === this.sourceId)) {
				this.map?.addLayer(this.lineLayer);
				this.addLayerEvents(this.lineLayer.id);
				this.map?.addLayer(this.fillLayer);
				this.addLayerEvents(this.fillLayer.id);
				this.map?.addLayer(this.textLayer);
				this.addLayerEvents(this.textLayer.id);
			}
			this.map?.fitBounds([one, two, three, four], { duration: 0 });
			const zoom = this.map?.getZoom();
			if (zoom == null) {
				throw new Error();
			}
			subjects.$cadUploadFinished.next(zoom);
			this.hasGeoJsonBeenAdded = true;
		});

		subjects.$geoReferencedGeoJSONUpload.subscribe(async (geoJSONFile) => {
			const geoReferencedFeatureCollection = await parseFileToJSON<FeatureCollection>(geoJSONFile);
			const { long, lat } = getAvgLongLat(geoReferencedFeatureCollection);
			this.origin = [long, lat];
		});

		subjects.$cadStyleUpload.subscribe(async (styleFile) => {
			const styleSpec = await parseFileToJSON<StyleSpecification>(styleFile);

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
				this.addLayerEvents(layer.id);
			});
		});

		subjects.$zoom.subscribe(({ value, source }) => {
			if (source === "toolbar") {
				this.map?.setZoom(value);
			}
		});

		subjects.$filteredLayerIds.subscribe((layerIds) => {
			if (this.transformedGeoJSON != null) {
				const layerIdFilters = layerIds.map((id) => ({ property: "layer", value: id }));
				this.filterGeojsonWithPropertyValue(layerIdFilters);
			}
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
			cad: getClosestFeatureCollectionCoordinate(this.originalGeoJSON, cornerScaled),
		};
	}

	private addLayerEvents(id: string) {
		this.map?.on("click", id, (event) => {
			const features = this.map?.queryRenderedFeatures(event.point);
			const layerIdsToFilter: string[] = features?.flatMap((feature) => (feature.properties?.layer != null ? [feature.properties.layer] : [])) ?? [];
			const existingLayerIds = this.$filteredLayerIds?.value ?? [];
			layerIdsToFilter.push(...existingLayerIds);
			const uniqueLayerIds = Array.from(new Set(layerIdsToFilter));
			this.$filteredLayerIds?.next(uniqueLayerIds);
		});

		this.map?.on("mouseover", id, () => {
			if (this.map != null) {
				this.map.getCanvas().style.cursor = "pointer";
			}
		});

		this.map?.on("mouseleave", id, () => {
			if (this.map != null) {
				this.map.getCanvas().style.cursor = "grab";
			}
		});
	}

	private filterGeojsonWithPropertyValue(filter: { property: string; value: string | number | boolean }[]) {
		if (this.transformedGeoJSON == null) {
			throw new Error("Can't filter feature collection if not defined");
		}

		const updatedFeatures = this.transformedGeoJSON.features.filter((feature) => {
			const matchingPropertyValue = filter.some((f) => feature.properties?.[f.property] === f.value);
			return !matchingPropertyValue;
		});

		this.updateSource({ type: "FeatureCollection", features: updatedFeatures });
	}

	private enableMapMovement() {
		this.map?.dragPan.enable();
		this.map?.touchZoomRotate.enable();
		this.map?.dragRotate.enable();
	}

	private disableMapMovement() {
		this.map?.dragPan.disable();
		this.map?.boxZoom.disable();
		this.map?.touchZoomRotate.disable();
		this.map?.dragRotate.disable();
		this.map?.keyboard.disable();
		this.map?.doubleClickZoom.disable();
	}
}

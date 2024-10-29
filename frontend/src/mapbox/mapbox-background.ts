// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import mapboxgl, { type LineLayerSpecification, Map, type StyleSpecification } from "mapbox-gl";
import type { FeatureCollection } from "geojson";
import type { GeoReferenceCadResult } from "./types";
import { roundCoordinate } from "../geo-helpers/coordinate-helpers";
import type { SubjectContext } from "../state/subjects-context";
import { parseFileToJSON } from "../file-helpers/file-to-json";
import bbox from "@turf/bbox";

mapboxgl.accessToken =
	"pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export class MapboxBackground {
	private readonly map: Map;

	private allowMove = true;

	private readonly sourceId = "geojson";

	private fitToBounds = true;

	private readonly lineLayer: LineLayerSpecification = {
		id: "line-layer",
		type: "line",
		paint: {
			"line-color": "red",
			"line-width": 1,
			"line-opacity": 0.7
		},
		source: this.sourceId,
		filter: ["==", ["geometry-type"], "LineString"],
	}

	constructor(element: HTMLDivElement, subjects: SubjectContext) {
		this.map = new Map({
			container: element,
			center: [0, 0],
			zoom: 2,
			projection: "mercator",
			// style: "mapbox://styles/mapbox/dark-v11",
			// style: "mapbox://styles/mapbox/standard",
			style: "mapbox://styles/mapbox/light-v11",
			maxPitch: 0,
		});

		this.map.doubleClickZoom.disable();
		this.setUpSubjects(subjects);
	}

	private setUpSubjects(subjects: SubjectContext) {
		subjects.$eventLock.subscribe((event) => {
			let newEvent: WheelEvent | MouseEvent | null = null;
			switch (event.type) {
				case "wheel":
					newEvent = new WheelEvent(event.type, event);
					break;
				default:
					newEvent = new MouseEvent(event.type, event);
			}
			if (this.allowMove) {
				const canvasElement = this.map.getCanvas();
				canvasElement.dispatchEvent(newEvent);
			}
		});

		subjects.$moveBackgroundPosition.subscribe((move) => {
			this.allowMove = move;
		});

		subjects.$getMapBackgroundPostion.subscribe((pos) => {
			const realWorldTopRight = this.map
				.unproject(pos.canvasPositions.topRight)
				?.toArray();

			const realWorldTopLeft = this.map
				.unproject(pos.canvasPositions.topLeft)
				?.toArray();

			const realWorldBottomLeft = this.map
				.unproject(pos.canvasPositions.bottomLeft)
				?.toArray();

			const realWorldBottomRight = this.map
				.unproject(pos.canvasPositions.bottomRight)
				?.toArray();

			const realWorldLocation: GeoReferenceCadResult = {
				originalCadPosition: {
					topLeft: pos.originalCadPosition.topLeft,
					topRight: pos.originalCadPosition.topRight,
					bottomRight: pos.originalCadPosition.bottomRight,
					bottomLeft: pos.originalCadPosition.bottomLeft,
				},
				realWorldPosition: {
					topLeft: roundCoordinate(realWorldTopLeft),
					topRight: roundCoordinate(realWorldTopRight),
					bottomRight: roundCoordinate(realWorldBottomRight),
					bottomLeft: roundCoordinate(realWorldBottomLeft),
				},
			};
			subjects.$getGeoReferenceValue.next(realWorldLocation);
		});

		subjects.$searchLocationClicked.subscribe((bounds) => {
			this.map.fitBounds(bounds, { duration: 2000, animate: true });
		});

		subjects.$geoReferencedGeoJSONUpload.subscribe(async (geoJSONFile) => {
			const geojson = await parseFileToJSON<FeatureCollection>(geoJSONFile);
			this.map.addSource(this.sourceId, { type: "geojson", data: geojson });

			if (!this.map.getStyle()?.layers.some((l) => l.source === this.sourceId)) {
				this.map.addLayer(this.lineLayer);
			}

			if (this.fitToBounds) {
				const [one, two, three, four] = bbox(geojson);
				this.map?.fitBounds([one, two, three, four], { duration: 0 });
			}
		});

		subjects.$geoReferencedStyleUpload.subscribe(async (styleFile) => {
			const styleSpec = await parseFileToJSON<StyleSpecification>(styleFile)

			// biome-ignore lint/complexity/noForEach: <explanation>
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

			// biome-ignore lint/complexity/noForEach: <explanation>
			this.map?.getStyle()?.layers.forEach((layer) => {
				if (layer.source === this.sourceId) {
					this.map?.removeLayer(layer.id);
				}
			});

			// biome-ignore lint/complexity/noForEach: <explanation>
			styleSpec.layers.forEach((layer) => {
				this.map?.addLayer(layer);
			});
		});

		subjects.$cadGeoJSONUpload.subscribe(async () => {
			this.fitToBounds = false;
		});
	}
}

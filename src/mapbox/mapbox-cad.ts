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
	transformNonValidGeoJSONToValid,
} from "../geo-helpers/feature-collection";
import { parseFileToJSON } from "../file-helpers/file-to-json";
import type { Subject } from "rxjs";

mapboxgl.accessToken =
	"pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export class MapboxCad {
	private map: Map | null = null;

	private sourceId = "cad-source";

	private originalCadScaleFactor: { latFactor: number; longFactor: number } = {
		latFactor: 0,
		longFactor: 0,
	};

	private lineLayer: LineLayerSpecification = {
		id: "line-layer",
		type: "line",
		paint: {
			"line-color": "red",
			"line-width": 5,
		},
		source: this.sourceId,
		filter: ["==", ["geometry-type"], "LineString"],
	};

	private $eventLock: Subject<MouseEvent> | null = null;

	private lockCadPosition = false;

	constructor(element: HTMLDivElement, cadGeojson: File, cadStyle: File | null, subjects: Subjects) {
		this.createMap(element, cadGeojson, cadStyle);
		this.setUpSubjects(subjects);
	}

	private async createMap(element: HTMLDivElement, geoJSONFile: File, cadStyleFile: File | null) {
		const { featureCollection: transformedFeatureCollection, scaleFactor } =
			await transformNonValidGeoJSONToValid(geoJSONFile);


		const [one, two, three, four] = bbox(transformedFeatureCollection);

		this.map = new mapboxgl.Map({
			container: element,
			center: [0, 0],
			zoom: 1,
			projection: "mercator",
			maxPitch: 0,
			style: { layers: [], sources: {}, version: 8 },
			maxZoom: 24,
		});

		const canvasElement = this.map.getCanvas();

		canvasElement.addEventListener("mousedown", (event) => {
			if (this.lockCadPosition) {
				this.$eventLock?.next(event);
			}
		});

		canvasElement.addEventListener("mouseup", (event) => {
			if (this.lockCadPosition) {
				this.$eventLock?.next(event);
			}
		});

		canvasElement.addEventListener("mousemove", (event) => {
			if (this.lockCadPosition) {
				this.$eventLock?.next(event);
			}
		});

		canvasElement.addEventListener("wheel", (event) => {
			if (this.lockCadPosition) {
				this.$eventLock?.next(event);
			}
		});

		this.map.doubleClickZoom.disable();

		const styleSpec = cadStyleFile ? await parseFileToJSON<StyleSpecification>(cadStyleFile) : null;

		this.map.once("idle", () => {
			this.addSource(transformedFeatureCollection);
			this.addLayers(styleSpec ? styleSpec.layers : []);
			this.map?.fitBounds([one, two, three, four], { duration: 0 });
		});
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
			})
		} else {
			this.map?.addLayer(this.lineLayer);
		}
	}

	private setUpSubjects(subjects: Subjects) {
		subjects.$rotation.subscribe((rotation) => {
			this.map?.setBearing(rotation);
		});

		subjects.$lockCadPosition.subscribe((lock) => {
			this.lockCadPosition = lock;
		});

		subjects.$geoReferenceCad.subscribe(() => {
			// Todo: add georeferences
		});

		this.$eventLock = subjects.$eventLock;
	}
}

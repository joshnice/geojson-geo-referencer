// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import mapboxgl, { Map, type StyleSpecification } from "mapbox-gl";
import type { FeatureCollection } from "geojson";
import { parseFileToJSON } from "../file-helpers/file-to-json";

mapboxgl.accessToken =
	"pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export class MapboxGeoJsonViewer {
	private readonly map: Map;

    private readonly sourceId = "geojson-src";

	constructor(element: HTMLDivElement, geoJSONFile: File, styleFile: File) {
		this.map = new Map({
			container: element,
			center: [0, 0],
			zoom: 2,
			projection: "mercator",
			style: "mapbox://styles/mapbox/standard",
			maxPitch: 0,
		});

        this.map.once("idle", async () => {
            const geojson = await parseFileToJSON<FeatureCollection>(geoJSONFile);
            const style = await parseFileToJSON<StyleSpecification>(styleFile);
            this.map.addSource(this.sourceId, { type: "geojson", data: geojson });
            // biome-ignore lint/complexity/noForEach: <explanation>
            style.layers.forEach((l) => {
                l.source = this.sourceId;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete l["source-layer"];
				this.map?.addLayer(l);
            });
        })


	}
}

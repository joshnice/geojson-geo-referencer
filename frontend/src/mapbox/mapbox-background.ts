import mapboxgl, { Map } from "mapbox-gl";
import { Subjects } from "./types";

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg';

const latFactor = 0.14761747623608987;
const longFactor = 0.1089453888215829;

export class MapboxBackground {

    private readonly map: Map;

    constructor(element: HTMLDivElement, subjects: Subjects) {

        this.map = new mapboxgl.Map({
            container: element,
            center: [0, 0],
            zoom: 2,
            projection: "mercator",
            maxPitch: 0,
        });

        this.map.doubleClickZoom.disable();
        this.setUpSubjects(subjects);
    }

    private setUpSubjects(subjects: Subjects) {
        subjects.$zoom.subscribe((val) => {
            if (val === "in") {
                this.map.zoomIn();
            }

            if (val === "out") {
                this.map.zoomOut();
            }
        });

        subjects.$click.subscribe(({ canvas, lngLat }) => {
            const unproject = this.map.unproject(canvas);
            const cadCoordLong = lngLat[0] / longFactor;
            const cadCoordLat = lngLat[1] / latFactor;

            console.log("CAD Long", cadCoordLong, "Geo Long", unproject.lng);
            console.log("CAD Lat", cadCoordLat, "Geo Lat", unproject.lat);


        });
    }

}
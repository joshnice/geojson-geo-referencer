// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import mapboxgl, { Map } from "mapbox-gl";
import type { Subjects } from "./types";

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg';

export class MapboxBackground {

    private readonly map: Map;

    constructor(element: HTMLDivElement, subjects: Subjects) {

        this.map = new Map({
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
    }
}
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import mapboxgl, { Map } from "mapbox-gl";
import type { GeoReferenceCadResult, Subjects } from "./types";
import { roundCoordinate } from "../geo-helpers/coordinate-helpers";

mapboxgl.accessToken =
	"pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export class MapboxBackground {
	private readonly map: Map;

	private allowMove = false;

	constructor(element: HTMLDivElement, subjects: Subjects) {
		this.map = new Map({
			container: element,
			center: [0, 0],
			zoom: 2,
			projection: "mercator",
			// style: "mapbox://styles/mapbox/dark-v11",
			style: "mapbox://styles/mapbox/standard",
			maxPitch: 0,
		});

		this.map.doubleClickZoom.disable();
		this.setUpSubjects(subjects);
	}

	private setUpSubjects(subjects: Subjects) {
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

		subjects.$moveBackground.subscribe((move) => {
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
			subjects.$getCadRealWorldLocation.next(realWorldLocation);
		});

		subjects.$searchLocationClicked.subscribe((bounds) => {
			console.log("bounds", bounds);
			this.map.fitBounds(bounds, { duration: 2000, animate: true });
		});
	}
}

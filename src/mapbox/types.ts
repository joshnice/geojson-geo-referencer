import type { Subject } from "rxjs";

export interface Subjects {
	$rotation: Subject<number>;
	$geoReferenceCad: Subject<void>;
	$eventLock: Subject<MouseEvent>;
	$moveBackground: Subject<boolean>;
	$moveCad: Subject<boolean>;
	$getMapBackgroundPostion: Subject<GetMapBackgroundPosition>;
	$getCadRealWorldLocation: Subject<GeoReferenceCadResult>;
}

export type GetMapBackgroundPosition = {
	canvasPositions: Corners;
	orignalCadPosition: Corners;
}

export type GeoReferenceCadResult = {
	orignalCadPosition: Corners;
	realWorldPosition: Corners;
}

export type Corners = {
	topLeft: [number, number],
	topRight: [number, number],
	bottomRight: [number, number],
	bottomLeft: [number, number],
}

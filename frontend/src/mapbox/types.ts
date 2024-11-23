import type { Subject } from "rxjs";

export interface Subjects {
	$rotation: Subject<number>;
	$geoReferenceCad: Subject<void>;
	$eventLock: Subject<MouseEvent>;
	$moveBackground: Subject<boolean>;
	$moveCad: Subject<boolean>;
	$getMapBackgroundPostion: Subject<GetMapBackgroundPosition>;
	$getCadRealWorldLocation: Subject<GeoReferenceCadResult>;
	$searchLocationClicked: Subject<[number, number, number, number]>;
}

export type GetMapBackgroundPosition = {
	canvasPositions: Corners;
	originalCadPosition: Corners;
};

export type GeoReferenceCadResult = {
	originalCadPosition: Corners;
	realWorldPosition: Corners;
};

export type Corners = {
	topLeft: [number, number];
	topRight: [number, number];
	bottomRight: [number, number];
	bottomLeft: [number, number];
};

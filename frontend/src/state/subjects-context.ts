import { createContext, useContext } from "react";
import { Subject } from "rxjs";
import type { GeoReferenceCadResult, GetMapBackgroundPosition } from "../mapbox/types";
import type { MapBackground } from "../types/map-background";
import type { Units } from "../types/units";

export interface SubjectContext {
	$rotation: Subject<number>;
	$zoom: Subject<{ source: "toolbar" | "map"; value: number }>;
	$geoReferenceCad: Subject<void>;
	$eventLock: Subject<MouseEvent>;
	$moveCadPosition: Subject<boolean>;
	$moveBackgroundPosition: Subject<boolean>;
	$getMapBackgroundPostion: Subject<GetMapBackgroundPosition>;
	$getGeoReferenceValue: Subject<GeoReferenceCadResult>;
	$searchLocationClicked: Subject<[number, number, number, number]>;
	$selectedBackground: Subject<MapBackground>;
	// Upload cad subjects
	$cadGeoJSONUpload: Subject<{ file: File; units: Units }>;
	$cadStyleUpload: Subject<File>;
	$cadUploadFinished: Subject<number>;
	// Upload standard geojson subjects
	$geoReferencedGeoJSONUpload: Subject<File>;
	$geoReferencedStyleUpload: Subject<File>;
	// Background map events
	$backgroundMapCenter: Subject<[number, number]>;
}

export const initialSubjectContext: SubjectContext = {
	$zoom: new Subject<{ source: "toolbar" | "map"; value: number }>(),
	$rotation: new Subject<number>(),
	$geoReferenceCad: new Subject<void>(),
	$eventLock: new Subject<MouseEvent>(),
	$moveCadPosition: new Subject<boolean>(),
	$moveBackgroundPosition: new Subject<boolean>(),
	$getMapBackgroundPostion: new Subject<GetMapBackgroundPosition>(),
	$getGeoReferenceValue: new Subject<GeoReferenceCadResult>(),
	$searchLocationClicked: new Subject<[number, number, number, number]>(),
	$cadGeoJSONUpload: new Subject<{ file: File; units: Units }>(),
	$cadStyleUpload: new Subject<File>(),
	$cadUploadFinished: new Subject<number>(),
	$geoReferencedGeoJSONUpload: new Subject<File>(),
	$geoReferencedStyleUpload: new Subject<File>(),
	$selectedBackground: new Subject<MapBackground>(),
	$backgroundMapCenter: new Subject<[number, number]>(),
};

export const SubjectsContext = createContext<SubjectContext>(initialSubjectContext);

export function useSubjectContext() {
	return useContext(SubjectsContext);
}

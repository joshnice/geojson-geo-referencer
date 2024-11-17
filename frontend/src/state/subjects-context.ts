import { createContext, useContext } from "react";
import { Subject } from "rxjs";
import type { GeoReferenceCadResult, GetMapBackgroundPosition } from "../mapbox/types";
import type { MapBackground } from "../types/map-background";

export interface SubjectContext {
    $rotation: Subject<number>;
    $zoom: Subject<number>;
    $geoReferenceCad: Subject<void>;
    $eventLock: Subject<MouseEvent>;
    $moveCadPosition: Subject<boolean>;
    $moveBackgroundPosition: Subject<boolean>;
    $getMapBackgroundPostion: Subject<GetMapBackgroundPosition>;
    $getGeoReferenceValue: Subject<GeoReferenceCadResult>;
    $searchLocationClicked: Subject<[number, number, number, number]>;
    $selectedBackground: Subject<MapBackground>;
    // Upload cad subjects
    $cadGeoJSONUpload: Subject<{ file: File, unit: string }>;
    $cadStyleUpload: Subject<File>;
    $cadUploadFinished: Subject<number>;
    // Upload standard geojson subjects
    $geoReferencedGeoJSONUpload: Subject<File>;
    $geoReferencedStyleUpload: Subject<File>;
}

export const initialSubjectContext: SubjectContext = {
    $zoom: new Subject<number>(),
    $rotation: new Subject<number>(),
    $geoReferenceCad: new Subject<void>(),
    $eventLock: new Subject<MouseEvent>(),
    $moveCadPosition: new Subject<boolean>(),
    $moveBackgroundPosition: new Subject<boolean>(),
    $getMapBackgroundPostion: new Subject<GetMapBackgroundPosition>(),
    $getGeoReferenceValue: new Subject<GeoReferenceCadResult>(),
    $searchLocationClicked: new Subject<[number, number, number, number]>(),
    $cadGeoJSONUpload: new Subject<{ file: File, unit: string }>(),
    $cadStyleUpload: new Subject<File>(),
    $cadUploadFinished: new Subject<number>,
    $geoReferencedGeoJSONUpload: new Subject<File>(),
    $geoReferencedStyleUpload: new Subject<File>(),
    $selectedBackground: new Subject<MapBackground>(),
}

export const SubjectsContext = createContext<SubjectContext>(initialSubjectContext);

export function useSubjectContext() {
    return useContext(SubjectsContext);
}
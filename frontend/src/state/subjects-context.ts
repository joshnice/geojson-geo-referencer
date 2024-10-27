import { createContext, useContext } from "react";
import { Subject } from "rxjs";
import type { GeoReferenceCadResult, GetMapBackgroundPosition } from "../mapbox/types";

export interface SubjectContext {
    $rotation: Subject<number>;
    $geoReferenceCad: Subject<void>;
    $eventLock: Subject<MouseEvent>;
    $moveCadPosition: Subject<boolean>;
    $moveBackgroundPosition: Subject<boolean>;
    $getMapBackgroundPostion: Subject<GetMapBackgroundPosition>;
    $getGeoReferenceValue: Subject<GeoReferenceCadResult>;
    $searchLocationClicked: Subject<[number, number, number, number]>;
    // Upload cad subjects
    $cadGeoJSONUpload: Subject<File>;
    $cadStyleUpload: Subject<File>;
    // Upload standard geojson subjects
    $geoReferencedGeoJSONUpload: Subject<File>;
    $geoReferencedStyleUpload: Subject<File>;
}

export const initialSubjectContext: SubjectContext = {
    $rotation: new Subject<number>(),
    $geoReferenceCad: new Subject<void>(),
    $eventLock: new Subject<MouseEvent>(),
    $moveCadPosition: new Subject<boolean>(),
    $moveBackgroundPosition: new Subject<boolean>(),
    $getMapBackgroundPostion: new Subject<GetMapBackgroundPosition>(),
    $getGeoReferenceValue: new Subject<GeoReferenceCadResult>(),
    $searchLocationClicked: new Subject<[number, number, number, number]>(),
    $cadGeoJSONUpload: new Subject<File>(),
    $cadStyleUpload: new Subject<File>(),
    $geoReferencedGeoJSONUpload: new Subject<File>(),
    $geoReferencedStyleUpload: new Subject<File>(),
}

export const SubjectsContext = createContext<SubjectContext>(initialSubjectContext);

export function useSubjectContext() {
    return useContext(SubjectsContext);
}
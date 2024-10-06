import { Subject } from "rxjs";

export interface Subjects {
    $moveCadToCenter: Subject<void>;
    $rotation: Subject<number>;
    $geoReferenceCad: Subject<void>;
}
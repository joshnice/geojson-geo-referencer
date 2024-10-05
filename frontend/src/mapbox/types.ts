import { Subject } from "rxjs";

export interface Subjects {
    $zoom: Subject<"in" | "out">;
    $click: Subject<{ lngLat: [number, number], canvas: [number, number] }>;
    $moveCadToCenter: Subject<void>;
    $rotation: Subject<number>;
}
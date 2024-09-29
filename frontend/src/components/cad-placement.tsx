import { BaseMapComponent } from "./background-map";
import { CadMapComponent } from "./cad-map";
import 'mapbox-gl/dist/mapbox-gl.css';
import "./cad-placement.css";
import { useRef, useState } from "react";
import { Subject } from "rxjs";

interface CadPlacementProps {
    file: File;
}

export function CadPlacementComponent({ file }: CadPlacementProps) {

    const [showCad, setShowCad] = useState(true);

    const $zoomRef = useRef(new Subject<"in" | "out">());
    const $clickRef = useRef(new Subject<{ lngLat: [number, number], canvas: [number, number] }>());

    return (
        <div>
            <div className="controls">
                <div>Show cad <input type="checkbox" checked={showCad} onChange={() => setShowCad(!showCad)} /></div>
                <div>
                    <button type="button" onClick={() => $zoomRef.current.next("in")}>Zoom in</button>
                    <button type="button" onClick={() => $zoomRef.current.next("out")}>Zoom out</button>
                </div>
            </div>
            <BaseMapComponent subjects={{ $zoom: $zoomRef.current, $click: $clickRef.current }} />
            <CadMapComponent subjects={{ $zoom: $zoomRef.current, $click: $clickRef.current }} file={file} showCad={showCad} />
        </div>
    )
}
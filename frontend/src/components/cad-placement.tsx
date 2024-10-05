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
    const [rotation, setRotation] = useState(0);


    const $zoomRef = useRef(new Subject<"in" | "out">());
    const $moveCadCenter = useRef(new Subject<void>());
    const $clickRef = useRef(new Subject<{ lngLat: [number, number], canvas: [number, number] }>());
    const $rotationRef = useRef(new Subject<number>());

    const handleRotationChange = (valStr: string) => {
        const valNumber = Number.parseFloat(valStr);
        $rotationRef.current.next(valNumber);
        setRotation(valNumber);
    }

    return (
        <div>
            <div className="controls">
                <div>Show cad <input type="checkbox" checked={showCad} onChange={() => setShowCad(!showCad)} /></div>
                <div>
                    <button type="button" onClick={() => $zoomRef.current.next("in")}>Zoom in</button>
                    <button type="button" onClick={() => $zoomRef.current.next("out")}>Zoom out</button>
                    <button type="button" onClick={() => $moveCadCenter.current.next()}>Move cad to center</button>
                </div>
                <div>Rotation <input type="number" value={rotation} onChange={(event) => handleRotationChange(event.target.value)} /></div>
            </div>
            <CadMapComponent subjects={{ $zoom: $zoomRef.current, $click: $clickRef.current, $moveCadToCenter: $moveCadCenter.current, $rotation: $rotationRef.current }} file={file} showCad={showCad} />
        </div>
    )
}
import { CadMapComponent } from "./cad-map";
import 'mapbox-gl/dist/mapbox-gl.css';
import "./cad-placement.css";
import { useRef, useState } from "react";
import { Subject } from "rxjs";

interface CadPlacementProps {
    file: File;
}

export function CadPlacementComponent({ file }: CadPlacementProps) {

    const [rotation, setRotation] = useState(0);

    const $moveCadCenter = useRef(new Subject<void>());
    const $rotationRef = useRef(new Subject<number>());
    const $geoReferenceCad = useRef(new Subject<void>());

    const handleRotationChange = (valStr: string) => {
        const valNumber = Number.parseFloat(valStr);
        $rotationRef.current.next(valNumber);
        setRotation(valNumber);
    }

    return (
        <div>
            <div className="controls">
                <button type="button" onClick={() => $moveCadCenter.current.next()}>Move cad to center</button>
                <div>Rotation <input type="number" value={rotation} onChange={(event) => handleRotationChange(event.target.value)} /></div>
                <button type="button" onClick={() => $geoReferenceCad.current.next()}>GeoRef CAD</button>
            </div>
            <CadMapComponent subjects={{ $moveCadToCenter: $moveCadCenter.current, $rotation: $rotationRef.current, $geoReferenceCad: $geoReferenceCad.current }} file={file} />
        </div>
    )
}
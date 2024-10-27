import { useState } from "react";
import { useSubjectContext } from "../../state/subjects-context";

export function RotationCad() {

    const { $rotation } = useSubjectContext();

    const [rotation, setRotation] = useState(0);


    const handleRotationChange = (valStr: string) => {
        const valNumber = Number.parseFloat(valStr);
        if (!Number.isNaN(valNumber)) {
            const clampedNumber = valNumber > 360 ? 360 : valNumber
            $rotation.next(clampedNumber);
            setRotation(clampedNumber);
        }
    };

    return (
        <div className="control-option">
            <p className="control-label">Rotation </p>
            <input className="number-input" type="number" value={rotation} onChange={(event) => handleRotationChange(event.target.value)} />
        </div>
    )
}
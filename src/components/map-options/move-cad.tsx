import { useState } from "react";
import { useSubjectContext } from "../../state/subjects-context";

export function MoveCad() {
    const { $moveCadPosition } = useSubjectContext();

    const [moveCad, setMoveCad] = useState(false);

    const handleMoveCad = () => {
        const updatedValue = !moveCad;
        setMoveCad(updatedValue);
        $moveCadPosition.next(updatedValue);
    }

    return (
        <div className="control-option">
            <p className="control-label">Move Cad</p>
            <input type="checkbox" checked={moveCad} onChange={() => handleMoveCad()} />
        </div>
    )
}
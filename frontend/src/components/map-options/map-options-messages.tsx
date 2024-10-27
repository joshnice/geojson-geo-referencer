import { useState, useEffect } from "react";
import { useSubjectContext } from "../../state/subjects-context";
import { constructGeoReferenceString } from "../cad-placement/cad-placement-helpers";

export function MapOptionMessages() {
    const { $getGeoReferenceValue } = useSubjectContext();

    const [showMessage, setShowMessage] = useState("");

    useEffect(() => {
        const sub = $getGeoReferenceValue.subscribe((val) => {
            setShowMessage("Copied to clipboard!");
            navigator.clipboard.writeText(constructGeoReferenceString(val));
            setTimeout(() => {
                setShowMessage("");
            }, 5000)
        })
        return () => {
            sub.unsubscribe();
        }
    }, [$getGeoReferenceValue])

    if (!showMessage) {
        return <></>
    }

    return (
        <div className="control-option">
            {showMessage}
        </div>
    )
}
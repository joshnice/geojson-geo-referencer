import { MoveCad } from "./move-cad";
import { MoveBackground } from "./move-background";
import { RotationCad } from "./rotation-cad";
import { GeoReferenceCadButton } from "./geo-reference-cad-button";
import { MapOptionMessages } from "./map-options-messages";

export function MapOptions() {
    return (
        <div className="controls">
            <MoveCad />
            <MoveBackground />
            <RotationCad />
            <GeoReferenceCadButton />
            <MapOptionMessages />
        </div >
    )
}
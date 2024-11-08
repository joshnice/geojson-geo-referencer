import { MoveCad } from "./move-cad";
import { MoveBackground } from "./move-background";
import { RotationCad } from "./rotation-cad";
import { GeoReferenceCadButton } from "./geo-reference-cad-button";
import { MapOptionMessages } from "./map-options-messages";
import { MapZoomComponent } from "./map-zoom";

export function MapOptions() {
	return (
		<div className="controls">
			<MoveCad />
			<MoveBackground />
			<RotationCad />
			<MapZoomComponent />
			<GeoReferenceCadButton />
			<MapOptionMessages />
		</div>
	);
}

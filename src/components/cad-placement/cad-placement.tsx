import { useRef, useState } from "react";
import { Subject } from "rxjs";
import { MapboxBackground } from "../../mapbox/mapbox-background";
import { MapboxCad } from "../../mapbox/mapbox-cad";
import type { CadUploadOptions } from "../../types/cad-upload-types";
import "mapbox-gl/dist/mapbox-gl.css";
import "./cad-placement.css";

interface CadPlacementProps {
	options: CadUploadOptions;
}

export function CadPlacementComponent({ options }: CadPlacementProps) {
	const [rotation, setRotation] = useState(0);
	const [showCad, setShowCad] = useState(true);

	const $rotationRef = useRef(new Subject<number>());
	const $geoReferenceCad = useRef(new Subject<void>());

	const createdCadMap = useRef(false);
	const createdBackgroundMap = useRef(false);


	const handleRotationChange = (valStr: string) => {
		const valNumber = Number.parseFloat(valStr);
		$rotationRef.current.next(valNumber);
		setRotation(valNumber);
	};

	const onCadMapElementRender = (containerElement: HTMLDivElement) => {
		if (!createdCadMap.current) {
			createdCadMap.current = true;

			if (options.geojsonFile == null) {
				throw new Error();
			}

			new MapboxCad(containerElement, options.geojsonFile, options.styleFile, {
				$rotation: $rotationRef.current,
				$geoReferenceCad: $geoReferenceCad.current,
			});
		}
	};

	const onBackgroundMapElementRender = (containerElement: HTMLDivElement) => {
		if (!createdBackgroundMap.current) {
			createdBackgroundMap.current = true;
			new MapboxBackground(containerElement, {
				$rotation: $rotationRef.current,
				$geoReferenceCad: $geoReferenceCad.current,
			});
		}
	}

	return (
		<div>
			<div className="controls">
				<div className="control-option">
					Show Cad
					<input type="checkbox" checked={showCad} onChange={() => setShowCad(!showCad)} />
				</div>
			</div>
			<div className="map-element" style={{ zIndex: showCad ? 2 : 0 }} ref={onCadMapElementRender} />
			<div className="map-element" style={{ zIndex: showCad ? 0 : 2 }} ref={onBackgroundMapElementRender} />

		</div>
	);
}

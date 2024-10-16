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
	const [showCad, setShowCad] = useState(false);
	const [lockCadPosition, setLockCadPosition] = useState(false);

	const $rotationRef = useRef(new Subject<number>());
	const $geoReferenceCad = useRef(new Subject<void>());
	const $eventLock = useRef(new Subject<MouseEvent>());
	const $lockCadPosition = useRef(new Subject<boolean>())

	const createdCadMap = useRef(false);
	const createdBackgroundMap = useRef(false);


	const handleRotationChange = (valStr: string) => {
		const valNumber = Number.parseFloat(valStr);
		if (!Number.isNaN(valNumber)) {
			const clampedNumber = valNumber > 360 ? 360 : valNumber
			$rotationRef.current.next(clampedNumber);
			setRotation(clampedNumber);
		}
	};

	const handleLockCad = () => {
		const updatedValue = !lockCadPosition;
		setLockCadPosition(updatedValue);
		$lockCadPosition.current.next(updatedValue);
	}

	const onCadMapElementRender = (containerElement: HTMLDivElement) => {
		if (!createdCadMap.current) {
			createdCadMap.current = true;

			if (options.geojsonFile == null) {
				throw new Error();
			}

			new MapboxCad(containerElement, options.geojsonFile, options.styleFile, {
				$rotation: $rotationRef.current,
				$geoReferenceCad: $geoReferenceCad.current,
				$eventLock: $eventLock.current,
				$lockCadPosition: $lockCadPosition.current
			});
		}
	};

	const onBackgroundMapElementRender = (containerElement: HTMLDivElement) => {
		if (!createdBackgroundMap.current) {
			createdBackgroundMap.current = true;
			new MapboxBackground(containerElement, {
				$rotation: $rotationRef.current,
				$geoReferenceCad: $geoReferenceCad.current,
				$eventLock: $eventLock.current,
				$lockCadPosition: $lockCadPosition.current
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
				<div className="control-option">
					Lock Cad
					<input type="checkbox" checked={lockCadPosition} onChange={() => handleLockCad()} />
				</div>
				<div className="control-option">
					Rotation
					<input className="number-input" type="number" value={rotation} onChange={(event) => handleRotationChange(event.target.value)} />
				</div>
			</div>
			<div className="map-element" style={{ zIndex: showCad ? 2 : 0 }} ref={onCadMapElementRender} />
			<div className="map-element" style={{ zIndex: showCad ? 0 : 2 }} ref={onBackgroundMapElementRender} />

		</div>
	);
}

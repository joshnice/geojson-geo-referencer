import { useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { MapboxBackground } from "../../mapbox/mapbox-background";
import { MapboxCad } from "../../mapbox/mapbox-cad";
import type { CadUploadOptions } from "../../types/cad-upload-types";
import type { GeoReferenceCadResult, GetMapBackgroundPosition } from "../../mapbox/types";
import "mapbox-gl/dist/mapbox-gl.css";
import "./cad-placement.css";
import { constructGeoReferenceString } from "./cad-placement-helpers";
import { MapSearch } from "../map-search/map-search";

interface CadPlacementProps {
	options: CadUploadOptions;
}

export function CadPlacementComponent({ options }: CadPlacementProps) {
	const [rotation, setRotation] = useState(0);
	const [moveCad, setMoveCad] = useState(false);
	const [moveBackground, setMoveBackground] = useState(false);
	const [showMessage, setShowMessage] = useState("");

	const $rotationRef = useRef(new Subject<number>());
	const $geoReferenceCad = useRef(new Subject<void>());
	const $eventLock = useRef(new Subject<MouseEvent>());
	const $moveCadPosition = useRef(new Subject<boolean>());
	const $moveBackgroundPosition = useRef(new Subject<boolean>());
	const $getMapBackgroundPostion = useRef(new Subject<GetMapBackgroundPosition>());
	const $getGeoReferenceValue = useRef(new Subject<GeoReferenceCadResult>());
	const $searchLocationClicked = useRef(new Subject<[number, number, number, number]>());

	const createdCadMap = useRef(false);
	const createdBackgroundMap = useRef(false);

	useEffect(() => {
		const sub = $getGeoReferenceValue.current.subscribe((val) => {
			setShowMessage("Copied to clipboard!");
			navigator.clipboard.writeText(constructGeoReferenceString(val));
			setTimeout(() => {
				setShowMessage("");
			}, 5000)
		})
		return () => {
			sub.unsubscribe();
		}
	}, [])


	const handleRotationChange = (valStr: string) => {
		const valNumber = Number.parseFloat(valStr);
		if (!Number.isNaN(valNumber)) {
			const clampedNumber = valNumber > 360 ? 360 : valNumber
			$rotationRef.current.next(clampedNumber);
			setRotation(clampedNumber);
		}
	};

	const handleMoveBackground = () => {
		const updatedValue = !moveBackground;
		setMoveBackground(updatedValue);
		$moveBackgroundPosition.current.next(updatedValue);
	}

	const handleMoveCad = () => {
		const updatedValue = !moveCad;
		setMoveCad(updatedValue);
		$moveCadPosition.current.next(updatedValue);
	}

	const handleGeoReferenceCad = () => {
		$geoReferenceCad.current.next();
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
				$moveBackground: $moveBackgroundPosition.current,
				$moveCad: $moveCadPosition.current,
				$getMapBackgroundPostion: $getMapBackgroundPostion.current,
				$getCadRealWorldLocation: $getGeoReferenceValue.current,
				$searchLocationClicked: $searchLocationClicked.current

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
				$moveBackground: $moveBackgroundPosition.current,
				$moveCad: $moveCadPosition.current,
				$getMapBackgroundPostion: $getMapBackgroundPostion.current,
				$getCadRealWorldLocation: $getGeoReferenceValue.current,
				$searchLocationClicked: $searchLocationClicked.current
			});
		}
	}

	return (
		<div>
			<div className="controls">
				<div className="control-option">
					<p className="control-label">Move Cad</p>
					<input type="checkbox" checked={moveCad} onChange={() => handleMoveCad()} />
				</div>
				<div className="control-option">
					<p className="control-label">Move Background</p>
					<input type="checkbox" checked={moveBackground} onChange={() => handleMoveBackground()} />
				</div>
				<div className="control-option">
					Rotation
					<input className="number-input" type="number" value={rotation} onChange={(event) => handleRotationChange(event.target.value)} />
				</div>
				<div>
					<button type="button" onClick={handleGeoReferenceCad}>GeoReference Cad</button>
				</div>
				{showMessage &&
					<div className="control-option">
						{showMessage}
					</div>
				}
			</div>
			<MapSearch $locationClicked={$searchLocationClicked.current} />
			<div className="map-element" style={{ zIndex: 2 }} ref={onCadMapElementRender} />
			<div className="map-element" style={{ zIndex: 1 }} ref={onBackgroundMapElementRender} />
		</div>
	);
}

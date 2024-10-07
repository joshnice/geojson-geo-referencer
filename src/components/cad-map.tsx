import { useRef } from "react";
import { MapboxCad } from "../mapbox/mapbox-cad";
import { Subjects } from "../mapbox/types";
import { CadUploadOptions } from "../types/cad-upload-types";

interface CadMapProps {
	cadUploadOptions: CadUploadOptions;
	subjects: Subjects;
}

export function CadMapComponent({ cadUploadOptions, subjects }: CadMapProps) {
	const createdMap = useRef(false);

	const onMapElementRender = (containerElement: HTMLDivElement) => {
		if (!createdMap.current) {
			createdMap.current = true;

			if (cadUploadOptions.geojsonFile == null || cadUploadOptions.width == null) {
				throw new Error();
			}

			new MapboxCad(containerElement, cadUploadOptions.geojsonFile, cadUploadOptions.styleFile, cadUploadOptions.width, subjects);
		}
	};

	return <div className="map-element" ref={onMapElementRender} />;
}

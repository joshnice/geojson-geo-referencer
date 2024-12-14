import { useRef } from "react";
import { get } from "../../api/api";
import { MapboxBackground } from "../../mapbox/mapbox-background";
import { MapboxCad } from "../../mapbox/mapbox-cad";
import { useSubjectContext } from "../../state/subjects-context";
import { BackgroundSelectorComponent } from "../background-selector/background-selector";
import { LayerListComponent } from "../layer-filtering/filtered-layer-list";
import { MapOptions } from "../map-options/map-options";
import { MapSearch } from "../map-search/map-search";
import { UploadComponent } from "../upload-options/upload-options";
import "mapbox-gl/dist/mapbox-gl.css";
import "./cad-placement.css";

export function CadPlacementComponent() {
	const subjects = useSubjectContext();

	const createdCadMap = useRef(false);
	const createdBackgroundMap = useRef(false);

	const onCadMapElementRender = (containerElement: HTMLDivElement) => {
		if (!createdCadMap.current) {
			createdCadMap.current = true;
			new MapboxCad(containerElement, subjects);
		}
	};

	const onBackgroundMapElementRender = async (containerElement: HTMLDivElement) => {
		if (!createdBackgroundMap.current) {
			createdBackgroundMap.current = true;
			const { googleMapsApiKey, googleMapsSessionKey, osMapsApiKey } = await get<{
				googleMapsApiKey: string;
				googleMapsSessionKey: string;
				osMapsApiKey: string;
			}>();
			new MapboxBackground(containerElement, { googleMapsApiKey, googleMapsSessionKey, osMapsApiKey }, subjects);
		}
	};

	return (
		<div>
			<MapOptions />
			<MapSearch />
			<UploadComponent />
			<BackgroundSelectorComponent />
			<LayerListComponent />
			<div className="map-element" style={{ zIndex: 2 }} ref={onCadMapElementRender} />
			<div className="map-element" style={{ zIndex: 1 }} ref={onBackgroundMapElementRender} />
		</div>
	);
}

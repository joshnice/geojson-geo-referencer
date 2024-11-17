import { useRef } from "react";
import { MapboxBackground } from "../../mapbox/mapbox-background";
import { MapboxCad } from "../../mapbox/mapbox-cad";
import { MapSearch } from "../map-search/map-search";
import { useSubjectContext } from "../../state/subjects-context";
import { MapOptions } from "../map-options/map-options";
import { UploadComponent } from "../upload-options/upload-options";
import "mapbox-gl/dist/mapbox-gl.css";
import "./cad-placement.css";
import { BackgroundSelectorComponent } from "../background-selector/background-selector";
import { get } from "../../api/api";

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

	const onBackgroundMapElementRender = async (
		containerElement: HTMLDivElement,
	) => {
		if (!createdBackgroundMap.current) {
			createdBackgroundMap.current = true;
			const { apiKey, session: sessionToken } = await get<{
				session: string;
				apiKey: string;
			}>("");
			new MapboxBackground(
				containerElement,
				{ apiKey, sessionToken },
				subjects,
			);
		}
	};

	return (
		<div>
			<MapOptions />
			<MapSearch />
			<UploadComponent />
			<BackgroundSelectorComponent />
			<div
				className="map-element"
				style={{ zIndex: 2 }}
				ref={onCadMapElementRender}
			/>
			<div
				className="map-element"
				style={{ zIndex: 1 }}
				ref={onBackgroundMapElementRender}
			/>
		</div>
	);
}

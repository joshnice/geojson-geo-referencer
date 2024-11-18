import { type ChangeEvent, useState } from "react";
import type { MapBackground } from "../../types/map-background";
import { useSubjectContext } from "../../state/subjects-context";
import "./background-selector.css";

export function BackgroundSelectorComponent() {
	const { $selectedBackground } = useSubjectContext();

	const [background, setBackground] =
		useState<MapBackground>("mapbox-standard");

	const handleBackgroundChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value as MapBackground;
		setBackground(value);
		$selectedBackground.next(value);
	};

	return (
		<select
			value={background}
			onChange={handleBackgroundChange}
			className="background-selector"
		>
			<option value="mapbox-standard">Mapbox Standard</option>
			<option value="mapbox-light">Mapbox Light</option>
			<option value="mapbox-dark">Mapbox Dark</option>
			<option value="google-map-sat">Google Maps Satellite</option>
			<option value="ordinance-survey">Ordinance Survey (UK Only)</option>
		</select>
	);
}

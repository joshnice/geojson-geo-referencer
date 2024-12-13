import { type ChangeEvent, useEffect, useState } from "react";
import { useSubjectContext } from "../../state/subjects-context";

export function MapZoomComponent() {
	const [value, setValue] = useState(0);

	const { $cadUploadFinished, $zoom } = useSubjectContext();

	const handleSetZoomLevel = (event: ChangeEvent<HTMLInputElement>) => {
		const updatedValue = Number.parseFloat(Number.parseFloat(event.target.value).toFixed(2));
		setValue(updatedValue);
		$zoom.next({ source: "toolbar", value: updatedValue });
	};

	useEffect(() => {
		const sub = $cadUploadFinished.subscribe((value) => {
			setValue(Number.parseFloat(value.toFixed(2)));
		});

		return () => {
			sub.unsubscribe();
		};
	});

	return (
		<div className="control-option">
			<p className="control-label">Map Zoom</p>
			<input type="number" className="zoom-input" value={value} onChange={handleSetZoomLevel} step={0.01} />
			<input type="range" value={value} onChange={handleSetZoomLevel} max={24} min={15} step={0.01} />
		</div>
	);
}

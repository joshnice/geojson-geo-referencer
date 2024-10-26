import type { ChangeEvent } from "react";
import "./upload-options.css";
import { useSubjectContext } from "../../state/subjects-context";

export function UploadComponent() {
	const { $cadGeoJSONUpload, $cadStyleUpload } = useSubjectContext();

	const handleCadGeoJSONUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.item(0);
		if (file != null) {
			$cadGeoJSONUpload.next(file);
		}
	};

	const handleCadGeoStyleUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.item(0);
		if (file != null) {
			$cadStyleUpload.next(file);
		}
	};

	return (
		<div className="upload-options">
			<div className="geojson-option">
				<p>GeoJSON File</p>
				<input type="file" onChange={handleCadGeoJSONUpload} />
			</div>
			<div className="geojson-option">
				<p>Style File </p>
				<input type="file" onChange={handleCadGeoStyleUpload} />
			</div>
		</div>
	);
}





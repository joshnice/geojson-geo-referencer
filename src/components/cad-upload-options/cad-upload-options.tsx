import { type ChangeEvent, useReducer } from "react";
import { initialState, reducer } from "./cad-upload-state";
import type { CadUploadOptions } from "../../types/cad-upload-types";
import "./cad-upload-options.css";

interface FileUploadProps {
	onConfirmClicked: (options: CadUploadOptions) => void;
}

export function CadUploadComponent({ onConfirmClicked }: FileUploadProps) {
	const [state, dispatch] = useReducer(reducer, initialState);

	const handleCadGeoJSONUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.item(0);
		if (file) {
			dispatch({ payload: file, type: "geojson" });
		}
	};

	const handleCadGeoStyleUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.item(0);
		if (file) {
			dispatch({ payload: file, type: "style" });
		}
	};

	return (
		<div className="geojson-options">
			<div className="geojson-option">
				<p>GeoJSON File</p>
				<input type="file" onChange={handleCadGeoJSONUpload} />
			</div>
			<div className="geojson-option">
				<p>Style File </p>
				<input type="file" onChange={handleCadGeoStyleUpload} />
			</div>
			<button type="button" onClick={() => onConfirmClicked(state)}>Confirm</button>
		</div>
	);
}





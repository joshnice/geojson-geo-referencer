import { type ChangeEvent, useReducer } from "react";
import { initialState, reducer } from "./cad-upload-state";
import type { CadUploadOptions } from "../../types/cad-upload-types";

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
			<div>
				Cad geoJSON <input type="file" onChange={handleCadGeoJSONUpload} />
			</div>
			<div>
				Cad style <input type="file" onChange={handleCadGeoStyleUpload} />
			</div>
			<button type="button" onClick={() => onConfirmClicked(state)}>Start</button>
		</div>
	);
}





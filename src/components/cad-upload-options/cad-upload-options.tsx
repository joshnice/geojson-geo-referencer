import { ChangeEvent, useReducer } from "react";
import { initialState, reducer } from "./cad-upload-state";
import { CadUploadOptions } from "../../types/cad-upload-types";

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

	const handleWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		const width = Number(event.target.value);
		if (!Number.isNaN(width)) {
			dispatch({ payload: width, type: "width" });
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
			<div>
				Width of CAD (meters)
				<input type="number" onChange={handleWidthChange} />
			</div>
			<button onClick={() => onConfirmClicked(state)}>Start</button>
		</div>
	);
}





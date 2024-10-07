import { ChangeEvent, useReducer } from "react";

interface FileUploadProps {
	onFileUpload: (file: CadUploadOptions) => void;
}

export function FileUploadComponent({ onFileUpload }: FileUploadProps) {
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
		<div>
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
			<button onClick={() => onFileUpload(state)}>Start</button>
		</div>
	);
}

type CadUploadOptions = {
	geojsonFile: File | null;
	styleFile: File | null;
	width: number;
};

type FileChangeAction = {
	type: "geojson" | "style";
	payload: File;
};

type WidthChangeAction = {
	type: "width";
	payload: number;
};

const initialState: CadUploadOptions = {
	geojsonFile: null,
	styleFile: null,
	width: 0,
};

function reducer(
	state: CadUploadOptions,
	action: FileChangeAction | WidthChangeAction,
): CadUploadOptions {
	switch (action.type) {
		case "geojson":
			return { ...state, geojsonFile: action.payload };
		case "style":
			return { ...state, styleFile: action.payload };
		case "width":
			return { ...state, width: action.payload };
		default:
			return state;
	}
}

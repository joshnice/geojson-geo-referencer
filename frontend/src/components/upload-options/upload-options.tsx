import { useState } from "react";
import { useSubjectContext } from "../../state/subjects-context";
import { FileUploadComponent } from "../file-upload";
import "./upload-options.css";

export function UploadComponent() {
	const {
		$cadGeoJSONUpload,
		$cadStyleUpload,
		$geoReferencedGeoJSONUpload,
		$geoReferencedStyleUpload,
	} = useSubjectContext();

	const [unit, setUnit] = useState("meters");

	const handleCadGeoJSONUpload = (file: File) => {
		$cadGeoJSONUpload.next({ file, unit });
	};

	const handleCadGeoStyleUpload = (file: File) => {
		$cadStyleUpload.next(file);
	};

	const handleGeoReferencedGeoJSONUpload = (file: File) => {
		$geoReferencedGeoJSONUpload.next(file);
	};

	const handleGeoReferencedGeoStyleUpload = (file: File) => {
		$geoReferencedStyleUpload.next(file);
	};

	return (
		<div className="upload-options">
			<h4>Non-GeoReferenced</h4>
			<div className="upload-option">
				<p className="upload-option-sub-heading">GeoJSON</p>
				<FileUploadComponent onFileUpload={handleCadGeoJSONUpload} />
			</div>
			<div className="upload-option">
				<select
					className="unit-selector"
					value={unit}
					onChange={(event) => setUnit(event.target.value)}
				>
					<option value="meters">meters</option>
					{/* <option value="kilometers">kilometers</option> */}
					{/* <option value="centimetres">centimetres</option> */}
					<option value="millimeters">millimeters</option>
					{/* <option value="inches">inches</option> */}
				</select>
			</div>
			<div className="upload-option">
				<p className="upload-option-sub-heading">Style</p>
				<FileUploadComponent onFileUpload={handleCadGeoStyleUpload} />
			</div>
			<h4>Georeferencd</h4>
			<div className="upload-option">
				<p className="upload-option-sub-heading">GeoJSON</p>
				<FileUploadComponent onFileUpload={handleGeoReferencedGeoJSONUpload} />
			</div>
			<div className="upload-option">
				<p className="upload-option-sub-heading">Style</p>
				<FileUploadComponent onFileUpload={handleGeoReferencedGeoStyleUpload} />
			</div>
		</div>
	);
}

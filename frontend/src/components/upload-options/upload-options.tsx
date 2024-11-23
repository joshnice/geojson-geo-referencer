import { useState } from "react";
import { useSubjectContext } from "../../state/subjects-context";
import { FileUploadComponent } from "../file-upload";
import type { Units } from "../../types/units";
import "./upload-options.css";

const UNITS: Units[] = ["meters", "kilometers", "centimetres", "millimeters", "inches"];

function isUnits(unit: string): unit is Units {
	return (UNITS as string[]).includes(unit);
}

export function UploadComponent() {
	const { $cadGeoJSONUpload, $cadStyleUpload, $geoReferencedGeoJSONUpload, $geoReferencedStyleUpload } = useSubjectContext();

	const [units, setUnits] = useState<Units>("meters");

	const handleCadGeoJSONUpload = (file: File) => {
		$cadGeoJSONUpload.next({ file, units });
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

	const handleUnitChange = (updatedUnits: string) => {
		if (isUnits(updatedUnits)) {
			setUnits(updatedUnits as Units);
			return;
		}
		throw new Error(`${updatedUnits} is not supported`);
	};

	return (
		<div className="upload-options">
			<h4>Non-GeoReferenced</h4>
			<div className="upload-option">
				<p className="upload-option-sub-heading">GeoJSON</p>
				<FileUploadComponent onFileUpload={handleCadGeoJSONUpload} />
			</div>
			<div className="upload-option">
				<select className="unit-selector" value={units} onChange={(event) => handleUnitChange(event.target.value)}>
					{UNITS.map((unit) => (
						<option key={unit} value={unit}>
							{unit}
						</option>
					))}
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

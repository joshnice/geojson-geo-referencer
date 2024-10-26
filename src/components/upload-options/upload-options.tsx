import { useSubjectContext } from "../../state/subjects-context";
import { FileUploadComponent } from "../file-upload";
import "./upload-options.css";

export function UploadComponent() {
	const { $cadGeoJSONUpload, $cadStyleUpload } = useSubjectContext();

	const handleCadGeoJSONUpload = (file: File) => {
		$cadGeoJSONUpload.next(file);
	};

	const handleCadGeoStyleUpload = (file: File) => {
		$cadStyleUpload.next(file);
	};

	return (
		<div className="upload-options">
			<h4>Non-GeoReferenced</h4>
			<div className="upload-option">
				<p>GeoJSON File</p>
				<FileUploadComponent onFileUpload={handleCadGeoJSONUpload} />
			</div>
			<div className="upload-option">
				<p>Style File </p>
				<FileUploadComponent onFileUpload={handleCadGeoStyleUpload} />
			</div>
			<h4>Georeferencd</h4>
			<div className="upload-option">
				<p>GeoJSON File</p>
				<FileUploadComponent onFileUpload={handleCadGeoStyleUpload} />
			</div>
			<div className="upload-option">
				<p>Style File </p>
				<FileUploadComponent onFileUpload={handleCadGeoStyleUpload} />
			</div>
		</div>
	);
}

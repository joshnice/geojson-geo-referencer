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

	const handleCadGeoJSONUpload = (file: File) => {
		$cadGeoJSONUpload.next(file);
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

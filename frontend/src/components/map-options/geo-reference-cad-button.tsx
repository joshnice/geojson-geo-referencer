import { useSubjectContext } from "../../state/subjects-context";

export function GeoReferenceCadButton() {
	const { $geoReferenceCad } = useSubjectContext();

	const handleGeoReferenceCad = () => {
		$geoReferenceCad.next();
	};

	return (
		<div className="control-option geo-ref-button">
			<button type="button" onClick={handleGeoReferenceCad}>
				GeoReference Cad
			</button>
		</div>
	);
}

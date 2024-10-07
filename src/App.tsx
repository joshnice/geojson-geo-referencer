import { useState } from "react";
import { CadPlacementComponent } from "./components/cad-placement";
import { CadUploadComponent } from "./components/cad-upload-options/cad-upload-options";
import { CadUploadOptions } from "./types/cad-upload-types";

function App() {
	const [options, setOptions] = useState<CadUploadOptions | null>(null);

	return (
		<div className="root">
			{options == null && <CadUploadComponent onConfirmClicked={setOptions} />}
			{options != null && <CadPlacementComponent options={options} />}
		</div>
	);
}

export default App;

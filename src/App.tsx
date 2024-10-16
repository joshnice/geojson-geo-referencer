import { useState } from "react";
import { CadUploadComponent } from "./components/cad-upload-options/cad-upload-options";
import type { CadUploadOptions } from "./types/cad-upload-types";
import { CadPlacementComponent } from "./components/cad-placement/cad-placement";

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

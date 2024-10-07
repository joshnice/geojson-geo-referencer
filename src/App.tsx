import { useState } from "react";
import { FileUploadComponent } from "./components/file-upload";
import { CadPlacementComponent } from "./components/cad-placement";

function App() {
	const [file, setFile] = useState<File | null>(null);

	return (
		<div className="root">
			{file == null && <FileUploadComponent onFileUpload={setFile} />}
			{file != null && <CadPlacementComponent file={file} />}
		</div>
	);
}

export default App;

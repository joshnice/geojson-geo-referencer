import { ChangeEvent } from "react";

interface FileUploadProps {
	onFileUpload: (file: File) => void;
}

export function FileUploadComponent({ onFileUpload }: FileUploadProps) {
	const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.item(0);
		if (file) {
			onFileUpload(file);
		}
	};

	return <input type="file" onChange={handleFileUpload} />;
}

import { useRef, type ChangeEvent } from "react";
import "./file-upload.css";

interface FileUploadProps {
	onFileUpload: (file: File) => void;
}

export function FileUploadComponent({ onFileUpload }: FileUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.item(0);
		if (file) {
			onFileUpload(file);
		}
	};

	const handleButtonClick = () => {
		if (inputRef.current) {
			inputRef.current.click();
		}
	};

	return (
		<>
			<button type="button" onClick={handleButtonClick}>
				Add file
			</button>
			<input
				className="file-input"
				ref={inputRef}
				type="file"
				onChange={handleFileUpload}
			/>
		</>
	);
}

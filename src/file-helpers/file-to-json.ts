export function parseFileToJSON<TJSON>(file: File): Promise<TJSON> {
	return new Promise((res) => {
		const reader = new FileReader();

		reader.onload = function (e) {
			if (e.target != null) {
				const fileContent = e.target.result;
				const cleanFileContent = (fileContent as string).replace(/^\uFEFF/, "");
				const parsedObject = eval(`(${cleanFileContent})`);
				res(parsedObject as TJSON);
			}
		};
		reader.readAsText(file);
	});
}

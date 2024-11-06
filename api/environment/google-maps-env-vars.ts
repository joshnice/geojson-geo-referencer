export function getGoogleMapsApiKey() {
	const environmentVariable = process.env.GOOGLE_MAPS_API_KEY;
	if (environmentVariable == null) {
		throw new Error("Google maps api key is not in environment variables");
	}
	return environmentVariable;
}

export function getGoogleMapsBucketName() {
	const environmentVariable = process.env.GOOGLE_MAPS_BUCKET_NAME;
	if (environmentVariable == null) {
		throw new Error("Google maps bucket name is not in environment variables");
	}
	return environmentVariable;
}

export function getGoogleMapsSessionFileName() {
	const environmentVariable = process.env.GOOGLE_MAPS_SESSION_FILE_NAME;
	if (environmentVariable == null) {
		throw new Error("Google maps session file name is not in environment variables");
	}
	return environmentVariable;
}

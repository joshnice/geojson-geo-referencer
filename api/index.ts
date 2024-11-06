import type { Handler } from "aws-lambda";
import { getGoogleMapsApiKey, getGoogleMapsBucketName, getGoogleMapsSessionFileName } from "./environment/google-maps-env-vars";
import { getFileFromS3 } from "./s3/get-file";

export const handler: Handler = async (
	event: {
		path: string;
		httpMethods: "GET";
		headers: Record<string, string>;
	},
	context,
) => {
	const googleMapApiKey = getGoogleMapsApiKey();
	const googleMapsBucketName = getGoogleMapsBucketName();
	const googleMapsSessionFileName = getGoogleMapsSessionFileName();

	const sessionFile = await getFileFromS3(googleMapsBucketName, googleMapsSessionFileName);

	if (sessionFile == null) {
		throw new Error("Session file can't be found");
	}

	const sessionContents = JSON.parse(sessionFile);

	return {
		body: JSON.stringify({
			sessionContents: JSON.stringify(sessionContents),
		}),
		statusCode: 200,
	};
};

import type { Handler } from "aws-lambda";
import { getGoogleMapsApiKey, getGoogleMapsBucketName, getGoogleMapsSessionFileName } from "./environment/google-maps-env-vars";
import { getFileFromS3 } from "./s3/get-file";
import { getNewGoogleMapsToken } from "./google-maps/get-new-token";
import { updateFile } from "./s3/update-file";
import { getOrdinaceSurveyApiKey } from "./environment/ordinance-survey-env-vars";

export const handler: Handler = async (
	event: {
		path: string;
		httpMethods: "GET" | "POST";
		headers: Record<string, string>;
	},
	context,
) => {
	const googleMapApiKey = getGoogleMapsApiKey();
	const googleMapsBucketName = getGoogleMapsBucketName();
	const googleMapsSessionFileName = getGoogleMapsSessionFileName();
	const osMapsApiKey = getOrdinaceSurveyApiKey();

	const sessionFile = await getFileFromS3(googleMapsBucketName, googleMapsSessionFileName);

	if (sessionFile == null) {
		throw new Error("Session file can't be found");
	}

	let sessionContents = JSON.parse(sessionFile) as { session: string, expiry: string };

	if (Number.parseInt(sessionContents.expiry) < new Date().getTime() / 1000) {
		const { expiry, session } = await getNewGoogleMapsToken(googleMapApiKey);
		sessionContents = { expiry, session };
		await updateFile(googleMapsBucketName, googleMapsSessionFileName, JSON.stringify(sessionContents));
	}

	return {
		body: JSON.stringify({
			googleMapsSessionKey: sessionContents.session,
			googleMapsApiKey: googleMapApiKey,
			osMapsApiKey: osMapsApiKey,
		}),
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
		statusCode: 200,
	};
};

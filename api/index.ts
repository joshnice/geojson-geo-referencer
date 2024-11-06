import type { Handler } from "aws-lambda";

export const handler: Handler = async (
	event: {
		path: string;
		httpMethods: "GET";
		headers: Record<string, string>;
	},
	context,
) => {
	return {
		body: JSON.stringify(event),
		statusCode: 200,
	};
};

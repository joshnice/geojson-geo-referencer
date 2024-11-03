import type { Handler } from "aws-lambda";

export const handler: Handler = async (event, context) => {
    return {
        body: JSON.stringify(event),
        statusCode: 200,
    };
};
import {
	GetObjectCommand,
	NoSuchKey,
	S3Client,
	S3ServiceException,
} from "@aws-sdk/client-s3";

export async function getFileFromS3(bucketName: string, key: string) {
	const client = new S3Client({ region: "eu-west-2" });

	try {
		const response = await client.send(
			new GetObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		);

		// The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
		const str = await response?.Body?.transformToString();
		return str;
	} catch (caught) {
		if (caught instanceof NoSuchKey) {
			console.error(
				`Error from S3 while getting object "${key}" from "${bucketName}". No such key exists.`,
			);
		} else if (caught instanceof S3ServiceException) {
			console.error(
				`Error from S3 while getting object from ${bucketName}.  ${caught.name}: ${caught.message}`,
			);
		} else {
			throw caught;
		}
	}
}

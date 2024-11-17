import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function updateFile(bucketName: string, key: string, data: string) {
    const client = new S3Client({});
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: data,
    });

    try {
        const response = await client.send(command);
        return response;
    } catch (err) {
        console.error(err)
    }
};


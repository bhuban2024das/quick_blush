import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "mock-quick-blush-bucket";

const s3Client = new S3Client({
    region: region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock_access_key",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock_secret_key"
    }
});

export const s3Service = {
    async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string | null> {
        try {
            if (bucketName === "mock-quick-blush-bucket") {
                console.log(`[Mock S3] Uploading ${fileName}`);
                return `https://mock-s3-bucket.s3.aws.com/${fileName}`;
            }

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                Body: fileBuffer,
                ContentType: contentType,
            });

            await s3Client.send(command);

            return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        } catch (error) {
            console.error("Error uploading to AWS S3:", error);
            return null;
        }
    }
};

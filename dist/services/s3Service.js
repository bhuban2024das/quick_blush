"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "mock-quick-blush-bucket";
const s3Client = new client_s3_1.S3Client({
    region: region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock_access_key",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock_secret_key"
    }
});
exports.s3Service = {
    async uploadFile(fileBuffer, fileName, contentType) {
        try {
            if (bucketName === "mock-quick-blush-bucket") {
                console.log(`[Mock S3] Uploading ${fileName}`);
                return `https://mock-s3-bucket.s3.aws.com/${fileName}`;
            }
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                Body: fileBuffer,
                ContentType: contentType,
            });
            await s3Client.send(command);
            return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        }
        catch (error) {
            console.error("Error uploading to AWS S3:", error);
            return null;
        }
    }
};

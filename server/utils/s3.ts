import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { logger } from "./logger";

const isLocalStack = process.env.USE_LOCALSTACK === "true";

export const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-southeast-2",
    endpoint: isLocalStack ? "http://localhost:4566" : undefined,
    forcePathStyle: isLocalStack, // Required for LocalStack
    credentials: isLocalStack
        ? {
              accessKeyId: "test",
              secretAccessKey: "test",
          }
        : undefined,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "payroo-payruns";

export const savePayrunToS3 = async (payrunId: string, payrunData: any): Promise<string> => {
    try {
        const key = `payruns/${payrunId}.json`;
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: JSON.stringify(payrunData, null, 2),
            ContentType: "application/json",
        });

        await s3Client.send(command);
        logger.info({ payrunId, key }, "Payrun saved to S3");
        return key;
    } catch (error) {
        logger.error({ error, payrunId }, "Failed to save payrun to S3");
        throw error;
    }
};

export const getPayrunFromS3 = async (payrunId: string): Promise<any> => {
    try {
        const key = `payruns/${payrunId}.json`;
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);
        const body = await response.Body?.transformToString();
        return body ? JSON.parse(body) : null;
    } catch (error) {
        logger.error({ error, payrunId }, "Failed to get payrun from S3");
        throw error;
    }
};

export const listPayrunsFromS3 = async (): Promise<string[]> => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: "payruns/",
        });

        const response = await s3Client.send(command);
        const keys = response.Contents?.map((item) => item.Key || "").filter((key) => key.endsWith(".json")) || [];
        return keys;
    } catch (error) {
        logger.error({ error }, "Failed to list payruns from S3");
        throw error;
    }
};

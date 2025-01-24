import { FileData, FileStorage } from "../types/storage";
import config from "config";
import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import createHttpError from "http-errors";

// npm i @aws-sdk/client-s3
export class S3Storage implements FileStorage {
    private client: S3Client;
    constructor() {
        this.client = new S3Client({
            region: config.get("s3.region"),
            credentials: {
                accessKeyId: config.get("s3.accessKeyId"),
                secretAccessKey: config.get("s3.secretAccessKey"),
            },
        });
    }
    async upload(data: FileData): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: data.filename,
            Body: data.fileData,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new PutObjectCommand(objectParams));
    }
    async delete(filename: string): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: filename,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new DeleteObjectCommand(objectParams));
    }
    getObjectUri(fileName: string): string {
        //https://mernspace-project-deb.s3.ap-south-1.amazonaws.com/3b8945a1-7287-4232-88dc-43458eb21fbd
        // Bucket Name : mernspace-project-deb, Bucket : s3, Region: ap-south-1, domain: .amazonaws.com, imageId: 3b8945a1-7287-4232-88dc-43458eb21fbd
        const bucket = config.get("s3.bucket");
        const region = config.get("s3.region");

        if (typeof bucket !== "string" || typeof region !== "string") {
            throw createHttpError(
                500,
                "S3 bucket or region is not configured properly.",
            );
        }
        //<img src="https://mernspace-project-deb.s3.ap-south-1.amazonaws.com/13973a51-c23c-4ab0-a833-cd541f53be7f"></img>

        return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
    }
}

import { Request, Response } from "express";
import { s3Service } from "../services/s3Service";

export const uploadMedia = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.file;
        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

        const fileUrl = await s3Service.uploadFile(file.buffer, fileName, file.mimetype);

        if (!fileUrl) {
            return res.status(500).json({ message: "Failed to upload file to S3" });
        }

        res.status(200).json({ 
            message: "File uploaded successfully",
            url: fileUrl 
        });
    } catch (error) {
        res.status(500).json({ message: "Error uploading file", error });
    }
};

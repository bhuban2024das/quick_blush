import { Router } from "express";
import multer from "multer";
import { uploadMedia } from "../controllers/uploadController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";

const router = Router();

// Store file in memory to securely pass buffer to AWS SDK
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Media and file uploads (Images, Documents) via S3
 */

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Upload a media file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded, returns public valid AWS S3 URL
 */
router.post("/", authenticateJWT, upload.single("file"), uploadMedia);

export default router;

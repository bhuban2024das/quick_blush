"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uploadController_1 = require("../controllers/uploadController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Store file in memory to securely pass buffer to AWS SDK
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
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
router.post("/", authMiddleware_1.authenticateJWT, upload.single("file"), uploadController_1.uploadMedia);
exports.default = router;

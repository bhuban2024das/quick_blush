"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const userValidations_1 = require("../validations/userValidations");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and profile management
 */
/**
 * @swagger
 * /api/users/request-otp:
 *   post:
 *     summary: Request an OTP for a mobile number
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "1234567890"
 *                 description: Mobile number of the user
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Validation Error or Mobile number required
 */
router.post("/request-otp", (0, validationMiddleware_1.validateRequest)(userValidations_1.requestOtpSchema), userController_1.requestOtp);
/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verify OTP for a mobile number and log in
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - otp
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "1234567890"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user profile
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify-otp", (0, validationMiddleware_1.validateRequest)(userValidations_1.verifyOtpSchema), userController_1.verifyOtp);
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/profile", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), userController_1.getProfile);
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               addressBook:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.put("/profile", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), (0, validationMiddleware_1.validateRequest)(userValidations_1.updateProfileSchema), userController_1.updateProfile);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and security operations
 */
/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Request an OTP for a mobile number
 *     tags: [Auth]
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
 *         description: Mobile number required
 */
router.post("/send-otp", authController_1.sendOtp);
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and log in/register the user
 *     tags: [Auth]
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
router.post("/verify-otp", authController_1.verifyOtp);
/**
 * @swagger
 * /api/auth/register-details:
 *   post:
 *     summary: Complete registration after verifying OTP
 *     description: This endpoint requires a Bearer token received from /verify-otp.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               photo:
 *                 type: string
 *                 description: URL to the user photo
 *     responses:
 *       200:
 *         description: User profile setup successfully
 *       400:
 *         description: Email already in use or missing fields
 *       401:
 *         description: Unauthorized, missing or invalid token
 */
router.post("/register-details", authMiddleware_1.authenticateJWT, authController_1.registerUser);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrMobile
 *               - password
 *             properties:
 *               emailOrMobile:
 *                 type: string
 *                 description: "Enter either your registered email address or mobile number."
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", authController_1.login);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", authMiddleware_1.authenticateJWT, authController_1.logout);
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post("/refresh-token", authController_1.refreshToken);
/**
 * @swagger
 * /api/auth/social-login:
 *   post:
 *     summary: Login via Social provider (Google/Facebook)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Social login successful
 */
router.post("/social-login", authController_1.socialLogin);
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Required if the user already has a password set.
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password / Missing fields
 */
router.post("/change-password", authMiddleware_1.authenticateJWT, authController_1.changePassword);
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset link / OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link/OTP sent
 */
router.post("/forgot-password", authController_1.forgotPassword);
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP
 */
router.post("/reset-password", authController_1.resetPassword);
/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     description: Send email without OTP to request code. Send email + OTP to verify.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *                 description: Only required during verification step
 *     responses:
 *       200:
 *         description: OTP sent or Email verified
 *       400:
 *         description: Invalid OTP or missing email
 */
router.post("/verify-email", authMiddleware_1.authenticateJWT, authController_1.verifyEmail);
/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to mobile
 *     tags: [Auth]
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
 *     responses:
 *       200:
 *         description: OTP resent
 */
router.post("/resend-otp", authController_1.resendOtp);
exports.default = router;

import { Router } from "express";
import {
    sendOtp,
    verifyOtp,
    registerUser,
    login,
    logout,
    refreshToken,
    socialLogin,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendOtp
} from "../controllers/authController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

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
router.post("/send-otp", sendOtp);

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
router.post("/verify-otp", verifyOtp);

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
router.post("/register-details", authenticateJWT, registerUser);

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
router.post("/login", login);

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
router.post("/logout", authenticateJWT, logout);

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
router.post("/refresh-token", refreshToken);

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
router.post("/social-login", socialLogin);

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
router.post("/change-password", authenticateJWT, changePassword);

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
router.post("/forgot-password", forgotPassword);

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
router.post("/reset-password", resetPassword);

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
router.post("/verify-email", authenticateJWT, verifyEmail);

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
router.post("/resend-otp", resendOtp);

export default router;

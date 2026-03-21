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
// ─── OTP Flow ────────────────────────────────────────────────────────────────
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
 *                 example: "9999999999"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Mobile number required
 */
router.post("/send-otp", authController_1.sendOtp);
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
 *                 example: "9999999999"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 */
router.post("/resend-otp", authController_1.resendOtp);
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP — logs in existing users, creates new users automatically
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
 *                 example: "9999999999"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: "Returns accessToken (1h) and refreshToken (30d). If needsRegistration is true, call /register-details next."
 *       400:
 *         description: Invalid OTP or missing fields
 */
router.post("/verify-otp", authController_1.verifyOtp);
// ─── Registration ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/register-details:
 *   post:
 *     summary: Complete profile after OTP verification
 *     description: Call this endpoint (with Bearer token from /verify-otp) when needsRegistration is true.
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 example: "jane@example.com"
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               photo:
 *                 type: string
 *                 description: URL to the user's profile photo
 *     responses:
 *       200:
 *         description: User profile saved successfully
 *       400:
 *         description: Name is required or email already in use
 *       401:
 *         description: Missing or invalid token
 */
router.post("/register-details", authMiddleware_1.authenticateJWT, authController_1.registerUser);
// ─── Token ────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/validate-token:
 *   get:
 *     summary: Check if a stored JWT token is still valid
 *     description: >
 *       Always returns HTTP 200. Check the valid field in the response body.
 *       If valid is true, the full user profile is returned.
 *       If valid is false, a descriptive message explains why.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 */
router.get("/validate-token", authController_1.validateToken);
// ─── Session ──────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout — invalidate session client-side
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
 *     summary: Refresh user access token
 *     description: Exchange a valid refresh token for a new access token and refresh token pair.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token received during login or OTP verification
 *     responses:
 *       200:
 *         description: New accessToken and refreshToken issued
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid, expired, or mismatched refresh token
 */
router.post("/refresh-token", authController_1.refreshToken);
/**
 * @swagger
 * /api/auth/social-login:
 *   post:
 *     summary: Login via Social provider (Google / Apple)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Social login successful
 */
router.post("/social-login", authController_1.socialLogin);
// ─── Email Verification ───────────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address via OTP
 *     description: >
 *       Step 1 — Send only email to receive an OTP.
 *       Step 2 — Send email + otp to confirm verification.
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
 *                 description: Only required in Step 2 (verification)
 *     responses:
 *       200:
 *         description: OTP sent or email verified successfully
 *       400:
 *         description: Invalid OTP or missing email
 */
router.post("/verify-email", authMiddleware_1.authenticateJWT, authController_1.verifyEmail);
exports.default = router;

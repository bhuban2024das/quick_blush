"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendorController_1 = require("../controllers/vendorController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const vendorValidations_1 = require("../validations/vendorValidations");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor onboarding, operations, and earnings
 */
/**
 * @swagger
 * /api/vendors/register:
 *   post:
 *     summary: Register a new vendor
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - mobile
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               age:
 *                 type: integer
 *               photo:
 *                 type: string
 *               experienceYears:
 *                 type: integer
 *               serviceCategoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 */
router.post("/register", (0, validationMiddleware_1.validateRequest)(vendorValidations_1.registerVendorSchema), vendorController_1.registerVendor);
/**
 * @swagger
 * /api/vendors/verify-otp:
 *   post:
 *     summary: Verify Vendor OTP
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", (0, validationMiddleware_1.validateRequest)(vendorValidations_1.verifyOtpSchema), vendorController_1.verifyVendorOtp);
/**
 * @swagger
 * /api/vendors/login:
 *   post:
 *     summary: Vendor Login
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful — returns accessToken (1h) and refreshToken (30d)
 */
router.post("/login", (0, validationMiddleware_1.validateRequest)(vendorValidations_1.loginVendorSchema), vendorController_1.loginVendor);
/**
 * @swagger
 * /api/vendors/refresh-token:
 *   post:
 *     summary: Refresh vendor access token
 *     description: Exchange a valid refresh token for a new access token + refresh token pair.
 *     tags: [Vendors]
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
 *     responses:
 *       200:
 *         description: New accessToken and refreshToken issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", vendorController_1.refreshVendorToken);
const vendorSubscriptionController_1 = require("../controllers/vendorSubscriptionController");
const vendorJobController_1 = require("../controllers/vendorJobController");
/**
 * @swagger
 * /api/vendors/profile:
 *   get:
 *     summary: Get vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get("/profile", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorController_1.getVendorProfile);
/**
 * @swagger
 * /api/vendors/profile:
 *   put:
 *     summary: Update vendor profile
 *     tags: [Vendors]
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
 *               bio:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), (0, validationMiddleware_1.validateRequest)(vendorValidations_1.updateVendorProfileSchema), vendorController_1.updateVendorProfile);
/**
 * @swagger
 * /api/vendors/document:
 *   post:
 *     summary: Upload vendor verification document
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post("/document", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), (0, validationMiddleware_1.validateRequest)(vendorValidations_1.uploadDocumentSchema), vendorController_1.uploadVendorDocument);
/**
 * @swagger
 * /api/vendors/subscription:
 *   get:
 *     summary: Get current subscription plan
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active subscription
 */
router.get("/subscription", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorSubscriptionController_1.getCurrentSubscription);
/**
 * @swagger
 * /api/vendors/subscription/purchase:
 *   post:
 *     summary: Purchase a subscription plan
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription activated
 */
router.post("/subscription/purchase", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), (0, validationMiddleware_1.validateRequest)(vendorValidations_1.purchaseSubscriptionSchema), vendorSubscriptionController_1.purchaseSubscription);
/**
 * @swagger
 * /api/vendors/jobs/pending:
 *   get:
 *     summary: Get all pending jobs assigned to vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending bookings
 */
router.get("/jobs/pending", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorJobController_1.getPendingJobs);
/**
 * @swagger
 * /api/vendors/jobs/history:
 *   get:
 *     summary: Get all completed/cancelled jobs for vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of historical bookings
 *       500:
 *         description: Error fetching history
 */
router.get("/jobs/history", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorJobController_1.getVendorJobHistory);
/**
 * @swagger
 * /api/vendors/jobs/{bookingId}/accept:
 *   post:
 *     summary: Accept a pending job
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job accepted
 */
router.post("/jobs/:bookingId/accept", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorJobController_1.acceptJob);
/**
 * @swagger
 * /api/vendors/jobs/{bookingId}/reject:
 *   post:
 *     summary: Reject a pending job
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job rejected
 */
router.post("/jobs/:bookingId/reject", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorJobController_1.rejectJob);
/**
 * @swagger
 * /api/vendors/jobs/{bookingId}/confirm-payment:
 *   post:
 *     summary: Confirm cash/QR payment for PAY_AFTER_SERVICE
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post("/jobs/:bookingId/confirm-payment", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorJobController_1.confirmPayment);
/**
 * @swagger
 * /api/vendors/jobs/{bookingId}/status:
 *   put:
 *     summary: Update status of an active job
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [EN_ROUTE, IN_PROGRESS, COMPLETED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put("/jobs/:bookingId/status", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), (0, validationMiddleware_1.validateRequest)(vendorValidations_1.jobStatusSchema), vendorJobController_1.updateJobStatus);
const vendorEarningsController_1 = require("../controllers/vendorEarningsController");
/**
 * @swagger
 * /api/vendors/earnings:
 *   get:
 *     summary: Get vendor earnings overview
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings data
 */
router.get("/earnings", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorEarningsController_1.getEarningsDashboard);
/**
 * @swagger
 * /api/vendors/earnings/payout:
 *   post:
 *     summary: Request a payout
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payout requested
 */
router.post("/earnings/payout", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), (0, validationMiddleware_1.validateRequest)(vendorValidations_1.payoutRequestSchema), vendorEarningsController_1.requestPayout);
/**
 * @swagger
 * /api/vendors/location:
 *   put:
 *     summary: Update vendor live GPS location
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
router.put("/location", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), (0, validationMiddleware_1.validateRequest)(vendorValidations_1.updateVendorLocationSchema), vendorController_1.updateVendorLocation);
/**
 * @swagger
 * /api/vendors/fcm-token:
 *   put:
 *     summary: Update vendor FCM Token for push notifications
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification token updated successfully
 */
router.put("/fcm-token", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("VENDOR"), vendorController_1.updateVendorFcmToken);
exports.default = router;

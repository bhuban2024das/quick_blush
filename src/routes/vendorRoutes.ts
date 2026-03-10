import { Router } from "express";
import { registerVendor, loginVendor, getVendorProfile, updateVendorProfile } from "../controllers/vendorController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
    registerVendorSchema,
    loginVendorSchema,
    updateVendorProfileSchema,
    purchaseSubscriptionSchema,
    jobStatusSchema,
    payoutRequestSchema
} from "../validations/vendorValidations";

const router = Router();

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
 *               serviceCategoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 */
router.post("/register", validateRequest(registerVendorSchema), registerVendor);

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
 *         description: Login successful
 */
router.post("/login", validateRequest(loginVendorSchema), loginVendor);

import { getCurrentSubscription, purchaseSubscription } from "../controllers/vendorSubscriptionController";
import { getPendingJobs, acceptJob, rejectJob, updateJobStatus } from "../controllers/vendorJobController";

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
router.get("/profile", authenticateJWT, authorizeRole("VENDOR"), getVendorProfile);

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
router.put("/profile", authenticateJWT, authorizeRole("VENDOR"), validateRequest(updateVendorProfileSchema), updateVendorProfile);

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
router.get("/subscription", authenticateJWT, authorizeRole("VENDOR"), getCurrentSubscription);

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
router.post("/subscription/purchase", authenticateJWT, authorizeRole("VENDOR"), validateRequest(purchaseSubscriptionSchema), purchaseSubscription);

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
router.get("/jobs/pending", authenticateJWT, authorizeRole("VENDOR"), getPendingJobs);

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
router.post("/jobs/:bookingId/accept", authenticateJWT, authorizeRole("VENDOR"), acceptJob);

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
router.post("/jobs/:bookingId/reject", authenticateJWT, authorizeRole("VENDOR"), rejectJob);

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
router.put("/jobs/:bookingId/status", authenticateJWT, authorizeRole("VENDOR"), validateRequest(jobStatusSchema), updateJobStatus);

import { getEarningsDashboard, requestPayout } from "../controllers/vendorEarningsController";

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
router.get("/earnings", authenticateJWT, authorizeRole("VENDOR"), getEarningsDashboard);

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
router.post("/earnings/payout", authenticateJWT, authorizeRole("VENDOR"), validateRequest(payoutRequestSchema), requestPayout);

export default router;

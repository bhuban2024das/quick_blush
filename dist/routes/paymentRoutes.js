"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"));
/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and transaction management
 */
/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     summary: Initiate a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               bookingId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [UPI, CARD, WALLET, CASHLESS]
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 */
router.post("/initiate", paymentController_1.initiatePayment);
/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify a completed payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *               - signature
 *             properties:
 *               paymentId:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 */
router.post("/verify", paymentController_1.verifyPayment);
/**
 * @swagger
 * /api/payments/referral:
 *   post:
 *     summary: Apply a referral code
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referralCode
 *             properties:
 *               referralCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Referral code applied successfully
 */
router.post("/referral", paymentController_1.applyReferral);
exports.default = router;

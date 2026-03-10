import { Router } from "express";
import { initiatePayment, verifyPayment, applyReferral } from "../controllers/paymentController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticateJWT, authorizeRole("USER"));

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
router.post("/initiate", initiatePayment);

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
router.post("/verify", verifyPayment);

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
router.post("/referral", applyReferral);

export default router;

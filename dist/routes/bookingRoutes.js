"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const bookingValidations_1 = require("../validations/bookingValidations");
const router = (0, express_1.Router)();
/**
 * @swagger
 *
 * tags:
 *   name: Bookings
 *   description: Customer service bookings and management
 */
// Protect all booking routes for authenticated users
router.use(authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"));
/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: integer
 *               productKitId:
 *                 type: integer
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", (0, validationMiddleware_1.validateRequest)(bookingValidations_1.createBookingSchema), bookingController_1.createBooking);
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 */
router.get("/", bookingController_1.getUserBookings);
/**
 * @swagger
 * /api/bookings/{bookingId}/cancel:
 *   put:
 *     summary: Cancel an existing booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.put("/:bookingId/cancel", bookingController_1.cancelBooking);
exports.default = router;

import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
import {
    createBooking,
    instantBooking,
    estimatePrice,
    getUpcomingBookings,
    getBookingHistory,
    getBookingById,
    getBookingStatus,
    getBookingTimeline,
    getCustomerNotes,
    confirmBooking,
    cancelBooking,
    rescheduleBooking,
    updateBookingAddress,
    reassignVendor,
    rebook,
    assignVendor,
    markEnRoute,
    markArrived,
    startService,
    endService,
    completeBooking,
    getVendorLocation,
    getRouteAndETA,
    addAddon,
    removeAddon,
    tipVendor,
    getInvoice
} from "../controllers/bookingController";

const router = Router();

// Secure all booking routes
router.use(authenticateJWT);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Core booking module containing 20+ operations for lifecycle execution
 */

// --- CREATION & PRICING ---

/**
 * @swagger
 * /api/bookings/create:
 *   post:
 *     summary: Create a scheduled booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - scheduledDate
 *               - scheduledTime
 *               - address
 *               - lat
 *               - lng
 *             properties:
 *               serviceId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *               scheduledTime:
 *                 type: string
 *                 example: "14:30:00"
 *               address:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               customerNotes:
 *                 type: string
 *               addons:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Booking created successfully in PENDING_PAYMENT state
 *       400:
 *         description: Missing required fields
 */
router.post("/create", createBooking);

/**
 * @swagger
 * /api/bookings/instant:
 *   post:
 *     summary: Create an immediate booking
 *     description: This will automatically set the scheduled date and time to NOW and trigger an instant search for nearby vendors upon payment.
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
 *                 type: string
 *               address:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Instant Booking initialized in PENDING_PAYMENT state
 *       400:
 *         description: Missing required fields
 */
router.post("/instant", instantBooking);

/**
 * @swagger
 * /api/bookings/estimate-price:
 *   get:
 *     summary: Estimate booking price
 *     description: Returns a breakdown of the estimated cost for a given service and its addons
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the service
 *       - in: query
 *         name: addons
 *         required: false
 *         schema:
 *           type: string
 *         description: JSON stringified array of addons e.g. [{"name":"Extra tools","price":50}]
 *     responses:
 *       200:
 *         description: Price estimated successfully
 *       400:
 *         description: Missing serviceId
 */
router.get("/estimate-price", estimatePrice);

// --- RETRIEVAL ---

/**
 * @swagger
 * /api/bookings/upcoming:
 *   get:
 *     summary: Get upcoming active bookings for the user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming bookings
 */
router.get("/upcoming", getUpcomingBookings);

/**
 * @swagger
 * /api/bookings/history:
 *   get:
 *     summary: Get historical (completed/cancelled) bookings for the user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of historical bookings
 */
router.get("/history", getBookingHistory);
// Note: More specific paths must be defined BEFORE the generic /:id catchall
/**
 * @swagger
 * /api/bookings/status:
 *   get:
 *     summary: Get the real-time status of a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current status
 */
router.get("/status", getBookingStatus);

/**
 * @swagger
 * /api/bookings/timeline:
 *   get:
 *     summary: Get the chronological events of a booking's progress
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of timeline events
 */
router.get("/timeline", getBookingTimeline);

/**
 * @swagger
 * /api/bookings/customer-notes:
 *   get:
 *     summary: Fetch customer notes for a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer notes text
 */
router.get("/customer-notes", getCustomerNotes);

/**
 * @swagger
 * /api/bookings/vendor-location:
 *   get:
 *     summary: Get the live location coordinates of the assigned vendor
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: vendorId, lat, lng, and timestamp
 */
router.get("/vendor-location", getVendorLocation);

/**
 * @swagger
 * /api/bookings/{bookingId}/route-eta:
 *   get:
 *     summary: Render the mathematical Map Route and ETA for the flutter application
 *     tags: [Bookings]
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
 *         description: Encoded Polyline string and ETA cache.
 *       400:
 *         description: Missing coordinates or API Error.
 */
router.get("/:bookingId/route-eta", getRouteAndETA);

/**
 * @swagger
 * /api/bookings/invoice:
 *   get:
 *     summary: Generate a detailed invoice for a completed booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Generated invoice object
 */
router.get("/invoice", getInvoice);
/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get full booking details including service, addons, and timeline
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID
 *     responses:
 *       200:
 *         description: Full booking details
 *       404:
 *         description: Booking not found
 */
router.get("/:id", getBookingById); // Full Details

// --- LIFECYCLE & ACTIONS ---
/**
 * @swagger
 * /api/bookings/confirm:
 *   post:
 *     summary: Confirm a booking (called after successful payment)
 *     tags: [Bookings]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *               transactionId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 description: PAY_NOW or PAY_AFTER_SERVICE
 *     responses:
 *       200:
 *         description: Booking confirmed
 *       400:
 *         description: Booking is not in PENDING_PAYMENT state
 */
router.post("/confirm", confirmBooking);

/**
 * @swagger
 * /api/bookings/cancel:
 *   post:
 *     summary: Cancel an active booking
 *     tags: [Bookings]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       400:
 *         description: Booking cannot be cancelled in current state
 */
router.post("/cancel", cancelBooking);

/**
 * @swagger
 * /api/bookings/reschedule:
 *   post:
 *     summary: Reschedule an active booking
 *     tags: [Bookings]
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
 *               - newDate
 *               - newTime
 *             properties:
 *               bookingId:
 *                 type: string
 *               newDate:
 *                 type: string
 *                 format: date
 *               newTime:
 *                 type: string
 *                 example: "16:00:00"
 *     responses:
 *       200:
 *         description: Booking rescheduled
 *       400:
 *         description: Cannot reschedule booking in its current state
 */
router.post("/reschedule", rescheduleBooking);

/**
 * @swagger
 * /api/bookings/address:
 *   post:
 *     summary: Update an active booking's address
 *     tags: [Bookings]
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
 *               - newAddress
 *             properties:
 *               bookingId:
 *                 type: string
 *               newAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Cannot update address in current state
 */
router.post("/address", updateBookingAddress);
/**
 * @swagger
 * /api/bookings/reassign-vendor:
 *   post:
 *     summary: Clear the current vendor and look for a new one
 *     tags: [Bookings]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor reassigned
 */
router.post("/reassign-vendor", reassignVendor);

/**
 * @swagger
 * /api/bookings/rebook:
 *   post:
 *     summary: Quickly create a new booking using previous booking details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - previousBookingId
 *               - scheduledDate
 *               - scheduledTime
 *             properties:
 *               previousBookingId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *               scheduledTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: New booking initialized
 */
router.post("/rebook", rebook);

// --- EXECUTION & REAL-TIME ---

/**
 * @swagger
 * /api/bookings/assign-vendor:
 *   post:
 *     summary: Assign a specific vendor to a CONFIRMED booking
 *     tags: [Bookings]
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
 *               - vendorId
 *             properties:
 *               bookingId:
 *                 type: string
 *               vendorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor assigned
 *       400:
 *         description: Booking is not CONFIRMED
 */
router.post("/assign-vendor", assignVendor);

/**
 * @swagger
 * /api/bookings/en-route:
 *   post:
 *     summary: Mark the vendor as EN ROUTE to the customer
 *     tags: [Bookings]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Marked as en route
 */
router.post("/en-route", markEnRoute);

/**
 * @swagger
 * /api/bookings/arrived:
 *   post:
 *     summary: Mark the vendor as ARRIVED at the customer location
 *     tags: [Bookings]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Marked as arrived
 */
router.post("/arrived", markArrived);

/**
 * @swagger
 * /api/bookings/start:
 *   post:
 *     summary: Mark a service as IN_PROGRESS (Vendor action)
 *     tags: [Bookings]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service started
 */
router.post("/start", startService);

/**
 * @swagger
 * /api/bookings/end:
 *   post:
 *     summary: Mark a service as SERVICE_ENDED (Vendor action)
 *     tags: [Bookings]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service ended
 */
router.post("/end", endService);

/**
 * @swagger
 * /api/bookings/complete:
 *   post:
 *     summary: Mark a booking as COMPLETED and finalize payments (System/Admin/Auto action)
 *     tags: [Bookings]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking finalized
 */
router.post("/complete", completeBooking);

// --- FINANCIALS: ADDONS, TIPS ---

/**
 * @swagger
 * /api/bookings/add-addon:
 *   post:
 *     summary: Add an addon to the booking
 *     tags: [Bookings]
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
 *               - addonName
 *               - price
 *             properties:
 *               bookingId:
 *                 type: string
 *               addonName:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Addon added
 */
router.post("/add-addon", addAddon);

/**
 * @swagger
 * /api/bookings/remove-addon:
 *   post:
 *     summary: Remove an addon from the booking
 *     tags: [Bookings]
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
 *               - addonId
 *             properties:
 *               bookingId:
 *                 type: string
 *               addonId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Addon removed
 */
router.post("/remove-addon", removeAddon);

/**
 * @swagger
 * /api/bookings/tip:
 *   post:
 *     summary: Allow users to tip vendors and credit their wallet
 *     tags: [Bookings]
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
 *               - tipAmount
 *             properties:
 *               bookingId:
 *                 type: string
 *               tipAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tip added to booking
 */
router.post("/tip", tipVendor);

export default router;

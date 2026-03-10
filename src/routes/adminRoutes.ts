import { Router } from "express";
import { loginAdmin, getVendors, approveVendor, createProductKit, getPurchases } from "../controllers/adminController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin Login
 *     tags: [Admin]
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
router.post("/login", loginAdmin);

// Protected Admin Routes
router.use(authenticateJWT, authorizeRole("ADMIN"));

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendors
 */
router.get("/vendors", getVendors);

/**
 * @swagger
 * /api/admin/vendors/{vendorId}/approve:
 *   put:
 *     summary: Approve a vendor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor approved
 */
router.put("/vendors/:vendorId/approve", approveVendor);

/**
 * @swagger
 * /api/admin/kits:
 *   post:
 *     summary: Create a new product kit
 *     tags: [Admin]
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
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Kit created
 */
router.post("/kits", createProductKit);

/**
 * @swagger
 * /api/admin/purchases:
 *   get:
 *     summary: Get vendor kit purchases
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchases
 */
router.get("/purchases", getPurchases);

export default router;

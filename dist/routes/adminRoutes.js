"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
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
router.post("/login", adminController_1.loginAdmin);
// Protected Admin Routes
router.use(authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("ADMIN"));
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
router.get("/vendors", adminController_1.getVendors);
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
router.put("/vendors/:vendorId/approve", adminController_1.approveVendor);
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
router.post("/kits", adminController_1.createProductKit);
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
router.get("/purchases", adminController_1.getPurchases);
exports.default = router;

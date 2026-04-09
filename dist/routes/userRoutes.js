"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const addressController_1 = require("../controllers/addressController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const userValidations_1 = require("../validations/userValidations");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and profile management
 */
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/profile", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), userController_1.getProfile);
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               addressBook:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.put("/profile", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), (0, validationMiddleware_1.validateRequest)(userValidations_1.updateProfileSchema), userController_1.updateProfile);
/**
 * @swagger
 * /api/users/profile/upload-photo:
 *   post:
 *     summary: Upload a photo for the user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 */
router.post("/profile/upload-photo", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"));
/**
 * @swagger
 * /api/users/profile/delete:
 *   delete:
 *     summary: Delete the user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete("/profile/delete", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"));
/**
 * @swagger
 * /api/users/membership/subscribe:
 *   post:
 *     summary: Upgrade the user to an Elite Membership
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully upgraded to Elite Membership
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isElite:
 *                   type: boolean
 *                 eliteExpiryDate:
 *                   type: string
 *                   format: date-time
 *                 qbCoins:
 *                   type: integer
 *       404:
 *         description: User not found
 */
router.post("/membership/subscribe", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), userController_1.subscribeMembership);
/**
 * @swagger
 * tags:
 *   name: Address
 *   description: Address Management for Users
 */
/**
 * @swagger
 * /api/users/address:
 *   get:
 *     summary: Get all addresses for the logged-in user
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user addresses
 */
router.get("/address", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), addressController_1.getAddresses);
/**
 * @swagger
 * /api/users/address/add:
 *   post:
 *     summary: Add a new address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [HOME, WORK, OTHER]
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               landmark:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Address added successfully
 */
router.post("/address/add", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), addressController_1.addAddress);
/**
 * @swagger
 * /api/users/address/update/{id}:
 *   put:
 *     summary: Update an existing address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The address UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [HOME, WORK, OTHER]
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               landmark:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 */
router.put("/address/update/:id", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), addressController_1.updateAddress);
/**
 * @swagger
 * /api/users/address/delete/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The address UUID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.delete("/address/delete/:id", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), addressController_1.deleteAddress);
/**
 * @swagger
 * /api/users/address/set-default/{id}:
 *   post:
 *     summary: Set an address as the default
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The address UUID
 *     responses:
 *       200:
 *         description: Default address set successfully
 *       404:
 *         description: Address not found
 */
router.post("/address/set-default/:id", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("USER"), addressController_1.setDefaultAddress);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const serviceValidations_1 = require("../validations/serviceValidations");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service lookup and discovery
 */
/**
 * @swagger
 * /api/services/categories:
 *   get:
 *     summary: Get all service categories
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/categories", serviceController_1.getCategories);
/**
 * @swagger
 * /api/services/categories:
 *   post:
 *     summary: Create a new service category
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               parentCategoryId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/categories", serviceController_1.createCategory);
/**
 * @swagger
 * /api/services/categories/{categoryId}/services:
 *   get:
 *     summary: Get specific services for a given category
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The category UUID
 *     responses:
 *       200:
 *         description: List of services in category
 */
router.get("/categories/:categoryId/services", serviceController_1.getServicesByCategory);
/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service under a category
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - categoryId
 *               - silverPrice
 *               - durationMinutes
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               silverPrice:
 *                 type: number
 *               goldPrice:
 *                 type: number
 *               platinumPrice:
 *                 type: number
 *               productCost:
 *                 type: number
 *               durationMinutes:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Service created
 */
router.post("/", serviceController_1.createService);
/**
 * @swagger
 * /api/services/search:
 *   get:
 *     summary: Search for services globally
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", (0, validationMiddleware_1.validateRequest)(serviceValidations_1.searchServicesSchema, "query"), serviceController_1.searchServices);
/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get a specific service by its custom ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 */
router.get("/:id", serviceController_1.getServiceById);
// --- ADDONS ---
/**
 * @swagger
 * /api/services/{serviceId}/addons:
 *   get:
 *     summary: Get addons for a specific service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of addons
 */
router.get("/:serviceId/addons", serviceController_1.getAddonsByService);
/**
 * @swagger
 * /api/services/addons:
 *   post:
 *     summary: Create an addon for a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - serviceId
 *               - name
 *               - price
 *             properties:
 *               id:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Addon created
 */
router.post("/addons", serviceController_1.createAddon);
exports.default = router;

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
 * /api/services/categories/{categoryId}/services:
 *   get:
 *     summary: Get specific services for a given category
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of services in category
 */
router.get("/categories/:categoryId/services", serviceController_1.getServicesByCategory);
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
exports.default = router;

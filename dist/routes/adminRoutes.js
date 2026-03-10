"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/login", adminController_1.loginAdmin);
// Protected Admin Routes
router.use(authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRole)("ADMIN"));
router.get("/vendors", adminController_1.getVendors);
router.put("/vendors/:vendorId/approve", adminController_1.approveVendor);
router.post("/kits", adminController_1.createProductKit);
router.get("/purchases", adminController_1.getPurchases);
exports.default = router;

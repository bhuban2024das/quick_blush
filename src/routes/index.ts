import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import serviceRoutes from "./serviceRoutes";
import bookingRoutes from "./bookingRoutes";
import paymentRoutes from "./paymentRoutes";

import adminRoutes from "./adminRoutes";
import vendorRoutes from "./vendorRoutes";
import uploadRoutes from "./uploadRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/vendors", vendorRoutes);
router.use("/admin", adminRoutes);
router.use("/services", serviceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/uploads", uploadRoutes);

export default router;

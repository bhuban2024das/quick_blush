"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobStatus = exports.rejectJob = exports.acceptJob = exports.getPendingJobs = void 0;
const data_source_1 = require("../config/data-source");
const Booking_1 = require("../entities/Booking");
const Vendor_1 = require("../entities/Vendor");
const bookingRepo = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
const getPendingJobs = async (req, res) => {
    try {
        const vendorId = req.user.id;
        // Simplification: In reality, jobs are matched geographically and broadcasted via Sockets.
        // Here we just fetch jobs strictly assigned or broadly unassigned (pending)
        const bookings = await bookingRepo.find({
            where: [
                { vendor: { id: vendorId }, status: Booking_1.BookingStatus.CONFIRMED },
                { vendor: undefined, status: Booking_1.BookingStatus.CONFIRMED }
            ]
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching pending jobs", error });
    }
};
exports.getPendingJobs = getPendingJobs;
const acceptJob = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;
        const booking = await bookingRepo.findOneBy({ id: bookingId });
        if (!booking || booking.status !== Booking_1.BookingStatus.CONFIRMED) {
            return res.status(400).json({ message: "Booking no longer available" });
        }
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (vendor?.status !== 'APPROVED') {
            return res.status(403).json({ message: "You must be an APPROVED vendor to accept jobs" });
        }
        booking.vendor = vendor;
        booking.status = Booking_1.BookingStatus.VENDOR_ASSIGNED;
        await bookingRepo.save(booking);
        vendor.consecutiveRejections = 0; // reset
        await vendorRepo.save(vendor);
        res.status(200).json({ message: "Job accepted", booking });
    }
    catch (error) {
        res.status(500).json({ message: "Error accepting job", error });
    }
};
exports.acceptJob = acceptJob;
const rejectJob = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;
        // In a real broadcast, rejection just hides it from this vendor.
        // If explicitly assigned:
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        vendor.consecutiveRejections += 1;
        if (vendor.consecutiveRejections >= 5) {
            vendor.isOnline = false; // block due to 5 rejections
        }
        await vendorRepo.save(vendor);
        res.status(200).json({ message: "Job rejected", consecutiveRejections: vendor.consecutiveRejections });
    }
    catch (error) {
        res.status(500).json({ message: "Error rejecting job", error });
    }
};
exports.rejectJob = rejectJob;
const updateJobStatus = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;
        const { status } = req.body;
        const booking = await bookingRepo.findOne({
            where: { id: bookingId, vendor: { id: vendorId } }
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found or not assigned to you" });
        const validStatuses = [Booking_1.BookingStatus.VENDOR_ENROUTE, Booking_1.BookingStatus.ARRIVED, Booking_1.BookingStatus.IN_PROGRESS, Booking_1.BookingStatus.SERVICE_ENDED, Booking_1.BookingStatus.COMPLETED];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }
        booking.status = status;
        await bookingRepo.save(booking);
        res.status(200).json({ message: `Status updated to ${status}`, booking });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating job status", error });
    }
};
exports.updateJobStatus = updateJobStatus;

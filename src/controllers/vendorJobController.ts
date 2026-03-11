import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Booking, BookingStatus } from "../entities/Booking";
import { Vendor } from "../entities/Vendor";

const bookingRepo = AppDataSource.getRepository(Booking);
const vendorRepo = AppDataSource.getRepository(Vendor);

export const getPendingJobs = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        // Simplification: In reality, jobs are matched geographically and broadcasted via Sockets.
        // Here we just fetch jobs strictly assigned or broadly unassigned (pending)
        const bookings = await bookingRepo.find({
            where: [
                { vendor: { id: vendorId }, status: BookingStatus.CONFIRMED },
                { vendor: undefined, status: BookingStatus.CONFIRMED }
            ]
        });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending jobs", error });
    }
};

export const acceptJob = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;

        const booking = await bookingRepo.findOneBy({ id: bookingId });
        if (!booking || booking.status !== BookingStatus.CONFIRMED) {
            return res.status(400).json({ message: "Booking no longer available" });
        }

        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        
        if (vendor?.status !== 'APPROVED') {
            return res.status(403).json({ message: "You must be an APPROVED vendor to accept jobs" });
        }

        booking.vendor = vendor!;
        booking.status = BookingStatus.VENDOR_ASSIGNED;
        await bookingRepo.save(booking);

        vendor!.consecutiveRejections = 0; // reset
        await vendorRepo.save(vendor!);

        res.status(200).json({ message: "Job accepted", booking });
    } catch (error) {
        res.status(500).json({ message: "Error accepting job", error });
    }
};

export const rejectJob = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;

        // In a real broadcast, rejection just hides it from this vendor.
        // If explicitly assigned:
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        vendor.consecutiveRejections += 1;
        if (vendor.consecutiveRejections >= 5) {
            vendor.isOnline = false; // block due to 5 rejections
        }
        await vendorRepo.save(vendor);

        res.status(200).json({ message: "Job rejected", consecutiveRejections: vendor.consecutiveRejections });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting job", error });
    }
};

export const updateJobStatus = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;
        const { status } = req.body;

        const booking = await bookingRepo.findOne({
            where: { id: bookingId, vendor: { id: vendorId } }
        });

        if (!booking) return res.status(404).json({ message: "Booking not found or not assigned to you" });

        const validStatuses = [BookingStatus.VENDOR_ENROUTE, BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS, BookingStatus.SERVICE_ENDED, BookingStatus.COMPLETED];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        booking.status = status;
        await bookingRepo.save(booking);

        res.status(200).json({ message: `Status updated to ${status}`, booking });
    } catch (error) {
        res.status(500).json({ message: "Error updating job status", error });
    }
};

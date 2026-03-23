import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Booking, BookingStatus, PaymentStatus } from "../entities/Booking";
import { BookingAddon } from "../entities/BookingAddon";
import { BookingTimeline } from "../entities/BookingTimeline";
import { Service } from "../entities/Service";
import { Vendor, VendorStatus } from "../entities/Vendor";

const bookingRepository = AppDataSource.getRepository(Booking);
const serviceRepository = AppDataSource.getRepository(Service);

// --- CREATION & PRICING ---

export const createBooking = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { serviceId, scheduledDate, scheduledTime, lat, lng, address, customerNotes, addons } = req.body;

        if (!serviceId || !scheduledDate || !scheduledTime || !address) {
            return res.status(400).json({ message: "serviceId, scheduledDate, scheduledTime, and address are required" });
        }

        const service = await serviceRepository.findOneBy({ id: serviceId });
        if (!service) return res.status(404).json({ message: "Service not found" });

        // Calculate initial total using base silver matching price
        let totalAmount = Number(service.silverPrice);
        const bookingAddons: BookingAddon[] = [];

        if (addons && Array.isArray(addons)) {
            for (const addon of addons) {
                // In reality, lookup prices from a Db Addon dictionary, but for now we accept the client's payload or mock it
                const price = Number(addon.price) || 0;
                totalAmount += price;

                const bookingAddon = new BookingAddon();
                bookingAddon.addonName = addon.name;
                bookingAddon.price = price;
                bookingAddons.push(bookingAddon);
            }
        }

        const booking = bookingRepository.create({
            user: { id: userId },
            service: { id: serviceId },
            scheduledDate,
            scheduledTime,
            status: BookingStatus.PENDING_PAYMENT,
            paymentStatus: PaymentStatus.PENDING,
            totalAmount,
            lat,
            lng,
            address,
            customerNotes,
            addons: bookingAddons
        });

        // Save booking 
        await bookingRepository.save(booking);

        // Record timeline
        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.PENDING_PAYMENT;
        timeline.description = "Booking created and waiting for payment";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(201).json({ message: "Booking created successfully", booking });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking", error });
    }
};

export const instantBooking = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { serviceId, lat, lng, address, customerNotes, addons } = req.body;

        if (!serviceId || !address || !lat || !lng) {
            return res.status(400).json({ message: "serviceId, address, lat, and lng are required for instant bookings" });
        }

        const service = await serviceRepository.findOneBy({ id: serviceId });
        if (!service) return res.status(404).json({ message: "Service not found" });

        // Calculate initial total
        let totalAmount = Number(service.silverPrice);
        const bookingAddons: BookingAddon[] = [];

        if (addons && Array.isArray(addons)) {
            for (const addon of addons) {
                const price = Number(addon.price) || 0;
                totalAmount += price;

                const bookingAddon = new BookingAddon();
                bookingAddon.addonName = addon.name;
                bookingAddon.price = price;
                bookingAddons.push(bookingAddon);
            }
        }

        // Generate immediate schedule times
        const now = new Date();
        const scheduledDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const scheduledTime = now.toTimeString().split(" ")[0]; // HH:MM:SS

        const booking = bookingRepository.create({
            user: { id: userId },
            service: { id: serviceId },
            scheduledDate,
            scheduledTime,
            status: BookingStatus.PENDING_PAYMENT,
            paymentStatus: PaymentStatus.PENDING,
            totalAmount,
            lat,
            lng,
            address,
            customerNotes,
            addons: bookingAddons
        });

        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.PENDING_PAYMENT;
        timeline.description = "Instant booking initialized and awaiting payment";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(201).json({
            message: "Instant booking created successfully",
            booking
        });
    } catch (error) {
        console.error("Error creating instant booking:", error);
        res.status(500).json({ message: "Error creating instant booking", error });
    }
};

export const estimatePrice = async (req: Request, res: Response) => {
    try {
        const { serviceId, addons } = req.query;

        if (!serviceId) {
            return res.status(400).json({ message: "serviceId is required for estimation" });
        }

        const service = await serviceRepository.findOneBy({ id: String(serviceId) });
        if (!service) return res.status(404).json({ message: "Service not found" });

        let basePrice = Number(service.silverPrice);
        let addonsTotal = 0;
        let breakdown: any[] = [{ item: service.name, price: basePrice }];

        if (addons && typeof addons === "string") {
            try {
                const parsedAddons = JSON.parse(addons);
                if (Array.isArray(parsedAddons)) {
                    for (const addon of parsedAddons) {
                        const price = Number(addon.price) || 0;
                        addonsTotal += price;
                        breakdown.push({ item: addon.name, price });
                    }
                }
            } catch (e) {
                // If it fails to parse, just ignore addons in the estimation
            }
        }

        const totalEstimatedAmount = basePrice + addonsTotal;

        res.status(200).json({
            message: "Price estimated successfully",
            estimation: {
                basePrice,
                addonsTotal,
                totalEstimatedAmount,
                breakdown
            }
        });
    } catch (error) {
        console.error("Error estimating price:", error);
        res.status(500).json({ message: "Error estimating price", error });
    }
};

import { In, Not } from "typeorm";

// --- RETRIEVAL ---

export const getUpcomingBookings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // Upcoming = Not completed or cancelled
        const upcomingStatuses = [
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.CONFIRMED,
            BookingStatus.VENDOR_ASSIGNED,
            BookingStatus.VENDOR_ENROUTE,
            BookingStatus.ARRIVED,
            BookingStatus.IN_PROGRESS
        ];

        const bookings = await bookingRepository.find({
            where: {
                user: { id: userId },
                status: In(upcomingStatuses)
            },
            order: { scheduledDate: "ASC", scheduledTime: "ASC" },
            relations: ["vendor", "service", "addons"]
        });

        res.status(200).json({ message: "Upcoming bookings fetched", bookings });
    } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        res.status(500).json({ message: "Error fetching upcoming bookings", error });
    }
};

export const getBookingHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // History = Finalized states
        const historyStatuses = [
            BookingStatus.SERVICE_ENDED,
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED
        ];

        const bookings = await bookingRepository.find({
            where: {
                user: { id: userId },
                status: In(historyStatuses)
            },
            order: { scheduledDate: "DESC", scheduledTime: "DESC" },
            relations: ["vendor", "service", "addons"]
        });

        res.status(200).json({ message: "Booking history fetched", bookings });
    } catch (error) {
        console.error("Error fetching booking history:", error);
        res.status(500).json({ message: "Error fetching booking history", error });
    }
};

export const getBookingById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const bookingId = req.params.id;

        const booking = await bookingRepository.findOne({
            where: { id: bookingId, user: { id: userId } },
            relations: ["vendor", "service", "addons", "timeline"]
        });

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        res.status(200).json({ message: "Booking details fetched", booking });
    } catch (error) {
        console.error("Error fetching booking by id:", error);
        res.status(500).json({ message: "Error fetching booking details", error });
    }
};

export const getBookingStatus = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.query;
        if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

        const booking = await bookingRepository.findOne({ where: { id: String(bookingId) }, select: ["id", "status"] });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        res.status(200).json({ status: booking.status });
    } catch (error) {
        res.status(500).json({ message: "Error fetching status", error });
    }
};

export const getBookingTimeline = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.query;
        if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

        const timeline = await AppDataSource.getRepository(BookingTimeline).find({
            where: { booking: { id: String(bookingId) } },
            order: { timestamp: "ASC" }
        });

        res.status(200).json({ timeline });
    } catch (error) {
        res.status(500).json({ message: "Error fetching timeline", error });
    }
};

export const getCustomerNotes = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.query;
        if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

        const booking = await bookingRepository.findOne({ where: { id: String(bookingId) }, select: ["customerNotes"] });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        res.status(200).json({ customerNotes: booking.customerNotes });
    } catch (error) {
        res.status(500).json({ message: "Error fetching notes", error });
    }
};

// --- LIFECYCLE & ACTIONS ---

export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId, transactionId } = req.body;
        // In a real scenario, we'd verify the transactionId with PayU here

        if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

        const booking = await bookingRepository.findOneBy({ id: bookingId });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== BookingStatus.PENDING_PAYMENT) {
            return res.status(400).json({ message: `Booking status is ${booking.status}, cannot confirm payment again` });
        }

        booking.status = BookingStatus.CONFIRMED;
        booking.paymentStatus = PaymentStatus.PAID;
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.CONFIRMED;
        timeline.description = `Payment verified (Txn: ${transactionId || "N/A"}). Booking confirmed and searching for vendors.`;
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        // --- Run Matchmaking Algorithm ---
        const io = req.app.get("io");
        if (io) {
            matchAndPingVendors(booking.id, io).catch(e => console.error("Matchmaking error:", e));
        }

        res.status(200).json({ message: "Booking confirmed successfully", booking });
    } catch (error) {

        console.error("Error confirming booking:", error);
        res.status(500).json({ message: "Error confirming booking", error });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { bookingId, reason } = req.body;

        if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

        const booking = await bookingRepository.findOne({
            where: { id: bookingId, user: { id: userId } }
        });

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Check if cancellable (not already complete or cancelled)
        if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
            return res.status(400).json({ message: `Cannot cancel a booking that is currently ${booking.status}` });
        }

        booking.status = BookingStatus.CANCELLED;
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.CANCELLED;
        timeline.description = reason ? `Cancelled: ${reason}` : "Booking was cancelled by the user";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        // TODO: Handle refunds if the payment was already PAID

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Error cancelling booking", error });
    }
};

export const rescheduleBooking = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { bookingId, newDate, newTime } = req.body;

        if (!bookingId || !newDate || !newTime) {
            return res.status(400).json({ message: "bookingId, newDate, and newTime are required" });
        }

        const booking = await bookingRepository.findOne({
            where: { id: bookingId, user: { id: userId } }
        });

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.IN_PROGRESS) {
            return res.status(400).json({ message: "Cannot reschedule a booking in its current state" });
        }

        booking.scheduledDate = newDate;
        booking.scheduledTime = newTime;

        // If it was already assigned to a vendor, we might want to drop the vendor so a new nearby vendor can be assigned for the new time, or we just keep it.
        // For now, let's keep the vendor but log it to the timeline.
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = booking.status; // status remains the same
        timeline.description = `Booking rescheduled to ${newDate} at ${newTime}`;
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(200).json({ message: "Booking rescheduled successfully", booking });
    } catch (error) {
        console.error("Error rescheduling booking:", error);
        res.status(500).json({ message: "Error rescheduling booking", error });
    }
};

export const reassignVendor = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
            return res.status(400).json({ message: "Cannot reassign vendor for a finalized booking" });
        }

        // Clear vendor and push back to CONFIRMED (searching status)
        booking.vendor = null;
        booking.status = BookingStatus.CONFIRMED;
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.CONFIRMED;
        timeline.description = "Vendor reassigned. Requesting a new vendor.";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(200).json({ message: "Vendor reassigned successfully", booking });
    } catch (error) {
        console.error("Error reassigning vendor:", error);
        res.status(500).json({ message: "Error reassigning vendor", error });
    }
};

export const rebook = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { previousBookingId, scheduledDate, scheduledTime } = req.body;

        if (!previousBookingId || !scheduledDate || !scheduledTime) {
            return res.status(400).json({ message: "previousBookingId, scheduledDate, and scheduledTime are required" });
        }

        const prevBooking = await bookingRepository.findOne({
            where: { id: previousBookingId, user: { id: userId } },
            relations: ["service", "addons"]
        });

        if (!prevBooking) return res.status(404).json({ message: "Previous booking not found" });

        // Copy details for new booking
        const newBooking = bookingRepository.create({
            user: { id: userId },
            service: prevBooking.service,
            scheduledDate,
            scheduledTime,
            status: BookingStatus.PENDING_PAYMENT,
            paymentStatus: PaymentStatus.PENDING,
            totalAmount: prevBooking.totalAmount, // Assuming prices haven't changed, or we'd recalculate here
            lat: prevBooking.lat,
            lng: prevBooking.lng,
            address: prevBooking.address,
            customerNotes: prevBooking.customerNotes
        });

        await bookingRepository.save(newBooking);

        // Copy addons
        for (const addon of prevBooking.addons) {
            const newAddon = new BookingAddon();
            newAddon.addonName = addon.addonName;
            newAddon.price = addon.price;
            newAddon.booking = newBooking;
            await AppDataSource.getRepository(BookingAddon).save(newAddon);
        }

        const timeline = new BookingTimeline();
        timeline.booking = newBooking;
        timeline.statusReached = BookingStatus.PENDING_PAYMENT;
        timeline.description = "Rebooked from previous service.";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(201).json({ message: "Rebooking initialized successfully", booking: newBooking });
    } catch (error) {
        console.error("Error rebooking:", error);
        res.status(500).json({ message: "Error rebooking", error });
    }
};

// --- EXECUTION & REAL-TIME ---

export const assignVendor = async (req: Request, res: Response) => {
    try {
        const { bookingId, vendorId } = req.body;

        if (!bookingId || !vendorId) return res.status(400).json({ message: "bookingId and vendorId are required" });

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== BookingStatus.CONFIRMED) {
            return res.status(400).json({ message: `Booking must be CONFIRMED to assign a vendor. Current status is ${booking.status}` });
        }

        booking.status = BookingStatus.VENDOR_ASSIGNED;
        booking.vendor = { id: vendorId } as any;
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.VENDOR_ASSIGNED;
        timeline.description = "Vendor has been assigned to the booking";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(200).json({ message: "Vendor assigned successfully", booking });
    } catch (error) {
        console.error("Error assigning vendor:", error);
        res.status(500).json({ message: "Error assigning vendor", error });
    }
};

export const markEnRoute = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== BookingStatus.VENDOR_ASSIGNED) {
            return res.status(400).json({ message: `Cannot mark en route. Expected status VENDOR_ASSIGNED but got ${booking.status}` });
        }

        booking.status = BookingStatus.VENDOR_ENROUTE;
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.VENDOR_ENROUTE;
        timeline.description = "Vendor is on the way";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(200).json({ message: "Vendor marked as en route", booking });
    } catch (error) {
        console.error("Error marking en route:", error);
        res.status(500).json({ message: "Error marking en route", error });
    }
};

export const markArrived = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== BookingStatus.VENDOR_ENROUTE) {
            return res.status(400).json({ message: `Cannot mark arrived. Expected status VENDOR_ENROUTE but got ${booking.status}` });
        }

        booking.status = BookingStatus.ARRIVED;
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.ARRIVED;
        timeline.description = "Vendor has arrived at the location";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(200).json({ message: "Vendor marked as arrived", booking });
    } catch (error) {
        console.error("Error marking arrived:", error);
        res.status(500).json({ message: "Error marking arrived", error });
    }
};

export const startService = async (req: Request, res: Response) => {
    try {
        const vendorId = (req as any).user.id; // Assuming vendor is calling this
        const { bookingId } = req.body;

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== BookingStatus.ARRIVED) {
            return res.status(400).json({ message: `Cannot start service. Expected status ARRIVED but got ${booking.status}` });
        }

        booking.status = BookingStatus.IN_PROGRESS;
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.IN_PROGRESS;
        timeline.description = "Vendor has started the service";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(200).json({ message: "Service started", booking });
    } catch (error) {
        console.error("Error starting service:", error);
        res.status(500).json({ message: "Error starting service", error });
    }
};

export const endService = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== BookingStatus.IN_PROGRESS) {
            return res.status(400).json({ message: `Cannot end service from status ${booking.status}` });
        }

        booking.status = BookingStatus.SERVICE_ENDED;
        await bookingRepository.save(booking);

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.SERVICE_ENDED;
        timeline.description = "Vendor has completed the service execution";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(200).json({ message: "Service ended", booking });
    } catch (error) {
        console.error("Error ending service:", error);
        res.status(500).json({ message: "Error ending service", error });
    }
};

export const completeBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== BookingStatus.SERVICE_ENDED) {
            return res.status(400).json({ message: `Expected SERVICE_ENDED, but status is ${booking.status}` });
        }

        booking.status = BookingStatus.COMPLETED;
        await bookingRepository.save(booking);

        // Here we would typically calculate revenue share and add to vendor's wallet

        const timeline = new BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = BookingStatus.COMPLETED;
        timeline.description = "Booking finalized and closed";
        await AppDataSource.getRepository(BookingTimeline).save(timeline);

        res.status(200).json({ message: "Booking completed and finalized", booking });
    } catch (error) {
        console.error("Error completing booking:", error);
        res.status(500).json({ message: "Error completing booking", error });
    }
};

export const getVendorLocation = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.query;
        if (!vendorId) return res.status(400).json({ message: "vendorId is required" });

        // In a complete implementation, this would fetch from Redis
        // For now, we mock a response
        res.status(200).json({
            vendorId,
            lat: 28.6139,
            lng: 77.2090,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching location", error });
    }
};

// --- FINANCIALS: ADDONS, TIPS, INVOICES ---

export const addAddon = async (req: Request, res: Response) => {
    try {
        const { bookingId, addonName, price } = req.body;

        if (!bookingId || !addonName || price === undefined) {
            return res.status(400).json({ message: "bookingId, addonName, and price are required" });
        }

        const booking = await bookingRepository.findOne({ where: { id: bookingId }, relations: ["addons"] });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Add the addon
        const newAddon = new BookingAddon();
        newAddon.addonName = addonName;
        newAddon.price = Number(price);
        newAddon.booking = booking;

        await AppDataSource.getRepository(BookingAddon).save(newAddon);

        // Update booking total
        booking.totalAmount = Number(booking.totalAmount) + Number(price);
        await bookingRepository.save(booking);

        res.status(201).json({ message: "Addon added successfully", booking });
    } catch (error) {
        console.error("Error adding addon:", error);
        res.status(500).json({ message: "Error adding addon", error });
    }
};

export const removeAddon = async (req: Request, res: Response) => {
    try {
        const { bookingId, addonId } = req.body;

        if (!bookingId || !addonId) {
            return res.status(400).json({ message: "bookingId and addonId are required" });
        }

        const booking = await bookingRepository.findOne({ where: { id: bookingId }, relations: ["addons"] });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const addonRepository = AppDataSource.getRepository(BookingAddon);
        const addon = await addonRepository.findOne({ where: { id: addonId, booking: { id: bookingId } } });

        if (!addon) return res.status(404).json({ message: "Addon not found on this booking" });

        // Remove addon
        await addonRepository.remove(addon);

        // Update booking total
        booking.totalAmount = Number(booking.totalAmount) - Number(addon.price);
        await bookingRepository.save(booking);

        res.status(200).json({ message: "Addon removed successfully", booking });
    } catch (error) {
        console.error("Error removing addon:", error);
        res.status(500).json({ message: "Error removing addon", error });
    }
};

export const tipVendor = async (req: Request, res: Response) => {
    try {
        const { bookingId, tipAmount } = req.body;

        if (!bookingId || tipAmount === undefined) {
            return res.status(400).json({ message: "bookingId and tipAmount are required" });
        }

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.SERVICE_ENDED) {
            return res.status(400).json({ message: "Can only tip after service has ended" });
        }

        booking.tipAmount = Number(tipAmount);
        await bookingRepository.save(booking);

        res.status(200).json({ message: "Tip added successfully", tipAmount: booking.tipAmount });
    } catch (error) {
        console.error("Error adding tip:", error);
        res.status(500).json({ message: "Error adding tip", error });
    }
};

export const getInvoice = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.query;

        if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

        const booking = await bookingRepository.findOne({
            where: { id: String(bookingId) },
            relations: ["user", "vendor", "service", "addons"]
        });

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const basePrice = Number(booking.service.silverPrice);
        const addonsTotal = booking.addons.reduce((sum, a) => sum + Number(a.price), 0);
        const tax = (basePrice + addonsTotal) * 0.18; // 18% GST mock
        const platformFee = 15.00; // Mock flat fee

        const invoice = {
            invoiceId: `INV-${booking.id.split("-")[0].toUpperCase()}`,
            date: new Date(),
            customer: booking.user.name,
            vendor: booking.vendor ? booking.vendor.name : "Unassigned",
            serviceName: booking.service.name,
            basePrice,
            addons: booking.addons.map(a => ({ name: a.addonName, price: Number(a.price) })),
            subtotal: basePrice + addonsTotal,
            tax,
            platformFee,
            tip: Number(booking.tipAmount),
            totalPaid: basePrice + addonsTotal + tax + platformFee + Number(booking.tipAmount),
            paymentStatus: booking.paymentStatus
        };

        res.status(200).json({ invoice });
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ message: "Error generating invoice", error });
    }
};

// --- MATCHMAKING ENGINE ---

async function matchAndPingVendors(bookingId: string, io: any) {
    try {
        const booking = await bookingRepository.findOne({ 
            where: { id: bookingId }, 
            relations: ["service", "service.category"] 
        });

        if (!booking || !booking.lat || !booking.lng || !booking.service.category) return;

        console.log(`[Matchmaking] Finding vendors for Booking ${booking.id}...`);

        const vendorRepo = AppDataSource.getRepository(Vendor);

        // --- DEBUG LOGGING ---
        console.log(`[DEBUG] Booking Req -> Lat: ${booking.lat}, Lng: ${booking.lng}, CategoryId: ${booking.service.category?.id}, ServiceId: ${booking.service.id}`);
        const debugVendors = await vendorRepo.createQueryBuilder("vendor")
            .leftJoinAndSelect("vendor.serviceCategories", "category")
            .getMany();
        
        for (const dv of debugVendors) {
            console.log(`[DEBUG] Vendor ${dv.name} (${dv.id}) -> Status: ${dv.status}, isOnline: ${dv.isOnline}, Location: ${dv.location}`);
            console.log(`        Categories: ${dv.serviceCategories?.map(c => c.id).join(", ")}`);
        }
        // --- END DEBUG LOGGING ---

        // 1. Proximity: Within 10km radius
        // 2. Status: APPROVED
        // 3. Online: isOnline = true
        // 4. Qualified: Has requested serviceId
        // 5. Availability: Not currently busy

        const nearbyVendors = await vendorRepo.createQueryBuilder("vendor")
            .leftJoin("vendor.serviceCategories", "category")
            .where("vendor.status = :status", { status: VendorStatus.APPROVED })
            .andWhere("vendor.isOnline = :isOnline", { isOnline: true })
            .andWhere("category.id = :categoryId", { categoryId: booking.service.category.id })
            .andWhere(`ST_DistanceSphere(vendor.location, ST_SetSRID(ST_Point(:lng, :lat), 4326)) <= :radius`, { 
                lng: booking.lng, 
                lat: booking.lat, 
                radius: 10000 // 10 km 
            })
            // Subquery to ensure they are NOT currently busy with an active job
            .andWhere((qb) => {
                const subQuery = qb.subQuery()
                    .select("b.vendorId")
                    .from(Booking, "b")
                    .where("b.vendorId IS NOT NULL")
                    .andWhere("b.status IN (:...busyStatuses)")
                    .getQuery();
                return "vendor.id NOT IN " + subQuery;
            })
            .setParameter("busyStatuses", [
                BookingStatus.VENDOR_ASSIGNED, 
                BookingStatus.VENDOR_ENROUTE, 
                BookingStatus.ARRIVED, 
                BookingStatus.IN_PROGRESS
            ])
            .getMany();

        if (nearbyVendors.length > 0) {
            console.log(`[Matchmaking] Success! Found ${nearbyVendors.length} eligible vendors within 10km.`);
            console.log(`[Matchmaking] Matched Vendors: ${nearbyVendors.map(v => v.name).join(', ')}`);
            
            // Broadcast the ping to Vendor Apps
            io.emit("vendor:new_job_alert", {
                bookingId: booking.id,
                serviceName: booking.service.name,
                lat: booking.lat,
                lng: booking.lng,
                address: booking.address,
                assignedVendors: nearbyVendors.map(v => v.id) // App filters if their ID is in this array
            });
        } else {
            console.log(`[Matchmaking] Failed. No online, approved, and available vendors found within 10km for service ${booking.service.name}.`);
        }
    } catch (error) {
        console.error("[Matchmaking] Critical Error:", error);
    }
}

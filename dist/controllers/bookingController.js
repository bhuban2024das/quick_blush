"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoice = exports.tipVendor = exports.removeAddon = exports.addAddon = exports.getVendorLocation = exports.completeBooking = exports.endService = exports.startService = exports.markArrived = exports.markEnRoute = exports.assignVendor = exports.rebook = exports.reassignVendor = exports.rescheduleBooking = exports.cancelBooking = exports.confirmBooking = exports.getCustomerNotes = exports.getBookingTimeline = exports.getBookingStatus = exports.getBookingById = exports.getBookingHistory = exports.getUpcomingBookings = exports.estimatePrice = exports.instantBooking = exports.createBooking = void 0;
const data_source_1 = require("../config/data-source");
const Booking_1 = require("../entities/Booking");
const BookingAddon_1 = require("../entities/BookingAddon");
const BookingTimeline_1 = require("../entities/BookingTimeline");
const Service_1 = require("../entities/Service");
const Vendor_1 = require("../entities/Vendor");
const bookingRepository = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
const serviceRepository = data_source_1.AppDataSource.getRepository(Service_1.Service);
// --- CREATION & PRICING ---
const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceId, scheduledDate, scheduledTime, lat, lng, address, customerNotes, addons } = req.body;
        if (!serviceId || !scheduledDate || !scheduledTime || !address) {
            return res.status(400).json({ message: "serviceId, scheduledDate, scheduledTime, and address are required" });
        }
        const service = await serviceRepository.findOneBy({ id: serviceId });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        // Calculate initial total using base silver matching price
        let totalAmount = Number(service.silverPrice);
        const bookingAddons = [];
        if (addons && Array.isArray(addons)) {
            for (const addon of addons) {
                // In reality, lookup prices from a Db Addon dictionary, but for now we accept the client's payload or mock it
                const price = Number(addon.price) || 0;
                totalAmount += price;
                const bookingAddon = new BookingAddon_1.BookingAddon();
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
            status: Booking_1.BookingStatus.PENDING_PAYMENT,
            paymentStatus: Booking_1.PaymentStatus.PENDING,
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
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.PENDING_PAYMENT;
        timeline.description = "Booking created and waiting for payment";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(201).json({ message: "Booking created successfully", booking });
    }
    catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking", error });
    }
};
exports.createBooking = createBooking;
const instantBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceId, lat, lng, address, customerNotes, addons } = req.body;
        if (!serviceId || !address || !lat || !lng) {
            return res.status(400).json({ message: "serviceId, address, lat, and lng are required for instant bookings" });
        }
        const service = await serviceRepository.findOneBy({ id: serviceId });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        // Calculate initial total
        let totalAmount = Number(service.silverPrice);
        const bookingAddons = [];
        if (addons && Array.isArray(addons)) {
            for (const addon of addons) {
                const price = Number(addon.price) || 0;
                totalAmount += price;
                const bookingAddon = new BookingAddon_1.BookingAddon();
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
            status: Booking_1.BookingStatus.PENDING_PAYMENT,
            paymentStatus: Booking_1.PaymentStatus.PENDING,
            totalAmount,
            lat,
            lng,
            address,
            customerNotes,
            addons: bookingAddons
        });
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.PENDING_PAYMENT;
        timeline.description = "Instant booking initialized and awaiting payment";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(201).json({
            message: "Instant booking created successfully",
            booking
        });
    }
    catch (error) {
        console.error("Error creating instant booking:", error);
        res.status(500).json({ message: "Error creating instant booking", error });
    }
};
exports.instantBooking = instantBooking;
const estimatePrice = async (req, res) => {
    try {
        const { serviceId, addons } = req.query;
        if (!serviceId) {
            return res.status(400).json({ message: "serviceId is required for estimation" });
        }
        const service = await serviceRepository.findOneBy({ id: String(serviceId) });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        let basePrice = Number(service.silverPrice);
        let addonsTotal = 0;
        let breakdown = [{ item: service.name, price: basePrice }];
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
            }
            catch (e) {
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
    }
    catch (error) {
        console.error("Error estimating price:", error);
        res.status(500).json({ message: "Error estimating price", error });
    }
};
exports.estimatePrice = estimatePrice;
const typeorm_1 = require("typeorm");
// --- RETRIEVAL ---
const getUpcomingBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        // Upcoming = Not completed or cancelled
        const upcomingStatuses = [
            Booking_1.BookingStatus.PENDING_PAYMENT,
            Booking_1.BookingStatus.CONFIRMED,
            Booking_1.BookingStatus.VENDOR_ASSIGNED,
            Booking_1.BookingStatus.VENDOR_ENROUTE,
            Booking_1.BookingStatus.ARRIVED,
            Booking_1.BookingStatus.IN_PROGRESS
        ];
        const bookings = await bookingRepository.find({
            where: {
                user: { id: userId },
                status: (0, typeorm_1.In)(upcomingStatuses)
            },
            order: { scheduledDate: "ASC", scheduledTime: "ASC" },
            relations: ["vendor", "service", "addons"]
        });
        res.status(200).json({ message: "Upcoming bookings fetched", bookings });
    }
    catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        res.status(500).json({ message: "Error fetching upcoming bookings", error });
    }
};
exports.getUpcomingBookings = getUpcomingBookings;
const getBookingHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        // History = Finalized states
        const historyStatuses = [
            Booking_1.BookingStatus.SERVICE_ENDED,
            Booking_1.BookingStatus.COMPLETED,
            Booking_1.BookingStatus.CANCELLED
        ];
        const bookings = await bookingRepository.find({
            where: {
                user: { id: userId },
                status: (0, typeorm_1.In)(historyStatuses)
            },
            order: { scheduledDate: "DESC", scheduledTime: "DESC" },
            relations: ["vendor", "service", "addons"]
        });
        res.status(200).json({ message: "Booking history fetched", bookings });
    }
    catch (error) {
        console.error("Error fetching booking history:", error);
        res.status(500).json({ message: "Error fetching booking history", error });
    }
};
exports.getBookingHistory = getBookingHistory;
const getBookingById = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookingId = req.params.id;
        const booking = await bookingRepository.findOne({
            where: { id: bookingId, user: { id: userId } },
            relations: ["vendor", "service", "addons", "timeline"]
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        res.status(200).json({ message: "Booking details fetched", booking });
    }
    catch (error) {
        console.error("Error fetching booking by id:", error);
        res.status(500).json({ message: "Error fetching booking details", error });
    }
};
exports.getBookingById = getBookingById;
const getBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.query;
        if (!bookingId)
            return res.status(400).json({ message: "bookingId is required" });
        const booking = await bookingRepository.findOne({ where: { id: String(bookingId) }, select: ["id", "status"] });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        res.status(200).json({ status: booking.status });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching status", error });
    }
};
exports.getBookingStatus = getBookingStatus;
const getBookingTimeline = async (req, res) => {
    try {
        const { bookingId } = req.query;
        if (!bookingId)
            return res.status(400).json({ message: "bookingId is required" });
        const timeline = await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).find({
            where: { booking: { id: String(bookingId) } },
            order: { timestamp: "ASC" }
        });
        res.status(200).json({ timeline });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching timeline", error });
    }
};
exports.getBookingTimeline = getBookingTimeline;
const getCustomerNotes = async (req, res) => {
    try {
        const { bookingId } = req.query;
        if (!bookingId)
            return res.status(400).json({ message: "bookingId is required" });
        const booking = await bookingRepository.findOne({ where: { id: String(bookingId) }, select: ["customerNotes"] });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        res.status(200).json({ customerNotes: booking.customerNotes });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching notes", error });
    }
};
exports.getCustomerNotes = getCustomerNotes;
// --- LIFECYCLE & ACTIONS ---
const confirmBooking = async (req, res) => {
    try {
        const { bookingId, transactionId } = req.body;
        // In a real scenario, we'd verify the transactionId with PayU here
        if (!bookingId)
            return res.status(400).json({ message: "bookingId is required" });
        const booking = await bookingRepository.findOneBy({ id: bookingId });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== Booking_1.BookingStatus.PENDING_PAYMENT) {
            return res.status(400).json({ message: `Booking status is ${booking.status}, cannot confirm payment again` });
        }
        booking.status = Booking_1.BookingStatus.CONFIRMED;
        booking.paymentStatus = Booking_1.PaymentStatus.PAID;
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.CONFIRMED;
        timeline.description = `Payment verified (Txn: ${transactionId || "N/A"}). Booking confirmed and searching for vendors.`;
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        // --- Run Matchmaking Algorithm ---
        const io = req.app.get("io");
        if (io) {
            matchAndPingVendors(booking.id, io).catch(e => console.error("Matchmaking error:", e));
        }
        res.status(200).json({ message: "Booking confirmed successfully", booking });
    }
    catch (error) {
        console.error("Error confirming booking:", error);
        res.status(500).json({ message: "Error confirming booking", error });
    }
};
exports.confirmBooking = confirmBooking;
const cancelBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId, reason } = req.body;
        if (!bookingId)
            return res.status(400).json({ message: "bookingId is required" });
        const booking = await bookingRepository.findOne({
            where: { id: bookingId, user: { id: userId } }
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        // Check if cancellable (not already complete or cancelled)
        if (booking.status === Booking_1.BookingStatus.COMPLETED || booking.status === Booking_1.BookingStatus.CANCELLED) {
            return res.status(400).json({ message: `Cannot cancel a booking that is currently ${booking.status}` });
        }
        booking.status = Booking_1.BookingStatus.CANCELLED;
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.CANCELLED;
        timeline.description = reason ? `Cancelled: ${reason}` : "Booking was cancelled by the user";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        // TODO: Handle refunds if the payment was already PAID
        res.status(200).json({ message: "Booking cancelled successfully", booking });
    }
    catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Error cancelling booking", error });
    }
};
exports.cancelBooking = cancelBooking;
const rescheduleBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId, newDate, newTime } = req.body;
        if (!bookingId || !newDate || !newTime) {
            return res.status(400).json({ message: "bookingId, newDate, and newTime are required" });
        }
        const booking = await bookingRepository.findOne({
            where: { id: bookingId, user: { id: userId } }
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status === Booking_1.BookingStatus.COMPLETED || booking.status === Booking_1.BookingStatus.CANCELLED || booking.status === Booking_1.BookingStatus.IN_PROGRESS) {
            return res.status(400).json({ message: "Cannot reschedule a booking in its current state" });
        }
        booking.scheduledDate = newDate;
        booking.scheduledTime = newTime;
        // If it was already assigned to a vendor, we might want to drop the vendor so a new nearby vendor can be assigned for the new time, or we just keep it.
        // For now, let's keep the vendor but log it to the timeline.
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = booking.status; // status remains the same
        timeline.description = `Booking rescheduled to ${newDate} at ${newTime}`;
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(200).json({ message: "Booking rescheduled successfully", booking });
    }
    catch (error) {
        console.error("Error rescheduling booking:", error);
        res.status(500).json({ message: "Error rescheduling booking", error });
    }
};
exports.rescheduleBooking = rescheduleBooking;
const reassignVendor = async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId)
            return res.status(400).json({ message: "bookingId is required" });
        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status === Booking_1.BookingStatus.COMPLETED || booking.status === Booking_1.BookingStatus.CANCELLED) {
            return res.status(400).json({ message: "Cannot reassign vendor for a finalized booking" });
        }
        // Clear vendor and push back to CONFIRMED (searching status)
        booking.vendor = null;
        booking.status = Booking_1.BookingStatus.CONFIRMED;
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.CONFIRMED;
        timeline.description = "Vendor reassigned. Requesting a new vendor.";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(200).json({ message: "Vendor reassigned successfully", booking });
    }
    catch (error) {
        console.error("Error reassigning vendor:", error);
        res.status(500).json({ message: "Error reassigning vendor", error });
    }
};
exports.reassignVendor = reassignVendor;
const rebook = async (req, res) => {
    try {
        const userId = req.user.id;
        const { previousBookingId, scheduledDate, scheduledTime } = req.body;
        if (!previousBookingId || !scheduledDate || !scheduledTime) {
            return res.status(400).json({ message: "previousBookingId, scheduledDate, and scheduledTime are required" });
        }
        const prevBooking = await bookingRepository.findOne({
            where: { id: previousBookingId, user: { id: userId } },
            relations: ["service", "addons"]
        });
        if (!prevBooking)
            return res.status(404).json({ message: "Previous booking not found" });
        // Copy details for new booking
        const newBooking = bookingRepository.create({
            user: { id: userId },
            service: prevBooking.service,
            scheduledDate,
            scheduledTime,
            status: Booking_1.BookingStatus.PENDING_PAYMENT,
            paymentStatus: Booking_1.PaymentStatus.PENDING,
            totalAmount: prevBooking.totalAmount, // Assuming prices haven't changed, or we'd recalculate here
            lat: prevBooking.lat,
            lng: prevBooking.lng,
            address: prevBooking.address,
            customerNotes: prevBooking.customerNotes
        });
        await bookingRepository.save(newBooking);
        // Copy addons
        for (const addon of prevBooking.addons) {
            const newAddon = new BookingAddon_1.BookingAddon();
            newAddon.addonName = addon.addonName;
            newAddon.price = addon.price;
            newAddon.booking = newBooking;
            await data_source_1.AppDataSource.getRepository(BookingAddon_1.BookingAddon).save(newAddon);
        }
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = newBooking;
        timeline.statusReached = Booking_1.BookingStatus.PENDING_PAYMENT;
        timeline.description = "Rebooked from previous service.";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(201).json({ message: "Rebooking initialized successfully", booking: newBooking });
    }
    catch (error) {
        console.error("Error rebooking:", error);
        res.status(500).json({ message: "Error rebooking", error });
    }
};
exports.rebook = rebook;
// --- EXECUTION & REAL-TIME ---
const assignVendor = async (req, res) => {
    try {
        const { bookingId, vendorId } = req.body;
        if (!bookingId || !vendorId)
            return res.status(400).json({ message: "bookingId and vendorId are required" });
        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== Booking_1.BookingStatus.CONFIRMED) {
            return res.status(400).json({ message: `Booking must be CONFIRMED to assign a vendor. Current status is ${booking.status}` });
        }
        booking.status = Booking_1.BookingStatus.VENDOR_ASSIGNED;
        booking.vendor = { id: vendorId };
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.VENDOR_ASSIGNED;
        timeline.description = "Vendor has been assigned to the booking";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(200).json({ message: "Vendor assigned successfully", booking });
    }
    catch (error) {
        console.error("Error assigning vendor:", error);
        res.status(500).json({ message: "Error assigning vendor", error });
    }
};
exports.assignVendor = assignVendor;
const markEnRoute = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== Booking_1.BookingStatus.VENDOR_ASSIGNED) {
            return res.status(400).json({ message: `Cannot mark en route. Expected status VENDOR_ASSIGNED but got ${booking.status}` });
        }
        booking.status = Booking_1.BookingStatus.VENDOR_ENROUTE;
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.VENDOR_ENROUTE;
        timeline.description = "Vendor is on the way";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(200).json({ message: "Vendor marked as en route", booking });
    }
    catch (error) {
        console.error("Error marking en route:", error);
        res.status(500).json({ message: "Error marking en route", error });
    }
};
exports.markEnRoute = markEnRoute;
const markArrived = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== Booking_1.BookingStatus.VENDOR_ENROUTE) {
            return res.status(400).json({ message: `Cannot mark arrived. Expected status VENDOR_ENROUTE but got ${booking.status}` });
        }
        booking.status = Booking_1.BookingStatus.ARRIVED;
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.ARRIVED;
        timeline.description = "Vendor has arrived at the location";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(200).json({ message: "Vendor marked as arrived", booking });
    }
    catch (error) {
        console.error("Error marking arrived:", error);
        res.status(500).json({ message: "Error marking arrived", error });
    }
};
exports.markArrived = markArrived;
const startService = async (req, res) => {
    try {
        const vendorId = req.user.id; // Assuming vendor is calling this
        const { bookingId } = req.body;
        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== Booking_1.BookingStatus.ARRIVED) {
            return res.status(400).json({ message: `Cannot start service. Expected status ARRIVED but got ${booking.status}` });
        }
        booking.status = Booking_1.BookingStatus.IN_PROGRESS;
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.IN_PROGRESS;
        timeline.description = "Vendor has started the service";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(200).json({ message: "Service started", booking });
    }
    catch (error) {
        console.error("Error starting service:", error);
        res.status(500).json({ message: "Error starting service", error });
    }
};
exports.startService = startService;
const endService = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== Booking_1.BookingStatus.IN_PROGRESS) {
            return res.status(400).json({ message: `Cannot end service from status ${booking.status}` });
        }
        booking.status = Booking_1.BookingStatus.SERVICE_ENDED;
        await bookingRepository.save(booking);
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.SERVICE_ENDED;
        timeline.description = "Vendor has completed the service execution";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(200).json({ message: "Service ended", booking });
    }
    catch (error) {
        console.error("Error ending service:", error);
        res.status(500).json({ message: "Error ending service", error });
    }
};
exports.endService = endService;
const completeBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== Booking_1.BookingStatus.SERVICE_ENDED) {
            return res.status(400).json({ message: `Expected SERVICE_ENDED, but status is ${booking.status}` });
        }
        booking.status = Booking_1.BookingStatus.COMPLETED;
        await bookingRepository.save(booking);
        // Here we would typically calculate revenue share and add to vendor's wallet
        const timeline = new BookingTimeline_1.BookingTimeline();
        timeline.booking = booking;
        timeline.statusReached = Booking_1.BookingStatus.COMPLETED;
        timeline.description = "Booking finalized and closed";
        await data_source_1.AppDataSource.getRepository(BookingTimeline_1.BookingTimeline).save(timeline);
        res.status(200).json({ message: "Booking completed and finalized", booking });
    }
    catch (error) {
        console.error("Error completing booking:", error);
        res.status(500).json({ message: "Error completing booking", error });
    }
};
exports.completeBooking = completeBooking;
const getVendorLocation = async (req, res) => {
    try {
        const { vendorId } = req.query;
        if (!vendorId)
            return res.status(400).json({ message: "vendorId is required" });
        // In a complete implementation, this would fetch from Redis
        // For now, we mock a response
        res.status(200).json({
            vendorId,
            lat: 28.6139,
            lng: 77.2090,
            timestamp: new Date()
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching location", error });
    }
};
exports.getVendorLocation = getVendorLocation;
// --- FINANCIALS: ADDONS, TIPS, INVOICES ---
const addAddon = async (req, res) => {
    try {
        const { bookingId, addonName, price } = req.body;
        if (!bookingId || !addonName || price === undefined) {
            return res.status(400).json({ message: "bookingId, addonName, and price are required" });
        }
        const booking = await bookingRepository.findOne({ where: { id: bookingId }, relations: ["addons"] });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        // Add the addon
        const newAddon = new BookingAddon_1.BookingAddon();
        newAddon.addonName = addonName;
        newAddon.price = Number(price);
        newAddon.booking = booking;
        await data_source_1.AppDataSource.getRepository(BookingAddon_1.BookingAddon).save(newAddon);
        // Update booking total
        booking.totalAmount = Number(booking.totalAmount) + Number(price);
        await bookingRepository.save(booking);
        res.status(201).json({ message: "Addon added successfully", booking });
    }
    catch (error) {
        console.error("Error adding addon:", error);
        res.status(500).json({ message: "Error adding addon", error });
    }
};
exports.addAddon = addAddon;
const removeAddon = async (req, res) => {
    try {
        const { bookingId, addonId } = req.body;
        if (!bookingId || !addonId) {
            return res.status(400).json({ message: "bookingId and addonId are required" });
        }
        const booking = await bookingRepository.findOne({ where: { id: bookingId }, relations: ["addons"] });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        const addonRepository = data_source_1.AppDataSource.getRepository(BookingAddon_1.BookingAddon);
        const addon = await addonRepository.findOne({ where: { id: addonId, booking: { id: bookingId } } });
        if (!addon)
            return res.status(404).json({ message: "Addon not found on this booking" });
        // Remove addon
        await addonRepository.remove(addon);
        // Update booking total
        booking.totalAmount = Number(booking.totalAmount) - Number(addon.price);
        await bookingRepository.save(booking);
        res.status(200).json({ message: "Addon removed successfully", booking });
    }
    catch (error) {
        console.error("Error removing addon:", error);
        res.status(500).json({ message: "Error removing addon", error });
    }
};
exports.removeAddon = removeAddon;
const tipVendor = async (req, res) => {
    try {
        const { bookingId, tipAmount } = req.body;
        if (!bookingId || tipAmount === undefined) {
            return res.status(400).json({ message: "bookingId and tipAmount are required" });
        }
        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== Booking_1.BookingStatus.COMPLETED && booking.status !== Booking_1.BookingStatus.SERVICE_ENDED) {
            return res.status(400).json({ message: "Can only tip after service has ended" });
        }
        booking.tipAmount = Number(tipAmount);
        await bookingRepository.save(booking);
        res.status(200).json({ message: "Tip added successfully", tipAmount: booking.tipAmount });
    }
    catch (error) {
        console.error("Error adding tip:", error);
        res.status(500).json({ message: "Error adding tip", error });
    }
};
exports.tipVendor = tipVendor;
const getInvoice = async (req, res) => {
    try {
        const { bookingId } = req.query;
        if (!bookingId)
            return res.status(400).json({ message: "bookingId is required" });
        const booking = await bookingRepository.findOne({
            where: { id: String(bookingId) },
            relations: ["user", "vendor", "service", "addons"]
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
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
    }
    catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ message: "Error generating invoice", error });
    }
};
exports.getInvoice = getInvoice;
// --- MATCHMAKING ENGINE ---
async function matchAndPingVendors(bookingId, io) {
    try {
        const booking = await bookingRepository.findOne({
            where: { id: bookingId },
            relations: ["service"]
        });
        if (!booking || !booking.lat || !booking.lng)
            return;
        console.log(`[Matchmaking] Finding vendors for Booking ${booking.id}...`);
        const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
        // 1. Proximity: Within 10km radius
        // 2. Status: APPROVED
        // 3. Online: isOnline = true
        // 4. Qualified: Has requested serviceId
        // 5. Availability: Not currently busy
        const nearbyVendors = await vendorRepo.createQueryBuilder("vendor")
            .leftJoin("vendor.services", "service")
            .where("vendor.status = :status", { status: Vendor_1.VendorStatus.APPROVED })
            .andWhere("vendor.isOnline = :isOnline", { isOnline: true })
            .andWhere("service.id = :serviceId", { serviceId: booking.service.id })
            .andWhere(`ST_DistanceSphere(vendor.location, ST_SetSRID(ST_Point(:lng, :lat), 4326)) <= :radius`, {
            lng: booking.lng,
            lat: booking.lat,
            radius: 10000 // 10 km 
        })
            // Subquery to ensure they are NOT currently busy with an active job
            .andWhere((qb) => {
            const subQuery = qb.subQuery()
                .select("b.vendorId")
                .from(Booking_1.Booking, "b")
                .where("b.vendorId IS NOT NULL")
                .andWhere("b.status IN (:...busyStatuses)")
                .getQuery();
            return "vendor.id NOT IN " + subQuery;
        })
            .setParameter("busyStatuses", [
            Booking_1.BookingStatus.VENDOR_ASSIGNED,
            Booking_1.BookingStatus.VENDOR_ENROUTE,
            Booking_1.BookingStatus.ARRIVED,
            Booking_1.BookingStatus.IN_PROGRESS
        ])
            .getMany();
        if (nearbyVendors.length > 0) {
            console.log(`[Matchmaking] Success! Found ${nearbyVendors.length} eligible vendors within 10km.`);
            // Broadcast the ping to Vendor Apps
            io.emit("vendor:new_job_alert", {
                bookingId: booking.id,
                serviceName: booking.service.name,
                lat: booking.lat,
                lng: booking.lng,
                address: booking.address,
                assignedVendors: nearbyVendors.map(v => v.id) // App filters if their ID is in this array
            });
        }
        else {
            console.log(`[Matchmaking] Failed. No online, approved, and available vendors found within 10km for service ${booking.service.name}.`);
        }
    }
    catch (error) {
        console.error("[Matchmaking] Critical Error:", error);
    }
}

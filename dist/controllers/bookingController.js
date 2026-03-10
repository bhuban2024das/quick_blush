"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.getUserBookings = exports.createBooking = void 0;
const data_source_1 = require("../config/data-source");
const Booking_1 = require("../entities/Booking");
const Service_1 = require("../entities/Service");
const typeorm_1 = require("typeorm");
const Vendor_1 = require("../entities/Vendor");
const bookingRepo = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
const serviceRepo = data_source_1.AppDataSource.getRepository(Service_1.Service);
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceIds, vendorId, scheduledAt, userProvidedProducts, specialInstructions, address } = req.body;
        if (!serviceIds || !serviceIds.length || !scheduledAt || !address) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // Validate Services
        const services = await serviceRepo.findBy({ id: (0, typeorm_1.In)(serviceIds) });
        if (services.length !== serviceIds.length) {
            return res.status(400).json({ message: "One or more services are invalid" });
        }
        // Validate Vendor if preferred
        let assignedVendor = null;
        let pricingLevel = Vendor_1.VendorLevel.SILVER; // default pricing
        if (vendorId) {
            assignedVendor = await vendorRepo.findOneBy({ id: vendorId, isOnline: true });
            if (!assignedVendor) {
                return res.status(404).json({ message: "Preferred vendor is not available" });
            }
            pricingLevel = assignedVendor.level;
        }
        // Calculate Pricing
        let serviceCharge = 0;
        let productCost = 0;
        const bookedServicesList = [];
        for (const service of services) {
            let price = service.silverPrice;
            if (pricingLevel === Vendor_1.VendorLevel.GOLD)
                price = service.goldPrice;
            if (pricingLevel === Vendor_1.VendorLevel.PLATINUM)
                price = service.platinumPrice;
            serviceCharge += Number(price);
            if (!userProvidedProducts) {
                productCost += Number(service.productCost);
            }
            bookedServicesList.push({
                id: service.id,
                name: service.name,
                priceApplied: price,
            });
        }
        const totalAmount = serviceCharge + productCost;
        // Create Booking
        const booking = bookingRepo.create({
            user: { id: userId },
            vendor: assignedVendor ? { id: assignedVendor.id } : undefined,
            services: bookedServicesList,
            userProvidedProducts,
            serviceCharge,
            productCost,
            totalAmount,
            scheduledAt,
            specialInstructions,
            address,
            status: Booking_1.BookingStatus.PENDING
        });
        await bookingRepo.save(booking);
        // TODO: In real-world, we would trigger a Socket event to vendors nearby here.
        res.status(201).json({ message: "Booking created successfully", booking });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating booking", error });
    }
};
exports.createBooking = createBooking;
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await bookingRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: "DESC" }
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching bookings", error });
    }
};
exports.getUserBookings = getUserBookings;
const cancelBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;
        const booking = await bookingRepo.findOne({
            where: { id: bookingId, user: { id: userId } }
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.status === Booking_1.BookingStatus.COMPLETED || booking.status === Booking_1.BookingStatus.CANCELLED) {
            return res.status(400).json({ message: "Cannot cancel this booking" });
        }
        booking.status = Booking_1.BookingStatus.CANCELLED;
        await bookingRepo.save(booking);
        res.status(200).json({ message: "Booking cancelled successfully", booking });
    }
    catch (error) {
        res.status(500).json({ message: "Error cancelling booking", error });
    }
};
exports.cancelBooking = cancelBooking;

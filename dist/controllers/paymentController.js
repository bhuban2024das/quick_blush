"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyReferral = exports.verifyPayment = exports.initiatePayment = void 0;
const data_source_1 = require("../config/data-source");
const Booking_1 = require("../entities/Booking");
const User_1 = require("../entities/User");
const Transaction_1 = require("../entities/Transaction");
const stripeService_1 = require("../services/stripeService");
const bookingRepo = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
const txRepo = data_source_1.AppDataSource.getRepository(Transaction_1.Transaction);
const initiatePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.body;
        const booking = await bookingRepo.findOneBy({ id: bookingId, user: { id: userId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.paymentStatus === Booking_1.PaymentStatus.PAID)
            return res.status(400).json({ message: "Booking already paid" });
        const clientSecret = await stripeService_1.stripeService.createPaymentIntent(Number(booking.totalAmount));
        if (!clientSecret) {
            return res.status(500).json({ message: "Failed to initialize secure payment. Try again later." });
        }
        res.status(200).json({
            message: "Payment initiated",
            clientSecret: clientSecret,
            amount: booking.totalAmount
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error initiating payment", error });
    }
};
exports.initiatePayment = initiatePayment;
const verifyPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId, paymentMethod, referenceId } = req.body;
        const booking = await bookingRepo.findOneBy({ id: bookingId, user: { id: userId } });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.paymentStatus === Booking_1.PaymentStatus.PAID)
            return res.status(400).json({ message: "Booking is already paid" });
        // Update booking
        booking.paymentStatus = Booking_1.PaymentStatus.PAID;
        // booking.paymentMethod could be saved to a Transaction table if needed, ignoring for now since it's removed from Booking schema
        await bookingRepo.save(booking);
        // Record Transaction
        const tx = txRepo.create({
            entityType: Transaction_1.EntityType.USER,
            entityId: userId,
            amount: booking.totalAmount,
            type: Transaction_1.TransactionType.DEBIT,
            description: `Payment for Booking ${booking.id}`,
            referenceId
        });
        await txRepo.save(tx);
        res.status(200).json({ message: "Payment verified successfully", booking });
    }
    catch (error) {
        res.status(500).json({ message: "Error verifying payment", error });
    }
};
exports.verifyPayment = verifyPayment;
const applyReferral = async (req, res) => {
    try {
        const userId = req.user.id;
        const { referralCode } = req.body;
        // Mock logic: grant 50 coins to wallet
        const user = await userRepo.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const rewardAmount = 50;
        user.walletBalance = Number(user.walletBalance) + rewardAmount;
        await userRepo.save(user);
        const tx = txRepo.create({
            entityType: Transaction_1.EntityType.USER,
            entityId: userId,
            amount: rewardAmount,
            type: Transaction_1.TransactionType.CREDIT,
            description: `Referral Reward: ${referralCode}`
        });
        await txRepo.save(tx);
        res.status(200).json({ message: "Referral applied, wallet updated", walletBalance: user.walletBalance });
    }
    catch (error) {
        res.status(500).json({ message: "Error applying referral", error });
    }
};
exports.applyReferral = applyReferral;

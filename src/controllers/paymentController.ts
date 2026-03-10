import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Booking, BookingStatus, PaymentStatus } from "../entities/Booking";
import { User } from "../entities/User";
import { Transaction, TransactionType, EntityType } from "../entities/Transaction";
import { stripeService } from "../services/stripeService";

const bookingRepo = AppDataSource.getRepository(Booking);
const userRepo = AppDataSource.getRepository(User);
const txRepo = AppDataSource.getRepository(Transaction);

export const initiatePayment = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.body;

        const booking = await bookingRepo.findOneBy({ id: bookingId, user: { id: userId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.paymentStatus === PaymentStatus.PAID) return res.status(400).json({ message: "Booking already paid" });

        const clientSecret = await stripeService.createPaymentIntent(Number(booking.totalAmount));

        if (!clientSecret) {
            return res.status(500).json({ message: "Failed to initialize secure payment. Try again later." });
        }

        res.status(200).json({
            message: "Payment initiated",
            clientSecret: clientSecret,
            amount: booking.totalAmount
        });
    } catch (error) {
        res.status(500).json({ message: "Error initiating payment", error });
    }
};

export const verifyPayment = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { bookingId, paymentMethod, referenceId } = req.body;

        const booking = await bookingRepo.findOneBy({ id: bookingId, user: { id: userId } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.paymentStatus === PaymentStatus.PAID) return res.status(400).json({ message: "Booking is already paid" });

        // Update booking
        booking.paymentStatus = PaymentStatus.PAID;
        // booking.paymentMethod could be saved to a Transaction table if needed, ignoring for now since it's removed from Booking schema
        await bookingRepo.save(booking);

        // Record Transaction
        const tx = txRepo.create({
            entityType: EntityType.USER,
            entityId: userId,
            amount: booking.totalAmount,
            type: TransactionType.DEBIT,
            description: `Payment for Booking ${booking.id}`,
            referenceId
        });
        await txRepo.save(tx);

        res.status(200).json({ message: "Payment verified successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Error verifying payment", error });
    }
};

export const applyReferral = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { referralCode } = req.body;
        // Mock logic: grant 50 coins to wallet
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        const rewardAmount = 50;
        user.walletBalance = Number(user.walletBalance) + rewardAmount;
        await userRepo.save(user);

        const tx = txRepo.create({
            entityType: EntityType.USER,
            entityId: userId,
            amount: rewardAmount,
            type: TransactionType.CREDIT,
            description: `Referral Reward: ${referralCode}`
        });
        await txRepo.save(tx);

        res.status(200).json({ message: "Referral applied, wallet updated", walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ message: "Error applying referral", error });
    }
};

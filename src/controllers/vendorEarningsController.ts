import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Transaction, EntityType } from "../entities/Transaction";
import { Vendor } from "../entities/Vendor";

const txRepo = AppDataSource.getRepository(Transaction);
const vendorRepo = AppDataSource.getRepository(Vendor);

export const getEarningsDashboard = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;

        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        // Get recent transactions
        const transactions = await txRepo.find({
            where: { entityType: EntityType.VENDOR, entityId: vendorId },
            order: { createdAt: "DESC" },
            take: 50
        });

        // Compute Simple Analytics (mocked dates logic)
        // In real-world, we'd use SQL aggregation via QueryBuilder for daily/weekly/monthly earnings

        res.status(200).json({
            walletBalance: vendor.walletBalance,
            recentTransactions: transactions
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching earnings", error });
    }
};

export const requestPayout = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { amount } = req.body;

        if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        if (vendor.walletBalance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Logic to initiate bank transfer / UPI payout here
        // Mock successful transaction deduction
        vendor.walletBalance = Number(vendor.walletBalance) - Number(amount);
        await vendorRepo.save(vendor);

        const tx = txRepo.create({
            entityType: EntityType.VENDOR,
            entityId: vendorId,
            amount: amount,
            type: "DEBIT" as any,
            description: "Payout to bank account"
        });
        await txRepo.save(tx);

        res.status(200).json({ message: "Payout initiated successfully", newBalance: vendor.walletBalance });
    } catch (error) {
        res.status(500).json({ message: "Error requesting payout", error });
    }
};

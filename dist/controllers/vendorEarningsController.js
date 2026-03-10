"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPayout = exports.getEarningsDashboard = void 0;
const data_source_1 = require("../config/data-source");
const Transaction_1 = require("../entities/Transaction");
const Vendor_1 = require("../entities/Vendor");
const txRepo = data_source_1.AppDataSource.getRepository(Transaction_1.Transaction);
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
const getEarningsDashboard = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        // Get recent transactions
        const transactions = await txRepo.find({
            where: { entityType: Transaction_1.EntityType.VENDOR, entityId: vendorId },
            order: { createdAt: "DESC" },
            take: 50
        });
        // Compute Simple Analytics (mocked dates logic)
        // In real-world, we'd use SQL aggregation via QueryBuilder for daily/weekly/monthly earnings
        res.status(200).json({
            walletBalance: vendor.walletBalance,
            recentTransactions: transactions
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching earnings", error });
    }
};
exports.getEarningsDashboard = getEarningsDashboard;
const requestPayout = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { amount } = req.body;
        if (amount <= 0)
            return res.status(400).json({ message: "Invalid amount" });
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        if (vendor.walletBalance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        // Logic to initiate bank transfer / UPI payout here
        // Mock successful transaction deduction
        vendor.walletBalance = Number(vendor.walletBalance) - Number(amount);
        await vendorRepo.save(vendor);
        const tx = txRepo.create({
            entityType: Transaction_1.EntityType.VENDOR,
            entityId: vendorId,
            amount: amount,
            type: "DEBIT",
            description: "Payout to bank account"
        });
        await txRepo.save(tx);
        res.status(200).json({ message: "Payout initiated successfully", newBalance: vendor.walletBalance });
    }
    catch (error) {
        res.status(500).json({ message: "Error requesting payout", error });
    }
};
exports.requestPayout = requestPayout;

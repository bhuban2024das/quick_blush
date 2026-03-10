"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseSubscription = exports.getCurrentSubscription = void 0;
const data_source_1 = require("../config/data-source");
const VendorSubscription_1 = require("../entities/VendorSubscription");
const SubscriptionPlan_1 = require("../entities/SubscriptionPlan");
const Vendor_1 = require("../entities/Vendor");
const subRepo = data_source_1.AppDataSource.getRepository(VendorSubscription_1.VendorSubscription);
const planRepo = data_source_1.AppDataSource.getRepository(SubscriptionPlan_1.SubscriptionPlan);
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
const getCurrentSubscription = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const sub = await subRepo.findOne({
            where: { vendor: { id: vendorId }, status: VendorSubscription_1.SubscriptionStatus.ACTIVE },
            order: { endDate: "DESC" }
        });
        if (!sub)
            return res.status(200).json({ message: "No active subscription", subscription: null });
        res.status(200).json({ subscription: sub });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching subscription", error });
    }
};
exports.getCurrentSubscription = getCurrentSubscription;
const purchaseSubscription = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { planId } = req.body;
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        const plan = await planRepo.findOneBy({ id: planId, isActive: true });
        if (!plan)
            return res.status(404).json({ message: "Plan not found or inactive" });
        // Calculate end date based on validity days
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.validityDays);
        // Terminate old actives
        await subRepo.update({ vendor: { id: vendorId }, status: VendorSubscription_1.SubscriptionStatus.ACTIVE }, { status: VendorSubscription_1.SubscriptionStatus.EXPIRED });
        const newSub = subRepo.create({
            vendor: { id: vendorId },
            plan: { id: planId },
            startDate,
            endDate,
            status: VendorSubscription_1.SubscriptionStatus.ACTIVE,
            paymentCollected: false // assuming a payment gateway flow will mark this true
        });
        await subRepo.save(newSub);
        // TODO: Redirect to payment gateway here
        // Usually, payment completion will trigger a webhook to mark paymentCollected = true
        res.status(201).json({ message: "Subscription requested. Proceed to payment.", subscription: newSub });
    }
    catch (error) {
        res.status(500).json({ message: "Error purchasing subscription", error });
    }
};
exports.purchaseSubscription = purchaseSubscription;

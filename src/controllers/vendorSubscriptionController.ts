import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { VendorSubscription, SubscriptionStatus } from "../entities/VendorSubscription";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";
import { Vendor } from "../entities/Vendor";

const subRepo = AppDataSource.getRepository(VendorSubscription);
const planRepo = AppDataSource.getRepository(SubscriptionPlan);
const vendorRepo = AppDataSource.getRepository(Vendor);

export const getCurrentSubscription = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const sub = await subRepo.findOne({
            where: { vendor: { id: vendorId }, status: SubscriptionStatus.ACTIVE },
            order: { endDate: "DESC" }
        });

        if (!sub) return res.status(200).json({ message: "No active subscription", subscription: null });

        res.status(200).json({ subscription: sub });
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscription", error });
    }
};

export const purchaseSubscription = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { planId } = req.body;

        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        const plan = await planRepo.findOneBy({ id: planId, isActive: true });
        if (!plan) return res.status(404).json({ message: "Plan not found or inactive" });

        // Calculate end date based on validity days
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.validityDays);

        // Terminate old actives
        await subRepo.update(
            { vendor: { id: vendorId }, status: SubscriptionStatus.ACTIVE },
            { status: SubscriptionStatus.EXPIRED }
        );

        const newSub = subRepo.create({
            vendor: { id: vendorId },
            plan: { id: planId },
            startDate,
            endDate,
            status: SubscriptionStatus.ACTIVE,
            paymentCollected: false // assuming a payment gateway flow will mark this true
        });

        await subRepo.save(newSub);

        // TODO: Redirect to payment gateway here
        // Usually, payment completion will trigger a webhook to mark paymentCollected = true

        res.status(201).json({ message: "Subscription requested. Proceed to payment.", subscription: newSub });
    } catch (error) {
        res.status(500).json({ message: "Error purchasing subscription", error });
    }
};

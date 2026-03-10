"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "mock_stripe_key";
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: "2023-10-16" // Use explicit casting to ANY to bypass strict runtime library types if mismatched
});
exports.stripeService = {
    async createPaymentIntent(amount, currency = "inr") {
        try {
            if (stripeSecretKey === "mock_stripe_key") {
                console.log(`[Mock Stripe] Creating payment intent for ${amount} ${currency}`);
                return "pi_mock_" + Math.random().toString(36).substring(7);
            }
            // Stripe expects amount in lowest denominator (paise/cents)
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: currency,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return paymentIntent.client_secret;
        }
        catch (error) {
            console.error("Error creating Stripe Payment Intent:", error);
            return null;
        }
    }
};

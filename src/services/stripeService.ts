import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "mock_stripe_key";
const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16" as any // Use explicit casting to ANY to bypass strict runtime library types if mismatched
});

export const stripeService = {
    async createPaymentIntent(amount: number, currency: string = "inr"): Promise<string | null> {
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
        } catch (error) {
            console.error("Error creating Stripe Payment Intent:", error);
            return null;
        }
    }
};

import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC00000000000000000000000000000000";
const authToken = process.env.TWILIO_AUTH_TOKEN || "mock_auth_token";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

const client = twilio(accountSid, authToken);

export const smsService = {
    async sendOTP(to: string, otp: string): Promise<boolean> {
        try {
            // In a real environment without mock keys, this will hit Twilio's API
            if (accountSid === "AC00000000000000000000000000000000") {
                console.log(`[Mock SMS] Sending OTP ${otp} to ${to}`);
                return true;
            }

            const message = await client.messages.create({
                body: `Your Quick Blush OTP is: ${otp}. Valid for 10 minutes.`,
                from: twilioPhoneNumber,
                to: to
            });

            console.log(`SMS sent successfully: ${message.sid}`);
            return true;
        } catch (error) {
            console.error("Error sending SMS via Twilio:", error);
            return false;
        }
    }
};

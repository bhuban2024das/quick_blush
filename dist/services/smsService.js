"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC00000000000000000000000000000000";
const authToken = process.env.TWILIO_AUTH_TOKEN || "mock_auth_token";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";
const client = (0, twilio_1.default)(accountSid, authToken);
exports.smsService = {
    // Basic in-memory store for OTPs
    // Structure: { mobile: { otp: string, expiresAt: number } }
    mockOtpStore: {},
    async sendOTP(to, otp) {
        try {
            // HARDCODED OTP FOR TESTING
            const testOtp = "123456";
            this.mockOtpStore[to] = {
                otp: testOtp,
                expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes from now
            };
            console.log(`[TESTING] OTP completely bypassed for ${to}. Fixed to: ${testOtp}`);
            return true;
            /*
            // Original Twilio Code
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
            */
        }
        catch (error) {
            console.error("Error sending SMS via Twilio:", error);
            return false;
        }
    },
    async verifyOTP(to, otp) {
        const record = this.mockOtpStore[to];
        if (!record)
            return false;
        if (Date.now() > record.expiresAt) {
            delete this.mockOtpStore[to]; // cleanup
            return false;
        }
        if (record.otp === otp) {
            delete this.mockOtpStore[to]; // successful verification, consume it
            return true;
        }
        return false;
    }
};

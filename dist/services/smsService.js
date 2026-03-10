"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const accountSid = process.env.TWILIO_ACCOUNT_SID || "mock_account_sid";
const authToken = process.env.TWILIO_AUTH_TOKEN || "mock_auth_token";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";
const client = (0, twilio_1.default)(accountSid, authToken);
exports.smsService = {
    async sendOTP(to, otp) {
        try {
            // In a real environment without mock keys, this will hit Twilio's API
            if (accountSid === "mock_account_sid") {
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
        }
        catch (error) {
            console.error("Error sending SMS via Twilio:", error);
            return false;
        }
    }
};

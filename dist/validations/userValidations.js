"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.verifyOtpSchema = exports.requestOtpSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.requestOtpSchema = joi_1.default.object({
    mobile: joi_1.default.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
        "string.pattern.base": "Mobile number must be between 10 and 15 digits.",
        "any.required": "Mobile number is required.",
    }),
});
exports.verifyOtpSchema = joi_1.default.object({
    mobile: joi_1.default.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
        "string.pattern.base": "Mobile number must be between 10 and 15 digits.",
        "any.required": "Mobile number is required.",
    }),
    otp: joi_1.default.string()
        .length(6)
        .required()
        .messages({
        "string.length": "OTP must be exactly 6 characters long.",
        "any.required": "OTP is required.",
    }),
});
exports.updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional(),
    email: joi_1.default.string().email().optional(),
    gender: joi_1.default.string().valid("MALE", "FEMALE", "OTHER").optional(),
    addressBook: joi_1.default.array().items(joi_1.default.any()).optional()
});

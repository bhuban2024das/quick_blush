"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutRequestSchema = exports.jobStatusSchema = exports.purchaseSubscriptionSchema = exports.updateVendorProfileSchema = exports.loginVendorSchema = exports.verifyOtpSchema = exports.uploadDocumentSchema = exports.registerVendorSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerVendorSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    email: joi_1.default.string().email().required(),
    mobile: joi_1.default.string().pattern(/^[0-9]{10,15}$/).required(),
    password: joi_1.default.string().min(6).required(),
    address: joi_1.default.string().optional(),
    age: joi_1.default.number().integer().min(18).optional(),
    photo: joi_1.default.string().uri().optional(),
    experienceYears: joi_1.default.number().integer().min(0).optional(),
    serviceCategoryIds: joi_1.default.array().items(joi_1.default.string()).optional()
});
exports.uploadDocumentSchema = joi_1.default.object({
    documentUrl: joi_1.default.string().uri().required()
});
exports.verifyOtpSchema = joi_1.default.object({
    mobile: joi_1.default.string().pattern(/^[0-9]{10,15}$/).required(),
    otp: joi_1.default.string().length(6).required()
});
exports.loginVendorSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.updateVendorProfileSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional(),
    bio: joi_1.default.string().optional(),
    locationLat: joi_1.default.number().optional(),
    locationLng: joi_1.default.number().optional(),
    isAvailable: joi_1.default.boolean().optional(),
    serviceCategoryIds: joi_1.default.array().items(joi_1.default.string()).optional()
});
exports.purchaseSubscriptionSchema = joi_1.default.object({
    planId: joi_1.default.number().integer().required()
});
exports.jobStatusSchema = joi_1.default.object({
    status: joi_1.default.string().valid("EN_ROUTE", "IN_PROGRESS", "COMPLETED").required()
});
exports.payoutRequestSchema = joi_1.default.object({
    amount: joi_1.default.number().positive().required()
});

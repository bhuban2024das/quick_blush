"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createBookingSchema = joi_1.default.object({
    serviceId: joi_1.default.number().integer().optional(),
    productKitId: joi_1.default.number().integer().optional(),
    scheduledAt: joi_1.default.date().iso().required(),
    address: joi_1.default.object({
        street: joi_1.default.string().required(),
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        zipCode: joi_1.default.string().required(),
    }).required()
}).or("serviceId", "productKitId");

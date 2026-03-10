import Joi from "joi";

export const registerVendorSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    password: Joi.string().min(6).required(),
    serviceCategoryIds: Joi.array().items(Joi.string()).optional()
});

export const loginVendorSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateVendorProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    bio: Joi.string().optional(),
    locationLat: Joi.number().optional(),
    locationLng: Joi.number().optional(),
    isAvailable: Joi.boolean().optional(),
    serviceCategoryIds: Joi.array().items(Joi.string()).optional()
});

export const purchaseSubscriptionSchema = Joi.object({
    planId: Joi.number().integer().required()
});

export const jobStatusSchema = Joi.object({
    status: Joi.string().valid("EN_ROUTE", "IN_PROGRESS", "COMPLETED").required()
});

export const payoutRequestSchema = Joi.object({
    amount: Joi.number().positive().required()
});

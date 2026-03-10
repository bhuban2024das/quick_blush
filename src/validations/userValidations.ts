import Joi from "joi";

export const requestOtpSchema = Joi.object({
    mobile: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
            "string.pattern.base": "Mobile number must be between 10 and 15 digits.",
            "any.required": "Mobile number is required.",
        }),
});

export const verifyOtpSchema = Joi.object({
    mobile: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
            "string.pattern.base": "Mobile number must be between 10 and 15 digits.",
            "any.required": "Mobile number is required.",
        }),
    otp: Joi.string()
        .length(6)
        .required()
        .messages({
            "string.length": "OTP must be exactly 6 characters long.",
            "any.required": "OTP is required.",
        }),
});

export const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
    addressBook: Joi.array().items(Joi.any()).optional()
});

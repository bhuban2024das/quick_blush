import Joi from "joi";

export const createBookingSchema = Joi.object({
    serviceId: Joi.number().integer().optional(),
    productKitId: Joi.number().integer().optional(),
    scheduledAt: Joi.date().iso().required(),
    address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
    }).required()
}).or("serviceId", "productKitId");

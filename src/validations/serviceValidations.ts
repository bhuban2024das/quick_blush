import Joi from "joi";

export const searchServicesSchema = Joi.object({
    query: Joi.string().required().min(2)
});

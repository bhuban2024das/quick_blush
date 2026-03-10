import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateRequest = (schema: Joi.ObjectSchema, property: "body" | "query" | "params" = "body") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req[property], { abortEarly: false });

        if (error) {
            const formattedErrors = error.details.map((detail) => ({
                field: detail.context?.key,
                message: detail.message,
            }));

            return res.status(400).json({
                message: "Validation Error",
                errors: formattedErrors,
            });
        }

        next();
    };
};

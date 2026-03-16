"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema, property = "body") => {
    return (req, res, next) => {
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
exports.validateRequest = validateRequest;

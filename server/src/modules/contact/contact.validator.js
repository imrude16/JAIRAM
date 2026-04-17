import Joi from "joi";

export const sendContactMessageSchema = {
    body: Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required()
            .messages({
                "string.min": "Name must be at least 2 characters",
                "string.max": "Name cannot exceed 100 characters",
                "string.empty": "Name is required",
                "any.required": "Name is required",
            }),

        email: Joi.string()
            .email({ tlds: { allow: true } })
            .lowercase()
            .trim()
            .max(254)
            .required()
            .messages({
                "string.email": "Please provide a valid email address",
                "string.max": "Email address is too long",
                "string.empty": "Email is required",
                "any.required": "Email is required",
            }),

        subject: Joi.string()
            .trim()
            .min(3)
            .max(200)
            .required()
            .messages({
                "string.min": "Subject must be at least 3 characters",
                "string.max": "Subject cannot exceed 200 characters",
                "string.empty": "Subject is required",
                "any.required": "Subject is required",
            }),

        message: Joi.string()
            .trim()
            .min(10)
            .max(5000)
            .required()
            .messages({
                "string.min": "Message must be at least 10 characters",
                "string.max": "Message cannot exceed 5000 characters",
                "string.empty": "Message is required",
                "any.required": "Message is required",
            }),
    }),
};

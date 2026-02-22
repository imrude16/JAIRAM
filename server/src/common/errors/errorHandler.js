import { STATUS_CODES } from "../constants/statusCodes.js";

const globalErrorHandler = (err, req, res, next) => {

    let statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";

    let message = err.message || "Something went wrong";
    let details = err.details || {};

    // If ValidationError 
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            errorCode: "VALIDATION_ERROR",
            message: "Invalid data provided",
            details: err.errors,
        });
    }

    // If it's NOT an operational error → hide real message
    if (!err.isOperational) {
        statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        errorCode = "INTERNAL_SERVER_ERROR";
        message = "Something went wrong. Please try again later.";
        details = err.details || {};
    }

    return res.status(statusCode).json({
        success: false,
        errorCode,
        message,
        details,
    });
};

export { globalErrorHandler };

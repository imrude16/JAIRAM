const sendSuccess = (res, message, data = null, meta = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        meta
    });
};

export {
    sendSuccess,
};

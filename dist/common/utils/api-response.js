export const sendSuccess = (res, statusCode, message, data) => {
    const requestId = res.getHeader("X-Request-Id");
    const response = {
        success: true,
        message,
        data,
        requestId: typeof requestId === "string"
            ? requestId
            : null,
    };
    return res.status(statusCode).json(response);
};
//# sourceMappingURL=api-response.js.map
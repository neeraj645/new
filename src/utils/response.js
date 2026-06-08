/**
 * Standard Success Response
 */
import { MESSAGES } from "../constants/messages.js";
import { STATUS_CODES } from "../constants/statusCodes.js";
export const successResponse = (
    res,
    statusCode = STATUS_CODES.SUCCESS,
    message = MESSAGES.COMMON.SUCCESS,
    data = null,
    pagination = null
) => {
    const response = {
        success: true,
        message,
    };

    if (data !== null) {
        response.data = data;
    }

    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
};
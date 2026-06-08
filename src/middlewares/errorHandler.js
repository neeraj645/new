// middlewares/errorHandler.js
import logger from "../config/logger.js";
import {MESSAGES} from "../constants/messages.js";
import {STATUS_CODES} from "../constants/statusCodes.js";
const errorHandler = (err, req, res, next) => {

    logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(
    STATUS_CODES.INTERNAL_SERVER_ERROR
  ).json({
    success: false,
    message: MESSAGES.COMMON.INTERNAL_SERVER_ERROR || "Internal server error",
  });
};

export default errorHandler;
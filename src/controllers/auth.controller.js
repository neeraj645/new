import authService from "../services/auth.services.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import logger from "../config/logger.js";
import { successResponse } from "../utils/response.js";
import {MESSAGES} from "../constants/messages.js";
import {STATUS_CODES} from "../constants/statusCodes.js";


// =============================== Auth Controllers ===============================
export const signupUser = asyncWrapper(
  async (req, res) => {
    await authService.signup(
      req.validatedData.body
    );
    logger.info("Signup successful, OTP sent to email");
    return successResponse(
      res,
      STATUS_CODES.CREATED,
      MESSAGES.AUTH.OTP_SENT,
    );

  }
);

import authService from "../services/auth.services.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import logger from "../config/logger.js";
import { successResponse } from "../utils/response.js";
import {MESSAGES} from "../constants/messages.js";
import {STATUS_CODES} from "../constants/statusCodes.js";
import AppError from "../utils/appError.js";


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

export const verifyEmailUser = asyncWrapper(
  async (req, res) => {
    const result = await authService.verifyEmail(
      req.validatedData.body
    );
    logger.info(`Email verified for user: ${result.email}`);
    return successResponse(
      res,
      STATUS_CODES.OK,
      MESSAGES.AUTH.EMAIL_VERIFIED,
      result
    );
  }
);

export const resendOtpUser = asyncWrapper(
  async (req, res) => {
    const result = await authService.resendOtp(
      req.validatedData.body
    );
    logger.info(`OTP resent to email: ${result.email}`);
    return successResponse(
      res,
      STATUS_CODES.OK,
      MESSAGES.AUTH.OTP_SENT
    );
  }
);

export const loginUser = asyncWrapper(
  async (req, res) => {
    const result = await authService.login(
      req.validatedData.body
    );
    logger.info(`User logged in: ${result.user.email}`);
    return successResponse(
      res,
      STATUS_CODES.OK,
      MESSAGES.AUTH.LOGIN_SUCCESS,
      result
    );
  }
);

export const logoutUser = asyncWrapper(
  async (req, res) => {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AppError(
        "User ID not found",
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const result = await authService.logout({ userId });
    logger.info(`User logged out: ${userId}`);
    return successResponse(
      res,
      STATUS_CODES.OK,
      result.message
    );
  }
);

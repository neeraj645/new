import { generateOTP, hashOTP, verifyOTP } from "../helper/otp.helper.js";
import redis from "../config/ioredis.config.js";
import AppError from "../utils/appError.js";
import { emailQueue } from "../queues/email.queue.js";
import { MESSAGES } from "../constants/messages.js";
import { STATUS_CODES } from "../constants/statusCodes.js";
import prisma from "../config/prisma.config.js";
import { hashPassword, comparePassword } from "../helper/hash.helper.js";
import { generateTokens } from "../helper/token.helper.js";

export const signup = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // Verified user cannot signup again
  if (existingUser?.isVerified) {
    throw new AppError(
      MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // OTP rate limiting (1 minute)
  const otpCooldown = await redis.get(`auth:otp-rate:${email}`);

  if (otpCooldown) {
    throw new AppError(
      MESSAGES.AUTH.OTP_ALREADY_SENT,
      STATUS_CODES.BAD_REQUEST
    );
  }

  const hashedPassword = await hashPassword(password);

  let user;

  try {
    if (!existingUser) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          password: hashedPassword,
        },
      });
    }
  } catch (error) {
    // Prisma unique constraint error
    if (error.code === "P2002") {
      throw new AppError(
        MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
        STATUS_CODES.BAD_REQUEST
      );
    }

    throw error;
  }

  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);

  // Store OTP + Rate Limit in parallel
  await Promise.all([
    redis.set(`auth:otp:${email}`, hashedOtp, "EX", 300), // 5 min
    redis.set(`auth:otp-rate:${email}`, "1", "EX", 60), // 1 min
  ]);

  try {
    await emailQueue.add("sendOtp", {
      email,
      name: user.name,
      otp,
    });
  } catch (error) {
    console.error("Failed to add email job:", error);

    throw new AppError(
      MESSAGES.AUTH.OTP_SEND_FAILED,
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const verifyEmail = async ({ email, otp }) => {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, STATUS_CODES.NOT_FOUND);
  }

  // Check if email is already verified
  if (user.isVerified) {
    throw new AppError(
      MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // Get stored OTP from Redis
  const storedOtpHash = await redis.get(`auth:otp:${email}`);

  if (!storedOtpHash) {
    throw new AppError(MESSAGES.AUTH.OTP_EXPIRED, STATUS_CODES.BAD_REQUEST);
  }

  // Verify OTP
  const isValidOtp = verifyOTP(otp, storedOtpHash);

  if (!isValidOtp) {
    throw new AppError(MESSAGES.AUTH.INVALID_OTP, STATUS_CODES.BAD_REQUEST);
  }

  // Update user as verified
  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  // Clean up OTP from Redis
  await Promise.all([
    redis.del(`auth:otp:${email}`),
    redis.del(`auth:otp-rate:${email}`),
  ]);

  return {
    id: verifiedUser.id,
    name: verifiedUser.name,
    email: verifiedUser.email,
    isVerified: verifiedUser.isVerified,
  };
};

export const resendOtp = async ({ email }) => {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, STATUS_CODES.NOT_FOUND);
  }

  // Check if email is already verified
  if (user.isVerified) {
    throw new AppError(
      MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // OTP rate limiting (1 minute)
  const otpCooldown = await redis.get(`auth:otp-rate:${email}`);

  if (otpCooldown) {
    throw new AppError(
      MESSAGES.AUTH.OTP_ALREADY_SENT,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // Generate new OTP
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);

  // Store OTP + Rate Limit in parallel
  await Promise.all([
    redis.set(`auth:otp:${email}`, hashedOtp, "EX", 300), // 5 min
    redis.set(`auth:otp-rate:${email}`, "1", "EX", 60), // 1 min
  ]);

  try {
    await emailQueue.add("sendOtp", {
      email,
      name: user.name,
      otp,
    });
  } catch (error) {
    console.error("Failed to add email job:", error);

    throw new AppError(
      MESSAGES.AUTH.OTP_SEND_FAILED,
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }

  return {
    message: MESSAGES.AUTH.OTP_SENT,
    email: user.email,
  };
};

export const login = async ({ email, password }) => {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, STATUS_CODES.NOT_FOUND);
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw new AppError(
      MESSAGES.AUTH.EMAIL_NOT_VERIFIED,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(
      MESSAGES.AUTH.INVALID_CREDENTIALS,
      STATUS_CODES.UNAUTHORIZED
    );
  }

  // Check if user account is active
  if (user.status !== "ACTIVE") {
    throw new AppError(
      MESSAGES.AUTH.ACCOUNT_INACTIVE,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.email);

  // Store refresh token in Redis with 30 days expiry
  await redis.set(`auth:refresh-token:${user.id}`, refreshToken, "EX", 2592000);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const logout = async ({ userId }) => {
  // Remove refresh token from Redis
  await redis.del(`auth:refresh-token:${userId}`);

  return {
    message: MESSAGES.AUTH.LOGOUT_SUCCESS,
  };
};

export default {
  signup,
  verifyEmail,
  resendOtp,
  login,
  logout,
};
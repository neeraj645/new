import { generateOTP, hashOTP } from '../helper/otp.helper.js';
import redis from "../config/ioredis.config.js";
import AppError from '../utils/appError.js';
import { emailQueue } from '../queues/email.queue.js';
import { MESSAGES } from '../constants/messages.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import prisma from '../config/prisma.config.js';
import { hashPassword } from '../helper/hash.helper.js';

export const signup = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    throw new AppError(MESSAGES.EMAIL.EMAIL_ALREADY_REGISTERED, STATUS_CODES.BAD_REQUEST);
  let user;

  try {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    const otp = generateOTP();

    await redis.set("otp:" + email, await hashOTP(otp), "EX", 300); // OTP expires in 5 minutes

    await emailQueue.add("sendOtp", {
      email,
      name,
      otp
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };

  } catch (error) {
    if (user?.id) await prisma.user.delete({ where: { id: user.id } });
    throw error;
  }
};

export default {
  signup,
};
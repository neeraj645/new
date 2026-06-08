import User from '../models/user.model.js';
import { generateOTP, hashOTP } from '../helper/otp.helper.js';
import redis from "../config/ioredis.config.js";
import AppError from '../utils/appError.js';
import { emailQueue } from '../queues/email.queue.js';
import { MESSAGES } from '../constants/messages.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const signup = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new AppError(MESSAGES.EMAIL.EMAIL_ALREADY_REGISTERED, STATUS_CODES.BAD_REQUEST);
  let user;

  try {
    const hashedPassword = await User.prototype.encryptPassword(password);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const otp = generateOTP();

    await redis.set("otp:" + email, await hashOTP(otp), "EX", 300); // OTP expires in 5 minutes

    await emailQueue.add("sendOtp", {
      email,
      name,
      otp
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };

  } catch (error) {
    if (user?._id) await User.deleteOne({ _id: user._id });
    throw error;
  }
};

export default {
  signup,
};
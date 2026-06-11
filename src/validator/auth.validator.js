import {z} from 'zod';

export const signupSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100).optional(),
    phone: z.string().min(10).max(15).optional()
});

export const verifyEmailSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits")
});

export const resendOtpSchema = z.object({
    email: z.string().email()
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters")
});


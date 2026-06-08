import {z} from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100).optional(),
    phone: z.string().min(10).max(15).optional()
});


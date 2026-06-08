import {z} from 'zod';

export const serviceConfigSchema = z.object({
    serviceName: z.string().min(2).max(100),
    config: z.record(z.string(), z.string()).optional()
});

export const updateServiceConfigSchema = z.object({
    serviceName: z.string().min(2).max(100).optional(),
    config: z.record(z.string(), z.string()).optional(),
    status: z.enum(['active', 'inactive']).optional()
});
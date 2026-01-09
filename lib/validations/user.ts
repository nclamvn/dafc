import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

export const userSchema = z.object({
  email: z.string().email('Must be a valid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  role: z.nativeEnum(UserRole).default(UserRole.BRAND_PLANNER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  assignedBrandIds: z.array(z.string()).optional(),
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = userSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
});

export type UserFormData = z.infer<typeof userSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

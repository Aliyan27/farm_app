import z from "zod";

export const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(100),

  oldPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(100)
    .optional(),
  // Optional: add stronger rules
  // .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  // .regex(/[0-9]/, "Must contain at least one number")
  // .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
});

export const changeEmailSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
});

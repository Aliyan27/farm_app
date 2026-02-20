import z from "zod";

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(100),
  // Optional: add stronger rules
  // .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  // .regex(/[0-9]/, "Must contain at least one number")
  // .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
});

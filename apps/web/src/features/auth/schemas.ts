import { z } from "zod";

import { usernameSchema } from "@/shared/lib/username";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
const emailSchema = z.email("Enter a valid email address");
const emailOrUsernameSchema = z
  .string()
  .trim()
  .min(1, "Email or username is required")
  .pipe(z.union([emailSchema, usernameSchema], "Enter a valid email or username"));

export const loginSchema = z.object({
  emailOrUsername: emailOrUsernameSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

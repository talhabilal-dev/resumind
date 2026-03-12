import { z } from "zod";

export const signupSchema = z.object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signinSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const forgotPasswordEmailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateProfileSchema = z.object({
    firstname: z.string().min(2, "First name must be at least 2 characters").max(30, "First name must be at most 30 characters"),
    lastname: z.string().min(2, "Last name must be at least 2 characters").max(30, "Last name must be at most 30 characters"),
    username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    bio: z.string().max(160, "Bio must be at most 160 characters").optional().or(z.literal("")),
});

export const deleteAccountSchema = z.object({
    confirmation: z.string().refine((value) => value === "DELETE", {
        message: "Type DELETE to confirm account deletion",
    }),
});

export type SignupData = z.infer<typeof signupSchema>;
export type SigninData = z.infer<typeof signinSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordEmailData = z.infer<typeof forgotPasswordEmailSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type DeleteAccountData = z.infer<typeof deleteAccountSchema>;



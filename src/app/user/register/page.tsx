"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Brain, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RegisterFormData, RegisterFormErrors } from "@/types";
import { signupSchema } from "@/schemas/userSchema";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validateForm = (): RegisterFormErrors => {
    const newErrors: RegisterFormErrors = {};

    const parsed = signupSchema.safeParse({
      firstname: formData.firstname,
      lastname: formData.lastname,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !newErrors[field as keyof RegisterFormErrors]) {
          newErrors[field as keyof RegisterFormErrors] = issue.message;
        }
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error || "Failed to create account.";
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
        return;
      }

      if (data.success) {
        toast.success("Account created successfully!");
        setFormData({
          firstname: "",
          lastname: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({});
        router.push("/user/login");
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);

      let message = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        message = error.message;
      }

      setErrors({ general: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="fixed inset-0 aurora-bg -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-linear-to-b from-rose-900/30 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-linear-to-l from-pink-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-t from-rose-900/20 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-10">
        <div className="grid w-full items-center gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
          <section className="hidden lg:block space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
            >
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-white/5 px-4 py-2">
              <Brain className="h-4 w-4 text-rose-300" />
              <span className="text-sm text-foreground/80">Resumind Account Setup</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-balance">
              <span className="text-foreground">Start strong with</span>{" "}
              <span className="gradient-text">AI resume insights</span>
            </h1>

            <p className="max-w-md text-foreground/70">
              Create your account to unlock instant resume analysis, ATS checks, and personalized improvement tips.
            </p>

            <div className="space-y-3 text-sm text-foreground/75">
              <p>Fast onboarding with email verification</p>
              <p>Personalized recommendations by role</p>
              <p>Actionable fixes in minutes</p>
            </div>
          </section>

          <section className="w-full">
            <div className="mx-auto w-full max-w-xl glow-card rounded-2xl bg-background/60 p-6 backdrop-blur-md sm:p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg gradient-accent">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
                <p className="mt-1 text-sm text-foreground/65">Join Resumind and improve your resume with AI</p>
              </div>

              {errors.general && (
                <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-red-300" />
                    <p className="text-sm text-red-200">{errors.general}</p>
                  </div>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstname" className="mb-1 block text-sm text-foreground/80">
                      First Name
                    </label>
                    <input
                      id="firstname"
                      name="firstname"
                      type="text"
                      value={formData.firstname}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${errors.firstname ? "border-red-500/70" : "border-rose-500/25"
                        }`}
                      placeholder="Jane"
                    />
                    {errors.firstname && (
                      <p id="firstname-error" className="mt-1 text-sm text-red-300" role="alert">
                        {errors.firstname}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastname" className="mb-1 block text-sm text-foreground/80">
                      Last Name
                    </label>
                    <input
                      id="lastname"
                      name="lastname"
                      type="text"
                      value={formData.lastname}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${errors.lastname ? "border-red-500/70" : "border-rose-500/25"
                        }`}
                      placeholder="Doe"
                    />
                    {errors.lastname && (
                      <p id="lastname-error" className="mt-1 text-sm text-red-300" role="alert">
                        {errors.lastname}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="username" className="mb-1 block text-sm text-foreground/80">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${errors.username ? "border-red-500/70" : "border-rose-500/25"
                        }`}
                      placeholder="jane_doe"
                    />
                    {errors.username && (
                      <p id="username-error" className="mt-1 text-sm text-red-300" role="alert">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm text-foreground/80">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${errors.email ? "border-red-500/70" : "border-rose-500/25"
                        }`}
                      placeholder="jane@example.com"
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-300" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="mb-1 block text-sm text-foreground/80">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 pr-11 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${errors.password ? "border-red-500/70" : "border-rose-500/25"
                          }`}
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="mt-1 text-sm text-red-300" role="alert">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="mb-1 block text-sm text-foreground/80">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 pr-11 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${errors.confirmPassword ? "border-red-500/70" : "border-rose-500/25"
                          }`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p id="confirm-password-error" className="mt-1 text-sm text-red-300" role="alert">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 h-11 w-full gradient-accent border-0 text-white"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-foreground/65">
                Already have an account?{" "}
                <Link href="/user/login" className="font-medium text-rose-300 hover:text-rose-200">
                  Sign In
                </Link>
              </p>

              <p className="mt-3 text-center text-sm text-foreground/50 lg:hidden">
                <Link href="/" className="hover:text-foreground/80 transition">
                  Back to Home
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

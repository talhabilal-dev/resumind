"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ArrowRight, Brain, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoginFormData, LoginFormErrors } from "@/types";
import { signinSchema } from "@/schemas/userSchema";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const validateForm = (): LoginFormErrors => {
    const newErrors: LoginFormErrors = {};

    const parsed = signinSchema.safeParse({
      email: formData.email,
      password: formData.password,
      rememberMe,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !newErrors[field as keyof LoginFormErrors]) {
          newErrors[field as keyof LoginFormErrors] = issue.message;
        }
      }
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof LoginFormErrors]) {
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
      toast({
        title: "Error",
        description: newErrors.general || Object.values(newErrors)[0] || "Please correct the form errors.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error || "Login failed. Please try again.";
        setErrors({ general: errorMessage });
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Login successful!",
          variant: "default"
        });
        setFormData({
          email: "",
          password: "",
        });
        setRememberMe(false);
        router.push("/user/dashboard");
      } else {
        const message = data?.message || "Invalid email or password.";
        setErrors({ general: message });
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      let message = "An unexpected error occurred. Please try again later.";
      if (error instanceof Error) {
        message = error.message;
      }

      setErrors({ general: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
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
          <section className="hidden space-y-6 lg:block">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-foreground/70 transition hover:text-foreground"
            >
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-white/5 px-4 py-2">
              <Brain className="h-4 w-4 text-rose-300" />
              <span className="text-sm text-foreground/80">Welcome Back to Resumind</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-balance">
              <span className="text-foreground">Continue with</span>{" "}
              <span className="gradient-text">smarter job wins</span>
            </h1>

            <p className="max-w-md text-foreground/70">
              Log in to access your resume score, AI recommendations, and track every improvement in one place.
            </p>

            <div className="space-y-3 text-sm text-foreground/75">
              <p>Resume insights tailored to your target role</p>
              <p>ATS optimization checks in minutes</p>
              <p>Secure access to your saved analyses</p>
            </div>
          </section>

          <section className="w-full">
            <div className="mx-auto w-full max-w-xl rounded-2xl bg-background/60 p-6 backdrop-blur-md glow-card sm:p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg gradient-accent">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Sign in to your account</h2>
                <p className="mt-1 text-sm text-foreground/65">Welcome back. Please enter your details.</p>
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
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm text-foreground/80">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${
                      errors.email ? "border-red-500/70" : "border-rose-500/25"
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-sm text-foreground/80">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 pr-11 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${
                        errors.password ? "border-red-500/70" : "border-rose-500/25"
                      }`}
                      placeholder="Enter your password"
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
                  {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-foreground/75">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-rose-400/40 bg-white/5 text-rose-500 focus:ring-rose-500/40"
                    />
                    Remember me
                  </label>

                  <Link
                    href="/user/reset-password"
                    className="text-sm text-rose-300 transition hover:text-rose-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full border-0 text-white gradient-accent"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-foreground/65">
                Don&apos;t have an account?{" "}
                <Link href="/user/register" className="font-medium text-rose-300 hover:text-rose-200">
                  Sign up
                </Link>
              </p>

              <p className="mt-3 text-center text-sm text-foreground/50 lg:hidden">
                <Link href="/" className="transition hover:text-foreground/80">
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

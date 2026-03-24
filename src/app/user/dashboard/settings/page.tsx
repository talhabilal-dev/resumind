"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Save,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
} from "@/schemas/userSchema";

type SettingsForm = {
  firstname: string;
  lastname: string;
  username: string;
  bio: string;
  email: string;
};

const SettingsPage: React.FC = () => {
  const router = useRouter();

  const { toast } = useToast();

  const [formData, setFormData] = useState<SettingsForm>({
    firstname: "",
    lastname: "",
    username: "",
    bio: "",
    email: "",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await fetch("/api/users/profile");
        const data = await response.json();

        if (!response.ok || !data?.user) {
          throw new Error(data?.error || "Failed to fetch profile.");
        }

        const profile = data.user;
        setFormData({
          firstname: profile.firstname || "",
          lastname: profile.lastname || "",
          username: profile.username || "",
          bio: profile.bio || "",
          email: profile.email || "",
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load profile.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSave = async () => {
    const parsed = updateProfileSchema.safeParse({
      firstname: formData.firstname,
      lastname: formData.lastname,
      username: formData.username,
      bio: formData.bio,
    });

    if (!parsed.success) {
      toast({
        title: "Error",
        description: parsed.error.issues[0]?.message || "Please fix form errors.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update profile.");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
        variant: "default"
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to update profile.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (!parsed.success) {
      toast({
        title: "Error",
        description: parsed.error.issues[0]?.message || "Invalid password form.",
        variant: "destructive"
      });
      return;
    }

    if (!passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please confirm your new password.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to change password.");
      }

      toast({
        title: "Success",
        description: "Password changed successfully.",
        variant: "default"
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to change password.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const parsed = deleteAccountSchema.safeParse({
      confirmation: deleteConfirmation,
    });

    if (!parsed.success) {
      toast({
        title: "Error",
        description: parsed.error.issues[0]?.message || "Invalid confirmation.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete account.");
      }

      toast({
        title: "Success",
        description: "Account deleted successfully.",
        variant: "default"
      });
      router.push("/user/register");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to delete account.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Profile Settings</h1>
              <p className="text-sm text-foreground/65">Update your profile details and manage account access.</p>
            </div>
          </div>

          <Button
            type="button"
            className="gradient-accent border-0 text-white"
            onClick={() => router.push("/user/dashboard")}
          >
            Back to Dashboard
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <section className="mb-6 rounded-xl glow-card bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-foreground">Update Profile</h2>
          <p className="mt-1 text-sm text-foreground/65">You can edit your name, username, and bio. Email is read-only.</p>

          {isLoadingProfile ? (
            <p className="mt-4 text-sm text-foreground/60">Loading profile...</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstname" className="mb-1 block text-sm text-foreground/80">First Name</label>
                <input
                  id="firstname"
                  value={formData.firstname}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstname: e.target.value }))}
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                  placeholder="First name"
                />
              </div>

              <div>
                <label htmlFor="lastname" className="mb-1 block text-sm text-foreground/80">Last Name</label>
                <input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastname: e.target.value }))}
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                  placeholder="Last name"
                />
              </div>

              <div>
                <label htmlFor="username" className="mb-1 block text-sm text-foreground/80">Username</label>
                <input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                  placeholder="Username"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-foreground/80">Email (read-only)</label>
                <input
                  id="email"
                  value={formData.email}
                  readOnly
                  className="w-full rounded-lg border border-rose-500/25 bg-black/20 px-4 py-2.5 text-foreground/70 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="bio" className="mb-1 block text-sm text-foreground/80">Bio</label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  maxLength={160}
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                  placeholder="Tell us about your role focus in 160 characters"
                />
                <p className="mt-1 text-xs text-foreground/55">{formData.bio.length}/160</p>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={isSaving || isLoadingProfile}
                  className="gradient-accent border-0 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="mb-6 rounded-xl glow-card bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
          <p className="mt-1 text-sm text-foreground/65">Update your password to keep your account secure.</p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="currentPassword" className="mb-1 block text-sm text-foreground/80">Current Password</label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 pr-11 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="mb-1 block text-sm text-foreground/80">New Password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 pr-11 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm text-foreground/80">Confirm New Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 pr-11 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <Button
                type="button"
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="gradient-accent border-0 text-white"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl glow-card bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
          <p className="mt-1 text-sm text-foreground/65">Your saved debit card information.</p>

          <div className="mt-4 rounded-lg border border-rose-500/25 bg-linear-to-br from-rose-900/20 to-rose-800/30 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xs text-foreground/60 font-medium">DEBIT CARD</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("4242424242424242");
                  toast({
                    title: "Copied!",
                    description: "Card number copied to clipboard",
                    variant: "default"
                  });
                }}
                className="text-foreground/60 hover:text-foreground transition-colors"
                title="Copy card number"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-foreground/90 font-mono text-lg tracking-wider">
                  {showCardNumber ? "4242 4242 4242 4242" : "•••• •••• •••• 4242"}
                </div>
                <button
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="text-foreground/60 hover:text-foreground transition-colors ml-2"
                  title={showCardNumber ? "Hide card number" : "Show card number"}
                >
                  {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-foreground/60 mb-1">EXPIRES</div>
                <div className="text-foreground/90 font-medium">
                  03/{new Date().getFullYear() + 2}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60 mb-1">CVV</div>
                <div className="text-foreground/90 font-medium">114</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-red-500/35 bg-red-500/10 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-300" />
            <h2 className="text-lg font-semibold text-red-200">Danger Zone</h2>
          </div>
          <p className="text-sm text-red-100/85">
            Delete your account permanently. This action cannot be undone.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="deleteConfirmation" className="mb-1 block text-sm text-red-100/90">
                Type <span className="font-semibold">DELETE</span> to confirm
              </label>
              <input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full rounded-lg border border-red-400/45 bg-black/20 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-red-400/40"
                placeholder="DELETE"
              />
            </div>

            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
              className="border border-red-400/40 bg-red-500/20 text-red-100 hover:bg-red-500/30"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default SettingsPage;

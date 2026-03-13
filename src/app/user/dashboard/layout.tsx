"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  CircleDollarSign,
  Gauge,
  History,
  LayoutList,
  LogOut,
  ListChecks,
  ReceiptText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type DashboardUser = {
  username: string;
  email: string;
  initials: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<DashboardUser | null>(null);

  const menuItems = useMemo(
    () => [
      { name: "Dashboard", href: "/user/dashboard", icon: LayoutList },
      { name: "Select Task", href: "/user/dashboard/tasks", icon: ListChecks },
      { name: "Resume History", href: "/user/dashboard/history", icon: History },
      { name: "Transactions", href: "/user/dashboard/transactions", icon: ReceiptText },
      { name: "Buy Credits", href: "/user/dashboard/credits", icon: CircleDollarSign },
      { name: "Settings", href: "/user/dashboard/settings", icon: Gauge },
    ],
    []
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/profile");
        const data = await response.json();
        if (!response.ok || !data?.user) {
          return;
        }

        const username = data.user.username || "User";
        setUser({
          username,
          email: data.user.email || "",
          initials: username.charAt(0).toUpperCase(),
        });
      } catch {
        // Keep layout functional if profile call fails.
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } finally {
      router.push("/user/login");
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 aurora-bg -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-linear-to-b from-rose-900/30 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-linear-to-l from-pink-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-t from-rose-900/20 via-transparent to-transparent blur-3xl" />
      </div>

      <SidebarProvider defaultOpen>
        <Sidebar variant="inset" className="border-r border-rose-500/15">
          <SidebarHeader className="p-3">
            <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-foreground/70">AI Resume Analyzer</p>
                <p className="font-semibold text-foreground">Resumind</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => router.push(item.href)}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            {user && (
              <div className="rounded-lg border border-rose-500/20 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-pink-500 text-sm font-semibold text-white">
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{user.username}</p>
                    <p className="truncate text-xs text-foreground/65">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="justify-start border-rose-500/30 bg-white/5 text-foreground hover:bg-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-transparent">{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}

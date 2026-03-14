import type { Metadata } from "next";
import { Space_Grotesk, Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resumind - An Ai-Powered Resume Builder and Analysis Tool",
  description: "Resumind is an AI-powered resume builder and analysis tool designed to help job seekers create professional resumes and optimize them for applicant tracking systems (ATS). With Resumind, users can easily build their resumes using customizable templates, receive AI-driven feedback on content and formatting, and analyze their resumes against job descriptions to improve their chances of landing interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", inter.variable)}>
      <body
        className={`${spaceGrotesk.variable} ${rajdhani.variable} antialiased`}
        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

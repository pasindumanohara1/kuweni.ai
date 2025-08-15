import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kuweni.ai - AI Chat Platform",
  description: "ChatGPT-like interface powered by Pollinations.AI with text, image, and voice generation capabilities.",
  keywords: ["kuweni.ai", "ChatGPT", "AI", "Pollinations.AI", "chat", "image generation", "voice generation"],
  authors: [{ name: "kuweni.ai Team" }],
  openGraph: {
    title: "kuweni.ai - AI Chat Platform",
    description: "ChatGPT-like interface powered by Pollinations.AI",
    url: "https://kuweni.ai",
    siteName: "kuweni.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kuweni.ai - AI Chat Platform",
    description: "ChatGPT-like interface powered by Pollinations.AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

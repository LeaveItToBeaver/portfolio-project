import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/lib/AuthProvider";

export const metadata: Metadata = {
  title: "Jason Beaver — Portfolio",
  description: "Full Stack Engineer portfolio & dev blog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <AuthProvider>
            <Navbar />
            <main className="py-10">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

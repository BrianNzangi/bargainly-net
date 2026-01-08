import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bargainly Admin",
  description: "Admin dashboard for Bargainly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} antialiased`}
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

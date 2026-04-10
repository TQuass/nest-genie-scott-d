import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "NestGenie — AI Family Assistant",
  description: "AI that keeps your family running — just text it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

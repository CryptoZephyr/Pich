import type { Metadata } from "next";
import { Archivo_Black, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-head", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Pich: which client apps does this advisory actually affect?",
  description:
    "Pich turns a Next.js security advisory into a checklist with SERV Reasoning, then checks each client app for those exact conditions, with code evidence.",
  icons: { icon: "/pich-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${space.variable} ${mono.variable} antialiased`}>{children}</body>
    </html>
  );
}

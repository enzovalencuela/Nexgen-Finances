import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Nexgen Finance",
  description: "Controle financeiro moderno com dashboard, historico e investimentos.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

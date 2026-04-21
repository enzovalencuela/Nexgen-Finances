import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { ToastProvider } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Nexgen Finance",
  description: "Controle financeiro moderno com dashboard, historico e investimentos.",
  icons: {
    icon: [{ url: "/favicon.ico?v=2", sizes: "any", type: "image/x-icon" }],
    shortcut: ["/favicon.ico?v=2"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

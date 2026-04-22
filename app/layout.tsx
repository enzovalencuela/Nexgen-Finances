import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toaster";
import { absoluteUrl, siteConfig } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "controle financeiro pessoal",
    "planejamento financeiro",
    "fechamento mensal",
    "controle de gastos",
    "controle de cartões",
    "gestão financeira pessoal"
  ],
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)]
  },
  verification: {
    google: "oK_JHebRSmKGBc-6v3wO2Jb7Cdgg7Cx9tesvePaZs2c"
  },
  icons: {
    icon: [{ url: "/favicon.ico?v=2", sizes: "any", type: "image/x-icon" }],
    shortcut: ["/favicon.ico?v=2"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-FEN0VS1X7L" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-FEN0VS1X7L');
          `}
        </Script>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

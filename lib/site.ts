export const siteConfig = {
  name: "Nexgen Finance",
  title: "Nexgen Finance | Controle financeiro pessoal com fechamento mensal",
  description:
    "Nexgen Finance ajuda a organizar entradas, contas, cartões, faturas, investimentos e fechamento mensal em um fluxo simples e prático.",
  url: getSiteUrl(),
  locale: "pt_BR",
  ogImage: "/og-image.png"
};

export function getSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path}`;
}

export function buildPublicMetadata({ title, description, path }: { title: string; description: string; path: string }) {
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path)
    },
    openGraph: {
      url: absoluteUrl(path),
      title: `${title} | ${siteConfig.name}`,
      description,
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
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [absoluteUrl(siteConfig.ogImage)]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    }
  };
}

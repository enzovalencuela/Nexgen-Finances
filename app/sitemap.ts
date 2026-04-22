import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: absoluteUrl("/login"),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: absoluteUrl("/controle-financeiro-pessoal"),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: absoluteUrl("/fechamento-mensal"),
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: absoluteUrl("/controle-de-cartoes"),
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: absoluteUrl("/controle-de-investimentos"),
      changeFrequency: "weekly",
      priority: 0.8
    }
  ];
}

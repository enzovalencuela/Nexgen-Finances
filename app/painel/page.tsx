import type { Metadata } from "next";

import { HomeDashboard } from "@/components/home-dashboard";
import { getAppPageData, type AppPageSearchParams } from "@/lib/page-data";

export const metadata: Metadata = {
  title: "Painel",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: AppPageSearchParams;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const pageData = await getAppPageData(searchParams);

  return <HomeDashboard {...pageData} />;
}

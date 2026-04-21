import { MonthlyClosurePage } from "@/components/monthly-closure-page";
import { getAppPageData, type AppPageSearchParams } from "@/lib/page-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: AppPageSearchParams;
};

export default async function ClosurePage({ searchParams }: PageProps) {
  const pageData = await getAppPageData(searchParams);

  return <MonthlyClosurePage {...pageData} />;
}

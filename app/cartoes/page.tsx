import { CardsPage } from "@/components/cards-page";
import { getAppPageData, type AppPageSearchParams } from "@/lib/page-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: AppPageSearchParams;
};

export default async function CardsRoutePage({ searchParams }: PageProps) {
  const pageData = await getAppPageData(searchParams);

  return <CardsPage {...pageData} />;
}

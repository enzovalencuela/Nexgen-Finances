import { notFound } from "next/navigation";

import { CardDetailPage } from "@/components/card-detail-page";
import { getAppPageData, type AppPageSearchParams } from "@/lib/page-data";
import { getCardInvoiceTimeline } from "@/lib/finance";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
  searchParams?: AppPageSearchParams;
};

export default async function CardDetailRoutePage({ params, searchParams }: PageProps) {
  const pageData = await getAppPageData(searchParams);
  const selectedCard = pageData.creditCards.find((card) => card.id === params.id);

  if (!selectedCard) {
    notFound();
  }

  const timeline = await getCardInvoiceTimeline({
    userId: pageData.user.id,
    cardId: params.id,
    month: pageData.selectedMonth,
    total: 6
  });

  return <CardDetailPage {...pageData} selectedCard={selectedCard} timeline={timeline} />;
}

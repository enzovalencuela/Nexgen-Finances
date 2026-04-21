import { redirect } from "next/navigation";
import { TransactionCategory } from "@prisma/client";

import { DashboardShell } from "@/components/dashboard-shell";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/current-user";
import { getDashboardData } from "@/lib/finance";
import { toMonthInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = searchParams ?? {};
  const month = typeof params.month === "string" ? params.month : toMonthInput();
  const category = typeof params.category === "string" ? params.category : "ALL";

  const dashboardData = await getDashboardData({
    userId: user.id,
    month,
    category: category === "ALL" ? "ALL" : (category as TransactionCategory)
  });

  return <DashboardShell user={user} {...dashboardData} />;
}

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/current-user";
import { getDashboardData } from "@/lib/finance";
import { toMonthInput } from "@/lib/utils";

export type AppPageSearchParams = Record<string, string | string[] | undefined>;

export async function getAppPageData(searchParams?: AppPageSearchParams) {
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

  const dashboardData = await getDashboardData({
    userId: user.id,
    month
  });

  return {
    user,
    ...dashboardData
  };
}

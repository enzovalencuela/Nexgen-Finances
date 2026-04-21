import { AssetType, Prisma, TransactionCategory, TransactionType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { monthBounds, toMonthInput } from "@/lib/utils";
import type { DashboardTotals } from "@/lib/types";

type DashboardDataParams = {
  userId: string;
  month?: string;
  category?: TransactionCategory | "ALL";
};

export async function getDashboardData({ userId, month, category = "ALL" }: DashboardDataParams) {
  const selectedMonth = month ?? toMonthInput();
  const { start, end } = monthBounds(selectedMonth);

  const where: Prisma.TransactionWhereInput = {
    userId,
    transactionDate: {
      gte: start,
      lte: end
    },
    ...(category === "ALL" ? {} : { category })
  };

  const [transactions, investments, summary, creditCards] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        creditCard: true
      },
      orderBy: {
        transactionDate: "desc"
      }
    }),
    prisma.investment.findMany({
      where: {
        userId,
        referenceDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        referenceDate: "desc"
      }
    }),
    prisma.summary.findFirst({
      where: {
        userId,
        monthReference: {
          gte: start,
          lte: end
        }
      }
    }),
    prisma.creditCard.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    })
  ]);

  const totals = transactions.reduce<DashboardTotals>(
    (acc, transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.type === TransactionType.INCOME && transaction.status === "PAID") {
        acc.totalReceived += amount;
      }

      if (
        transaction.type === TransactionType.BILL ||
        (transaction.type === TransactionType.EXPENSE && transaction.status === "PENDING")
      ) {
        acc.totalToPay += amount;
      }

      if (transaction.type === TransactionType.INVESTMENT) {
        acc.totalInvested += amount;
      }

      if (transaction.category === TransactionCategory.NECESSARY) {
        acc.necessaryTotal += amount;
      }

      if (transaction.category === TransactionCategory.LEISURE) {
        acc.leisureTotal += amount;
      }

      if (transaction.category === TransactionCategory.INVESTMENT) {
        acc.investmentCategoryTotal += amount;
      }

      if (transaction.status === "PAID") {
        if (transaction.type === TransactionType.INCOME) {
          acc.currentBalance += amount;
        } else {
          acc.currentBalance -= amount;
        }
      }

      return acc;
    },
    {
      totalReceived: 0,
      totalToPay: 0,
      totalInvested: 0,
      currentBalance: 0,
      necessaryTotal: 0,
      leisureTotal: 0,
      investmentCategoryTotal: 0,
      cashLeftover: Number(summary?.cashBalance ?? 0),
      digitalLeftover: Number(summary?.digitalBalance ?? 0)
    }
  );

  return {
    selectedMonth,
    selectedCategory: category,
    totals,
    transactions,
    investments,
    summary,
    creditCards,
    investmentOverview: buildInvestmentOverview(investments)
  };
}

function buildInvestmentOverview(
  investments: Array<{
    assetType: AssetType;
    amountBRL: Prisma.Decimal;
    amountUSD: Prisma.Decimal | null;
  }>
) {
  return investments.reduce(
    (acc, investment) => {
      const brl = Number(investment.amountBRL);
      const usd = Number(investment.amountUSD ?? 0);

      acc.totalBRL += brl;
      acc.totalUSD += usd;
      acc.byType[investment.assetType] = (acc.byType[investment.assetType] ?? 0) + brl;

      return acc;
    },
    {
      totalBRL: 0,
      totalUSD: 0,
      byType: {} as Partial<Record<AssetType, number>>
    }
  );
}

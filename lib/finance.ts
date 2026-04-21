import { AssetType, Prisma, TransactionCategory, TransactionStatus, TransactionType } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";
import { parseSummaryMeta } from "@/lib/summary-meta";
import { monthBounds, toMonthInput } from "@/lib/utils";
import type { ClassificationTotals, DashboardTotals, MonthlyStatementData, StatementBucket, TransactionWithCard } from "@/lib/types";

type DashboardDataParams = {
  userId: string;
  month?: string;
};

export async function getDashboardData({ userId, month }: DashboardDataParams): Promise<MonthlyStatementData> {
  const prisma = getPrisma();
  const selectedMonth = month ?? toMonthInput();
  const { start, end } = monthBounds(selectedMonth);

  const where: Prisma.TransactionWhereInput = {
    userId,
    transactionDate: {
      gte: start,
      lte: end
    }
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

  const typedTransactions = transactions as TransactionWithCard[];
  const summaryMeta = parseSummaryMeta(summary?.note);

  const entries = typedTransactions.filter(
    (transaction) => transaction.type === TransactionType.INCOME && transaction.status === TransactionStatus.PAID
  );
  const payables = typedTransactions.filter((transaction) => transaction.type === TransactionType.BILL);
  const receivables = typedTransactions.filter(
    (transaction) => transaction.type === TransactionType.INCOME && transaction.status === TransactionStatus.PENDING
  );
  const expenses = typedTransactions.filter(
    (transaction) => transaction.type === TransactionType.EXPENSE && transaction.status === TransactionStatus.PAID
  );

  const payableBuckets = groupTransactions(payables, ["Cartao", "Contas Nicoli", "Outros", "Investimentos"]);
  const receivableBuckets = groupTransactions(receivables, ["Pai", "Nicoli", "Outros"]);
  const expenseBuckets = groupTransactions(expenses, ["Cartao", "Contas Nicoli", "Outros"]);
  const classificationTotals = buildClassificationTotals(expenses);
  const investmentOverview = buildInvestmentOverview(investments);

  const totals = transactions.reduce<DashboardTotals>(
    (acc, transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.type === TransactionType.INCOME && transaction.status === TransactionStatus.PAID) {
        acc.entries += amount;
      }

      if (transaction.type === TransactionType.BILL) {
        acc.payables += amount;
      }

      if (transaction.type === TransactionType.INCOME && transaction.status === TransactionStatus.PENDING) {
        acc.receivables += amount;
      }

      if (transaction.type === TransactionType.EXPENSE && transaction.status === TransactionStatus.PAID) {
        acc.expenses += amount;
      }

      return acc;
    },
    {
      entries: 0,
      payables: 0,
      receivables: 0,
      expenses: 0,
      leftover: Number(summary?.cashBalance ?? 0) + Number(summary?.digitalBalance ?? 0),
      investmentsBRL: investmentOverview.totalBRL,
      investmentsUSD: investmentOverview.totalUSD
    }
  );

  return {
    selectedMonth,
    totals,
    entries,
    payableBuckets,
    receivableBuckets,
    expenseBuckets,
    classificationTotals,
    investments,
    summary,
    summaryMeta,
    creditCards,
    investmentOverview
  };
}

function groupTransactions(transactions: TransactionWithCard[], preferredOrder: string[]): StatementBucket[] {
  const buckets = new Map<string, StatementBucket>();

  for (const transaction of transactions) {
    const label = transaction.source?.trim() || "Outros";
    const key = label.toLowerCase();
    const current = buckets.get(key);

    if (current) {
      current.total += Number(transaction.amount);
      current.items.push(transaction);
      continue;
    }

    buckets.set(key, {
      key,
      label,
      total: Number(transaction.amount),
      items: [transaction]
    });
  }

  return Array.from(buckets.values()).sort((left, right) => {
    const leftIndex = preferredOrder.findIndex((item) => item.toLowerCase() === left.label.toLowerCase());
    const rightIndex = preferredOrder.findIndex((item) => item.toLowerCase() === right.label.toLowerCase());

    const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight;
    }

    return left.label.localeCompare(right.label);
  });
}

function buildClassificationTotals(transactions: TransactionWithCard[]): ClassificationTotals {
  return transactions.reduce<ClassificationTotals>(
    (acc, transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.category === TransactionCategory.NECESSARY) {
        acc.necessary += amount;
      } else if (transaction.category === TransactionCategory.LEISURE) {
        acc.leisure += amount;
      } else if (transaction.category === TransactionCategory.INVESTMENT) {
        acc.investment += amount;
      } else {
        acc.optional += amount;
      }

      return acc;
    },
    {
      necessary: 0,
      optional: 0,
      leisure: 0,
      investment: 0
    }
  );
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

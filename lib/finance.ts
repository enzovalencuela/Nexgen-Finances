import { AssetType, Prisma, TransactionCategory, TransactionStatus, TransactionType } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";
import { parseSummaryMeta } from "@/lib/summary-meta";
import { monthBounds, toMonthInput } from "@/lib/utils";
import type { ClassificationTotals, DashboardTotals, MonthlyStatementData, StatementBucket, TransactionWithCard } from "@/lib/types";

type DashboardDataParams = {
  userId: string;
  month?: string;
};

type InvestmentSnapshot = {
  id: string;
  userId: string;
  name: string;
  ticker: string | null;
  assetType: AssetType;
  institution: string | null;
  quantity: Prisma.Decimal | null;
  amountBRL: Prisma.Decimal;
  usdRate: Prisma.Decimal | null;
  amountUSD: Prisma.Decimal | null;
  referenceDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getDashboardData({ userId, month }: DashboardDataParams): Promise<MonthlyStatementData> {
  const prisma = getPrisma();
  const selectedMonth = month ?? toMonthInput();
  const { start, end } = monthBounds(selectedMonth);
  const previousMonth = toMonthInput(new Date(start.getFullYear(), start.getMonth() - 1, 1));
  const previousMonthBounds = monthBounds(previousMonth);

  const where: Prisma.TransactionWhereInput = {
    userId,
    transactionDate: {
      gte: start,
      lte: end
    }
  };

  const [transactions, investmentHistory, summary, creditCards, previousSummary] = await Promise.all([
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
          lte: end
        }
      },
      orderBy: [{ referenceDate: "desc" }, { updatedAt: "desc" }]
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
    }),
    prisma.summary.findFirst({
      where: {
        userId,
        monthReference: {
          gte: previousMonthBounds.start,
          lte: previousMonthBounds.end
        }
      }
    })
  ]);

  const typedTransactions = transactions as TransactionWithCard[];
  const investments = collapseInvestmentHistory(investmentHistory);
  const summaryMeta = parseSummaryMeta(summary?.note);

  const persistedEntries = typedTransactions.filter(
    (transaction) => transaction.type === TransactionType.INCOME && transaction.status === TransactionStatus.PAID
  );
  const carryoverEntry = buildCarryoverEntry({
    userId,
    currentMonthStart: start,
    previousSummary,
    persistedEntries
  });
  const entries = sortTransactionsByDateDesc(carryoverEntry ? [...persistedEntries, carryoverEntry] : persistedEntries);
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
      entries: carryoverEntry ? Number(carryoverEntry.amount) : 0,
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

function buildCarryoverEntry({
  userId,
  currentMonthStart,
  previousSummary,
  persistedEntries
}: {
  userId: string;
  currentMonthStart: Date;
  previousSummary: { cashBalance: Prisma.Decimal; digitalBalance: Prisma.Decimal } | null;
  persistedEntries: TransactionWithCard[];
}): TransactionWithCard | null {
  if (!previousSummary || hasCarryoverEntry(persistedEntries)) {
    return null;
  }

  const amount = Number(previousSummary.cashBalance ?? 0) + Number(previousSummary.digitalBalance ?? 0);

  if (amount <= 0) {
    return null;
  }

  return {
    id: `carryover-${userId}-${currentMonthStart.toISOString().slice(0, 7)}`,
    userId,
    title: "Mes Passado",
    description: "Entrada automatica baseada na sobra do mes anterior.",
    type: TransactionType.INCOME,
    category: TransactionCategory.OTHER,
    amount: new Prisma.Decimal(amount),
    transactionDate: currentMonthStart,
    status: TransactionStatus.PAID,
    source: "Mes Passado",
    isCreditCard: false,
    installmentCurrent: null,
    installmentTotal: null,
    creditCardId: null,
    creditCard: null,
    createdAt: currentMonthStart,
    updatedAt: currentMonthStart,
    isDerived: true
  };
}

function hasCarryoverEntry(entries: TransactionWithCard[]) {
  return entries.some((entry) => {
    const title = normalizeEntryText(entry.title);
    const source = normalizeEntryText(entry.source);

    return title.includes("mes passado") || source.includes("mes passado") || title.includes("saldo anterior") || source.includes("saldo anterior");
  });
}

function normalizeEntryText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function sortTransactionsByDateDesc(transactions: TransactionWithCard[]) {
  return [...transactions].sort((left, right) => {
    const dateDiff = new Date(right.transactionDate).getTime() - new Date(left.transactionDate).getTime();

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

function collapseInvestmentHistory(investments: InvestmentSnapshot[]) {
  const latestByAsset = new Map<string, InvestmentSnapshot>();

  for (const investment of investments) {
    const key = buildInvestmentKey(investment);

    if (!latestByAsset.has(key)) {
      latestByAsset.set(key, investment);
    }
  }

  return Array.from(latestByAsset.values()).sort((left, right) => {
    const dateDiff = new Date(right.referenceDate).getTime() - new Date(left.referenceDate).getTime();

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return left.name.localeCompare(right.name);
  });
}

function buildInvestmentKey(investment: {
  name: string;
  ticker: string | null;
  institution: string | null;
  assetType: AssetType;
}) {
  const baseKey = investment.ticker?.trim().length
    ? normalizeText(investment.ticker)
    : normalizeText(investment.name);

  return [investment.assetType, baseKey, normalizeText(investment.institution)].join("::");
}

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

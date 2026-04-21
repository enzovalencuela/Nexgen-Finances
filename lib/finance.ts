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

type InstallmentOrigin = TransactionWithCard;

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

  const [transactions, investmentHistory, summary, creditCards, previousSummary, previousFilledSummary, installmentOrigins] = await Promise.all([
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
    }),
    prisma.summary.findFirst({
      where: {
        userId,
        monthReference: {
          lt: start
        }
      },
      orderBy: {
        monthReference: "desc"
      }
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.BILL,
        isCreditCard: true,
        installmentCurrent: {
          not: null
        },
        installmentTotal: {
          not: null
        },
        transactionDate: {
          lt: start
        }
      },
      include: {
        creditCard: true
      },
      orderBy: {
        transactionDate: "desc"
      }
    })
  ]);

  const typedTransactions = transactions as TransactionWithCard[];
  const generatedInstallments = buildGeneratedInstallments({
    selectedMonthStart: start,
    currentMonthTransactions: typedTransactions,
    installmentOrigins: installmentOrigins as InstallmentOrigin[]
  });
  const monthTransactions = sortTransactionsByDateDesc([...typedTransactions, ...generatedInstallments]);
  const investments = collapseInvestmentHistory(investmentHistory);
  const effectiveSummary = summary ?? previousFilledSummary;
  const summaryMeta = parseSummaryMeta(effectiveSummary?.note);

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
  const payableAdjustments = buildCardPaymentAdjustments(typedTransactions);
  const payables = sortTransactionsByDateDesc([
    ...monthTransactions.filter((transaction) => transaction.type === TransactionType.BILL),
    ...payableAdjustments
  ]);
  const receivables = monthTransactions.filter(
    (transaction) => transaction.type === TransactionType.INCOME && transaction.status === TransactionStatus.PENDING
  );
  const expenses = monthTransactions.filter(
    (transaction) => transaction.type === TransactionType.EXPENSE && transaction.status === TransactionStatus.PAID
  );

  const payableBuckets = groupTransactions(payables, ["Cartao", "Contas Nicoli", "Outros", "Investimentos"]);
  const receivableBuckets = groupTransactions(receivables, ["Pai", "Nicoli", "Outros"]);
  const expenseBuckets = groupTransactions(expenses, ["Cartao", "Contas Nicoli", "Outros"]);
  const classificationTotals = buildClassificationTotals(expenses);
  const investmentOverview = buildInvestmentOverview(investments);

  const summaryLeftover = Number(summary?.cashBalance ?? 0) + Number(summary?.digitalBalance ?? 0);

  const totals: DashboardTotals = {
    entries: sumTransactions(entries),
    payables: sumTransactions(payables),
    receivables: sumTransactions(receivables),
    expenses: sumTransactions(expenses),
    leftover: summaryLeftover,
    investmentsBRL: investmentOverview.totalBRL,
    investmentsUSD: investmentOverview.totalUSD
  };

  if (!summary) {
    totals.leftover = Math.max(totals.entries - totals.expenses, 0);
  }

  return {
    selectedMonth,
    totals,
    entries,
    payableBuckets,
    receivableBuckets,
    expenseBuckets,
    classificationTotals,
    investments,
    summary: effectiveSummary,
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
    isDerived: true,
    derivedKind: "carryover"
  };
}

function buildGeneratedInstallments({
  selectedMonthStart,
  currentMonthTransactions,
  installmentOrigins
}: {
  selectedMonthStart: Date;
  currentMonthTransactions: TransactionWithCard[];
  installmentOrigins: InstallmentOrigin[];
}): TransactionWithCard[] {
  const generated: TransactionWithCard[] = [];

  for (const origin of installmentOrigins) {
    if (!origin.installmentCurrent || !origin.installmentTotal) {
      continue;
    }

    const monthOffset = diffInMonths(startOfMonth(origin.transactionDate), selectedMonthStart);

    if (monthOffset <= 0) {
      continue;
    }

    const nextInstallment = origin.installmentCurrent + monthOffset;

    if (nextInstallment > origin.installmentTotal) {
      continue;
    }

    if (hasMatchingPersistedInstallment(currentMonthTransactions, origin, nextInstallment)) {
      continue;
    }

    const installmentDate = addMonthsKeepingDay(origin.transactionDate, monthOffset);

    generated.push({
      ...origin,
      id: `${origin.id}-generated-${nextInstallment}`,
      description: `Parcela automatica ${nextInstallment}/${origin.installmentTotal} gerada a partir da compra original.`,
      transactionDate: installmentDate,
      installmentCurrent: nextInstallment,
      createdAt: installmentDate,
      updatedAt: installmentDate,
      isDerived: true,
      derivedKind: "installment"
    });
  }

  return generated;
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

function buildCardPaymentAdjustments(transactions: TransactionWithCard[]) {
  return transactions
    .filter((transaction) => transaction.type === TransactionType.EXPENSE && transaction.status === TransactionStatus.PAID && transaction.creditCardId && !transaction.isCreditCard)
    .map<TransactionWithCard>((transaction) => ({
      ...transaction,
      title: `Abatimento da fatura${transaction.creditCard?.name ? ` - ${transaction.creditCard.name}` : ""}`,
      description: "Pagamento de fatura abatido automaticamente do total do cartao.",
      type: TransactionType.BILL,
      source: "Cartao",
      amount: new Prisma.Decimal(-Number(transaction.amount)),
      derivedKind: "cardPayment"
    }));
}

function sumTransactions(transactions: TransactionWithCard[]) {
  return transactions.reduce((total, transaction) => total + Number(transaction.amount), 0);
}

function hasMatchingPersistedInstallment(transactions: TransactionWithCard[], origin: InstallmentOrigin, installmentCurrent: number) {
  return transactions.some((transaction) => {
    return (
      transaction.type === TransactionType.BILL &&
      transaction.isCreditCard &&
      transaction.installmentCurrent === installmentCurrent &&
      transaction.installmentTotal === origin.installmentTotal &&
      Number(transaction.amount) === Number(origin.amount) &&
      transaction.creditCardId === origin.creditCardId &&
      normalizeText(transaction.title) === normalizeText(origin.title) &&
      normalizeText(transaction.source) === normalizeText(origin.source)
    );
  });
}

function startOfMonth(date: Date | string) {
  const normalized = new Date(date);
  return new Date(normalized.getFullYear(), normalized.getMonth(), 1);
}

function diffInMonths(left: Date, right: Date) {
  return (right.getFullYear() - left.getFullYear()) * 12 + (right.getMonth() - left.getMonth());
}

function addMonthsKeepingDay(date: Date | string, monthsToAdd: number) {
  const source = new Date(date);
  const targetYear = source.getFullYear();
  const targetMonthIndex = source.getMonth() + monthsToAdd;
  const lastDayOfTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  const targetDay = Math.min(source.getDate(), lastDayOfTargetMonth);

  return new Date(
    source.getFullYear(),
    source.getMonth() + monthsToAdd,
    targetDay,
    source.getHours(),
    source.getMinutes(),
    source.getSeconds(),
    source.getMilliseconds()
  );
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

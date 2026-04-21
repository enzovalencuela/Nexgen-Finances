import type { CreditCard, Investment, Summary, Transaction } from "@prisma/client";

import type { SummaryMeta } from "@/lib/summary-meta";

export type DashboardTotals = {
  entries: number;
  payables: number;
  receivables: number;
  expenses: number;
  leftover: number;
  investmentsBRL: number;
  investmentsUSD: number;
};

export type TransactionWithCard = Transaction & {
  creditCard: CreditCard | null;
  isDerived?: boolean;
  derivedKind?: "carryover" | "installment" | "cardPayment" | "overdueCardBill";
};

export type StatementBucket = {
  key: string;
  label: string;
  total: number;
  items: TransactionWithCard[];
};

export type CardInvoiceSection = {
  key: "overdue" | "current" | "installments" | "payments";
  title: string;
  description: string;
  total: number;
  items: TransactionWithCard[];
  emptyMessage: string;
};

export type CardInvoiceView = {
  creditCard: CreditCard;
  invoiceTotal: number;
  openChargesTotal: number;
  overdueTotal: number;
  currentChargesTotal: number;
  installmentChargesTotal: number;
  paymentsTotal: number;
  sections: CardInvoiceSection[];
};

export type ClassificationTotals = {
  necessary: number;
  optional: number;
  leisure: number;
  investment: number;
};

export type MonthlyStatementData = {
  selectedMonth: string;
  totals: DashboardTotals;
  entries: TransactionWithCard[];
  payableBuckets: StatementBucket[];
  receivableBuckets: StatementBucket[];
  expenseBuckets: StatementBucket[];
  classificationTotals: ClassificationTotals;
  creditCards: CreditCard[];
  investments: Investment[];
  investmentOverview: {
    totalBRL: number;
    totalUSD: number;
    byType: Partial<Record<Investment["assetType"], number>>;
  };
  summary: Summary | null;
  summaryMeta: SummaryMeta;
  cardInvoices: CardInvoiceView[];
};

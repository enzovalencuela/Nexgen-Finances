import { AssetType, TransactionCategory, TransactionStatus, TransactionType } from "@prisma/client";

export type DashboardTotals = {
  totalReceived: number;
  totalToPay: number;
  totalInvested: number;
  currentBalance: number;
  necessaryTotal: number;
  leisureTotal: number;
  investmentCategoryTotal: number;
  cashLeftover: number;
  digitalLeftover: number;
};

export type TransactionFormState = {
  title: string;
  description?: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  transactionDate: string;
  status: TransactionStatus;
  source?: string;
  isCreditCard?: boolean;
  installmentCurrent?: number;
  installmentTotal?: number;
  creditCardId?: string;
};

export type InvestmentFormState = {
  name: string;
  ticker?: string;
  assetType: AssetType;
  institution?: string;
  quantity?: number;
  amountBRL: number;
  usdRate?: number;
  referenceDate: string;
  notes?: string;
};

import { AssetType, TransactionCategory, TransactionStatus, TransactionType } from "@prisma/client";

export const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: "Entrada",
  EXPENSE: "Saída",
  INVESTMENT: "Investimento",
  BILL: "Contas a pagar"
};

export const transactionCategoryLabels: Record<TransactionCategory, string> = {
  NECESSARY: "Necessário",
  LEISURE: "Lazer",
  INVESTMENT: "Investimentos",
  HOUSING: "Moradia",
  TRANSPORT: "Transporte",
  FOOD: "Alimentação",
  HEALTH: "Saúde",
  EDUCATION: "Educação",
  UTILITIES: "Serviços",
  OTHER: "Outros"
};

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  PAID: "Pago",
  PENDING: "Pendente"
};

export const assetTypeLabels: Record<AssetType, string> = {
  CDB: "CDB",
  LCI: "LCI",
  FUND: "Fundo",
  CRYPTO: "Cripto",
  ETF: "ETF",
  STOCK: "Ação",
  OTHER: "Outro"
};

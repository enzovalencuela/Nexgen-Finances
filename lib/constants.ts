import { AssetType, TransactionCategory, TransactionStatus, TransactionType } from "@prisma/client";

export const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: "Entrada",
  EXPENSE: "Saida",
  INVESTMENT: "Investimento",
  BILL: "Contas a pagar"
};

export const transactionCategoryLabels: Record<TransactionCategory, string> = {
  NECESSARY: "Necessario",
  LEISURE: "Lazer",
  INVESTMENT: "Investimentos",
  HOUSING: "Moradia",
  TRANSPORT: "Transporte",
  FOOD: "Alimentacao",
  HEALTH: "Saude",
  EDUCATION: "Educacao",
  UTILITIES: "Servicos",
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
  STOCK: "Acao",
  OTHER: "Outro"
};

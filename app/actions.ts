"use server";

import { revalidatePath } from "next/cache";
import { AssetType, TransactionCategory, TransactionStatus, TransactionType } from "@prisma/client";
import { z } from "zod";

import { getRequiredCurrentUser } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { stringifySummaryMeta } from "@/lib/summary-meta";

const transactionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(TransactionCategory),
  amount: z.coerce.number().positive(),
  transactionDate: z.string().min(1),
  status: z.nativeEnum(TransactionStatus),
  source: z.string().optional(),
  isCreditCard: z.coerce.boolean().optional(),
  installmentCurrent: z.coerce.number().int().positive().optional(),
  installmentTotal: z.coerce.number().int().positive().optional(),
  creditCardId: z.string().optional()
});

const investmentSchema = z.object({
  name: z.string().min(2),
  ticker: z.string().optional(),
  assetType: z.nativeEnum(AssetType),
  institution: z.string().optional(),
  quantity: z.coerce.number().positive().optional(),
  amountBRL: z.coerce.number().positive(),
  usdRate: z.coerce.number().positive().optional(),
  referenceDate: z.string().min(1),
  notes: z.string().optional()
});

const summarySchema = z.object({
  monthReference: z.string().min(1),
  cashBalance: z.coerce.number(),
  digitalBalance: z.coerce.number(),
  salaryBase: z.coerce.number().min(0).optional(),
  purchaseEstimate: z.coerce.number().min(0).optional(),
  investmentWithdrawn: z.coerce.number().min(0).optional(),
  noteText: z.string().optional()
});

const creditCardSchema = z.object({
  name: z.string().min(2),
  brand: z.string().optional(),
  closingDay: z.coerce.number().int().min(1).max(31).optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  note: z.string().optional()
});

const transactionUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(TransactionCategory),
  amount: z.coerce.number().positive(),
  transactionDate: z.string().min(1),
  status: z.nativeEnum(TransactionStatus),
  source: z.string().optional(),
  isCreditCard: z.coerce.boolean().optional(),
  installmentCurrent: z.coerce.number().int().positive().optional(),
  installmentTotal: z.coerce.number().int().positive().optional(),
  creditCardId: z.string().optional()
});

const investmentUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  ticker: z.string().optional(),
  assetType: z.nativeEnum(AssetType),
  institution: z.string().optional(),
  quantity: z.coerce.number().positive().optional(),
  amountBRL: z.coerce.number().min(0),
  amountUSD: z.coerce.number().min(0).optional(),
  referenceDate: z.string().min(1),
  notes: z.string().optional()
});

async function getCurrentUserId() {
  const user = await getRequiredCurrentUser();
  return user.id;
}

export async function createTransaction(formData: FormData) {
  const userId = await getCurrentUserId();
  const prisma = getPrisma();

  const parsed = transactionSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    transactionDate: formData.get("transactionDate"),
    status: formData.get("status"),
    source: formData.get("source") || undefined,
    isCreditCard: formData.get("isCreditCard") === "on",
    installmentCurrent: formData.get("installmentCurrent") || undefined,
    installmentTotal: formData.get("installmentTotal") || undefined,
    creditCardId: formData.get("creditCardId") || undefined
  });

  await prisma.transaction.create({
    data: {
      userId,
      title: parsed.title,
      description: parsed.description,
      type: parsed.type,
      category: parsed.category,
      amount: parsed.amount,
      transactionDate: new Date(parsed.transactionDate),
      status: parsed.status,
      source: parsed.source,
      isCreditCard: parsed.isCreditCard ?? false,
      installmentCurrent: parsed.installmentCurrent,
      installmentTotal: parsed.installmentTotal,
      creditCardId: parsed.creditCardId || null
    }
  });

  revalidatePath("/");
}

export async function updateTransaction(formData: FormData) {
  const userId = await getCurrentUserId();
  const prisma = getPrisma();

  const parsed = transactionUpdateSchema.parse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    transactionDate: formData.get("transactionDate"),
    status: formData.get("status"),
    source: formData.get("source") || undefined,
    isCreditCard: formData.get("isCreditCard") === "on",
    installmentCurrent: formData.get("installmentCurrent") || undefined,
    installmentTotal: formData.get("installmentTotal") || undefined,
    creditCardId: formData.get("creditCardId") || undefined
  });

  const result = await prisma.transaction.updateMany({
    where: {
      id: parsed.id,
      userId
    },
    data: {
      title: parsed.title,
      description: parsed.description,
      type: parsed.type,
      category: parsed.category,
      amount: parsed.amount,
      transactionDate: new Date(parsed.transactionDate),
      status: parsed.status,
      source: parsed.source,
      isCreditCard: parsed.isCreditCard ?? false,
      installmentCurrent: parsed.installmentCurrent,
      installmentTotal: parsed.installmentTotal,
      creditCardId: parsed.creditCardId || null
    }
  });

  if (result.count === 0) {
    throw new Error("Lancamento nao encontrado para edicao.");
  }

  revalidatePath("/");
}

export async function deleteTransaction(formData: FormData) {
  const userId = await getCurrentUserId();
  const prisma = getPrisma();
  const id = z.string().min(1).parse(formData.get("id"));

  const result = await prisma.transaction.deleteMany({
    where: {
      id,
      userId
    }
  });

  if (result.count === 0) {
    throw new Error("Lancamento nao encontrado para exclusao.");
  }

  revalidatePath("/");
}

export async function createInvestment(formData: FormData) {
  const userId = await getCurrentUserId();
  const prisma = getPrisma();
  const parsed = investmentSchema.parse({
    name: formData.get("name"),
    ticker: formData.get("ticker") || undefined,
    assetType: formData.get("assetType"),
    institution: formData.get("institution") || undefined,
    quantity: formData.get("quantity") || undefined,
    amountBRL: formData.get("amountBRL"),
    usdRate: formData.get("usdRate") || undefined,
    referenceDate: formData.get("referenceDate"),
    notes: formData.get("notes") || undefined
  });

  const amountUSD = parsed.usdRate ? parsed.amountBRL / parsed.usdRate : undefined;

  await prisma.investment.create({
    data: {
      userId,
      name: parsed.name,
      ticker: parsed.ticker,
      assetType: parsed.assetType,
      institution: parsed.institution,
      quantity: parsed.quantity,
      amountBRL: parsed.amountBRL,
      usdRate: parsed.usdRate,
      amountUSD,
      referenceDate: new Date(parsed.referenceDate),
      notes: parsed.notes
    }
  });

  revalidatePath("/");
}

export async function updateInvestment(formData: FormData) {
  const userId = await getCurrentUserId();
  const prisma = getPrisma();
  const parsed = investmentUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    ticker: formData.get("ticker") || undefined,
    assetType: formData.get("assetType"),
    institution: formData.get("institution") || undefined,
    quantity: formData.get("quantity") || undefined,
    amountBRL: formData.get("amountBRL"),
    amountUSD: formData.get("amountUSD") || undefined,
    referenceDate: formData.get("referenceDate"),
    notes: formData.get("notes") || undefined
  });

  const result = await prisma.investment.updateMany({
    where: {
      id: parsed.id,
      userId
    },
    data: {
      name: parsed.name,
      ticker: parsed.ticker,
      assetType: parsed.assetType,
      institution: parsed.institution,
      quantity: parsed.quantity,
      amountBRL: parsed.amountBRL,
      amountUSD: parsed.amountUSD,
      referenceDate: new Date(parsed.referenceDate),
      notes: parsed.notes
    }
  });

  if (result.count === 0) {
    throw new Error("Investimento nao encontrado para edicao.");
  }

  revalidatePath("/");
}

export async function deleteInvestment(formData: FormData) {
  const userId = await getCurrentUserId();
  const prisma = getPrisma();
  const id = z.string().min(1).parse(formData.get("id"));

  const result = await prisma.investment.deleteMany({
    where: {
      id,
      userId
    }
  });

  if (result.count === 0) {
    throw new Error("Investimento nao encontrado para exclusao.");
  }

  revalidatePath("/");
}

export async function upsertSummary(formData: FormData) {
  const userId = await getCurrentUserId();
  const prisma = getPrisma();
  const parsed = summarySchema.parse({
    monthReference: formData.get("monthReference"),
    cashBalance: formData.get("cashBalance"),
    digitalBalance: formData.get("digitalBalance"),
    salaryBase: formData.get("salaryBase") || undefined,
    purchaseEstimate: formData.get("purchaseEstimate") || undefined,
    investmentWithdrawn: formData.get("investmentWithdrawn") || undefined,
    noteText: formData.get("noteText") || undefined
  });

  const note = stringifySummaryMeta({
    salaryBase: parsed.salaryBase,
    purchaseEstimate: parsed.purchaseEstimate,
    investmentWithdrawn: parsed.investmentWithdrawn,
    noteText: parsed.noteText
  });

  const [year, month] = parsed.monthReference.split("-").map(Number);
  const monthReference = new Date(year, month - 1, 1);

  await prisma.summary.upsert({
    where: {
      userId_monthReference: {
        userId,
        monthReference
      }
    },
    update: {
      cashBalance: parsed.cashBalance,
      digitalBalance: parsed.digitalBalance,
      note
    },
    create: {
      userId,
      monthReference,
      cashBalance: parsed.cashBalance,
      digitalBalance: parsed.digitalBalance,
      note
    }
  });

  revalidatePath("/");
}

export async function createCreditCard(formData: FormData) {
  const userId = await getCurrentUserId();
  const prisma = getPrisma();
  const parsed = creditCardSchema.parse({
    name: formData.get("name"),
    brand: formData.get("brand") || undefined,
    closingDay: formData.get("closingDay") || undefined,
    dueDay: formData.get("dueDay") || undefined,
    note: formData.get("note") || undefined
  });

  await prisma.creditCard.create({
    data: {
      userId,
      name: parsed.name,
      brand: parsed.brand,
      closingDay: parsed.closingDay,
      dueDay: parsed.dueDay,
      note: parsed.note
    }
  });

  revalidatePath("/");
}

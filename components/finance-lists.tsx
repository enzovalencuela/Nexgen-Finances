import Link from "next/link";
import type { CreditCard, Investment } from "@prisma/client";

import { EditableCreditCard } from "@/components/editable-credit-card";
import { EditableInvestmentCard } from "@/components/editable-investment-card";
import { EditableTransactionCard } from "@/components/editable-transaction-card";
import { cn, formatCurrency } from "@/lib/utils";
import type { StatementBucket, TransactionWithCard } from "@/lib/types";

export function TransactionList({
  items,
  emptyMessage,
  creditCards,
  accentClass,
  compact = false
}: {
  items: TransactionWithCard[];
  emptyMessage: string;
  creditCards: CreditCard[];
  accentClass: string;
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-[13px] text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((transaction) => (
        <EditableTransactionCard key={transaction.id} transaction={transaction} creditCards={creditCards} accentClass={accentClass} compact={compact} />
      ))}
    </div>
  );
}

export function BucketList({
  buckets,
  emptyMessage,
  creditCards,
  accentClass
}: {
  buckets: StatementBucket[];
  emptyMessage: string;
  creditCards: CreditCard[];
  accentClass: string;
}) {
  if (buckets.length === 0) {
    return <p className="text-[13px] text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {buckets.map((bucket) => (
        <div key={bucket.key} className="rounded-xl border border-slate-300 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
            <h3 className="text-[13px] font-semibold text-slate-900">{bucket.label}</h3>
            <p className={cn("text-[13px] font-semibold", accentClass)}>{formatCurrency(bucket.total)}</p>
          </div>
          <TransactionList items={bucket.items} emptyMessage="Nenhum item." creditCards={creditCards} accentClass={accentClass} compact />
        </div>
      ))}
    </div>
  );
}

export function CreditCardList({ creditCards }: { creditCards: CreditCard[] }) {
  if (creditCards.length === 0) {
    return <p className="text-[13px] text-slate-500">Nenhum cartão cadastrado ainda.</p>;
  }

  return (
    <div className="grid gap-3">
      {creditCards.map((creditCard) => (
        <div key={creditCard.id} className="space-y-2">
          <Link
            href={`/cartoes/${creditCard.id}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-accent/15 bg-accent/5 px-4 py-2 text-[13px] text-accent transition hover:bg-accent/10"
          >
            Abrir página do cartão
          </Link>
          <EditableCreditCard creditCard={creditCard} />
        </div>
      ))}
    </div>
  );
}

export function InvestmentList({ investments }: { investments: Investment[] }) {
  if (investments.length === 0) {
    return <p className="text-[13px] text-slate-500">Nenhum ativo registrado neste período.</p>;
  }

  return (
    <div className="space-y-3">
      {investments.map((investment) => (
        <EditableInvestmentCard key={investment.id} investment={investment} />
      ))}
    </div>
  );
}

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
    return <p className="text-sm text-slate-300">{emptyMessage}</p>;
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
    return <p className="text-sm text-slate-300">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {buckets.map((bucket) => (
        <div key={bucket.key} className="rounded-[26px] border border-white/10 bg-slate-950/15 p-4">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-white">{bucket.label}</h3>
            <p className={cn("text-lg font-semibold", accentClass)}>{formatCurrency(bucket.total)}</p>
          </div>
          <TransactionList items={bucket.items} emptyMessage="Nenhum item." creditCards={creditCards} accentClass={accentClass} compact />
        </div>
      ))}
    </div>
  );
}

export function CreditCardList({ creditCards }: { creditCards: CreditCard[] }) {
  if (creditCards.length === 0) {
    return <p className="text-sm text-slate-300">Nenhum cartao cadastrado ainda.</p>;
  }

  return (
    <div className="grid gap-3">
      {creditCards.map((creditCard) => (
        <div key={creditCard.id} className="space-y-2">
          <Link
            href={`/cartoes/${creditCard.id}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-accent/15 bg-accent/5 px-4 py-2 text-sm text-accent transition hover:bg-accent/10"
          >
            Abrir pagina do cartao
          </Link>
          <EditableCreditCard creditCard={creditCard} />
        </div>
      ))}
    </div>
  );
}

export function InvestmentList({ investments }: { investments: Investment[] }) {
  if (investments.length === 0) {
    return <p className="text-sm text-slate-300">Nenhum ativo registrado neste periodo.</p>;
  }

  return (
    <div className="space-y-3">
      {investments.map((investment) => (
        <EditableInvestmentCard key={investment.id} investment={investment} />
      ))}
    </div>
  );
}

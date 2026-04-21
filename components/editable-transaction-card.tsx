import { TransactionCategory, TransactionStatus, TransactionType, type CreditCard } from "@prisma/client";

import { deleteTransaction, updateTransaction } from "@/app/actions";
import { transactionCategoryLabels, transactionStatusLabels, transactionTypeLabels } from "@/lib/constants";
import type { TransactionWithCard } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Props = {
  transaction: TransactionWithCard;
  creditCards: CreditCard[];
  accentClass: string;
  compact?: boolean;
};

export function EditableTransactionCard({ transaction, creditCards, accentClass, compact = false }: Props) {
  const defaultDate = new Date(transaction.transactionDate).toISOString().slice(0, 10);

  if (transaction.isDerived) {
    const isCarryover = transaction.derivedKind === "carryover";

    return (
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/5 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-white">{transaction.title}</p>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                {isCarryover ? "Automatico" : "Parcela automatica"}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {transaction.source ? `${transaction.source} • ` : ""}
              {formatDate(transaction.transactionDate)}
              {!isCarryover && transaction.installmentCurrent && transaction.installmentTotal
                ? ` • ${transaction.installmentCurrent}/${transaction.installmentTotal}`
                : ""}
            </p>
            <p className="mt-2 text-xs text-slate-400">{transaction.description}</p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-white">{formatCurrency(Number(transaction.amount))}</p>
            <p className={`text-xs font-medium ${accentClass}`}>{isCarryover ? "Entrada inicial automatica" : "Cobranca futura automatica"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <details className="group rounded-2xl border border-white/10 bg-slate-950/20 p-4 open:bg-slate-950/35">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">{transaction.title}</p>
            <p className="text-sm text-slate-300">
              {transaction.source ? `${transaction.source} • ` : ""}
              {formatDate(transaction.transactionDate)}
              {transaction.isCreditCard && transaction.installmentCurrent && transaction.installmentTotal
                ? ` • ${transaction.installmentCurrent}/${transaction.installmentTotal}`
                : ""}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-white">{formatCurrency(Number(transaction.amount))}</p>
            <p className={`text-xs font-medium ${accentClass}`}>{transactionStatusLabels[transaction.status]}</p>
          </div>
        </div>
      </summary>

      <div className="mt-4 border-t border-white/10 pt-4">
        <ActionForm serverAction={updateTransaction} className="grid gap-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={transaction.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="title" defaultValue={transaction.title} />
            <Input name="source" defaultValue={transaction.source ?? ""} placeholder="Grupo" />
          </div>
          <Input name="description" defaultValue={transaction.description ?? ""} placeholder="Descricao" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select name="type" defaultValue={transaction.type}>
              {Object.entries(transactionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select name="category" defaultValue={transaction.category}>
              {Object.entries(transactionCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select name="status" defaultValue={transaction.status}>
              {Object.entries(transactionStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input name="amount" type="number" step="0.01" defaultValue={Number(transaction.amount)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input name="transactionDate" type="date" defaultValue={defaultDate} />
            <Select name="creditCardId" defaultValue={transaction.creditCardId ?? ""}>
              <option value="">Sem cartao</option>
              {creditCards.map((creditCard) => (
                <option key={creditCard.id} value={creditCard.id}>
                  {creditCard.name}
                </option>
              ))}
            </Select>
            <Input name="installmentCurrent" type="number" min="1" defaultValue={transaction.installmentCurrent ?? ""} placeholder="Parcela atual" />
            <Input name="installmentTotal" type="number" min="1" defaultValue={transaction.installmentTotal ?? ""} placeholder="Total parcelas" />
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input type="checkbox" name="isCreditCard" defaultChecked={transaction.isCreditCard} className="h-4 w-4 rounded" />
            Movimento no cartao
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="secondary">
              Salvar
            </Button>
          </div>
        </ActionForm>

        <ActionForm serverAction={deleteTransaction} className="mt-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={transaction.id} />
          <Button type="submit" variant="ghost" className="px-0 text-rose-300 hover:text-rose-200">
            Excluir item
          </Button>
        </ActionForm>
      </div>
    </details>
  );
}

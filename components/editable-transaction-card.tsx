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
  const isEditableDerived = transaction.derivedKind === "cardPayment" || transaction.derivedKind === "overdueCardBill" || transaction.derivedKind === "overdueReceivable";
  const isOverdueCardBill = transaction.derivedKind === "overdueCardBill";
  const isOverdueReceivable = transaction.derivedKind === "overdueReceivable";
  const isReadOnlyDerived = transaction.isDerived && !isEditableDerived;

  if (isReadOnlyDerived) {
    const isCarryover = transaction.derivedKind === "carryover";

    return (
      <div className="rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{transaction.title}</p>
                <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {isCarryover ? "Automático" : "Parcela automática"}
                </span>
              </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              {transaction.source ? `${transaction.source} • ` : ""}
              {formatDate(transaction.transactionDate)}
              {!isCarryover && transaction.installmentCurrent && transaction.installmentTotal ? ` • ${transaction.installmentCurrent}/${transaction.installmentTotal}` : ""}
            </p>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{transaction.description}</p>
          </div>

          <div className="text-right">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(Number(transaction.amount))}</p>
            <p className={`text-[11px] font-medium ${accentClass}`}>{isCarryover ? "Entrada inicial automática" : "Cobrança futura automática"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <details className="group rounded-xl border border-slate-300 bg-white p-3 open:bg-[#f7f4ee] dark:border-slate-700 dark:bg-slate-900 dark:open:bg-slate-800/70">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
               <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{transaction.title}</p>
              {isOverdueCardBill || isOverdueReceivable ? (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                  {isOverdueReceivable ? "Pendente" : "Atrasado"}
                </span>
              ) : null}
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              {transaction.source ? `${transaction.source} • ` : ""}
              {formatDate(transaction.transactionDate)}
              {transaction.isCreditCard && transaction.installmentCurrent && transaction.installmentTotal
                ? ` • ${transaction.installmentCurrent}/${transaction.installmentTotal}`
                : ""}
            </p>
            {isOverdueCardBill ? <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300">Pendente do mês anterior. Continua somando na fatura atual até ser marcado como pago.</p> : null}
            {isOverdueReceivable ? <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300">Valor a receber de mês anterior. Continua aparecendo até ser marcado como recebido.</p> : null}
          </div>

          <div className="text-right">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(Number(transaction.amount))}</p>
            <p className={`text-xs font-medium ${accentClass}`}>{isOverdueCardBill ? "Atrasado" : isOverdueReceivable ? "Pendente" : transactionStatusLabels[transaction.status]}</p>
          </div>
        </div>
      </summary>

      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <ActionForm serverAction={updateTransaction} className="grid gap-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={transaction.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="title" defaultValue={transaction.title} />
            <Input name="source" defaultValue={transaction.source ?? ""} placeholder="Grupo" />
          </div>
          <Input name="description" defaultValue={transaction.description ?? ""} placeholder="Descrição" />
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
              <option value="">Sem cartão</option>
              {creditCards.map((creditCard) => (
                <option key={creditCard.id} value={creditCard.id}>
                  {creditCard.name}
                </option>
              ))}
            </Select>
            <Input name="installmentCurrent" type="number" min="1" defaultValue={transaction.installmentCurrent ?? ""} placeholder="Parcela atual" />
            <Input name="installmentTotal" type="number" min="1" defaultValue={transaction.installmentTotal ?? ""} placeholder="Total parcelas" />
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="isCreditCard" defaultChecked={transaction.isCreditCard} className="h-4 w-4 rounded" />
            Movimento no cartão
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="secondary">
              Salvar
            </Button>
          </div>
        </ActionForm>

        <ActionForm serverAction={deleteTransaction} className="mt-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={transaction.id} />
          <Button type="submit" variant="ghost" className="px-0 text-rose-600 hover:text-rose-700">
            Excluir item
          </Button>
        </ActionForm>
      </div>
    </details>
  );
}

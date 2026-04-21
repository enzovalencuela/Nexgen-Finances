"use client";

import { useMemo, useState } from "react";
import type { CreditCard } from "@prisma/client";

import { createTransaction } from "@/app/actions";
import { transactionCategoryLabels } from "@/lib/constants";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type EntryKind = "income_paid" | "income_pending" | "expense_paid" | "bill_pending" | "card_payment";

const entryKindOptions: Array<{ value: EntryKind; label: string }> = [
  { value: "income_paid", label: "Entrada recebida" },
  { value: "income_pending", label: "Valor a receber" },
  { value: "expense_paid", label: "Saida paga" },
  { value: "bill_pending", label: "Conta a pagar" },
  { value: "card_payment", label: "Pagamento de fatura do cartao" }
];

const entryKindMap: Record<EntryKind, { type: string; status: string }> = {
  income_paid: { type: "INCOME", status: "PAID" },
  income_pending: { type: "INCOME", status: "PENDING" },
  expense_paid: { type: "EXPENSE", status: "PAID" },
  bill_pending: { type: "BILL", status: "PENDING" },
  card_payment: { type: "EXPENSE", status: "PAID" }
};

export function TransactionForm({ creditCards }: { creditCards: CreditCard[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const [entryKind, setEntryKind] = useState<EntryKind>("expense_paid");
  const [isCreditCard, setIsCreditCard] = useState(false);
  const resolvedValues = useMemo(() => entryKindMap[entryKind], [entryKind]);
  const needsCreditCardLink = isCreditCard || entryKind === "card_payment";

  return (
    <ActionForm serverAction={createTransaction} className="grid gap-3" resetOnSuccess>
      <Input name="title" placeholder="Ex: Salario, Mercado, Canva, Amigo, Fatura" required />
      <Input name="description" placeholder="Observacao ou detalhe" />

      <div className="grid gap-3 md:grid-cols-2">
        <Select value={entryKind} onChange={(event) => setEntryKind(event.target.value as EntryKind)}>
          {entryKindOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select name="category" defaultValue="NECESSARY">
          {Object.entries(transactionCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <input type="hidden" name="type" value={resolvedValues.type} />
      <input type="hidden" name="status" value={resolvedValues.status} />

      <div className="grid gap-3 md:grid-cols-2">
        <Input name="amount" type="number" step="0.01" placeholder="Valor" required />
        <Input name="transactionDate" type="date" defaultValue={today} required />
      </div>

      <Input name="source" placeholder="Grupo: Cartao, Contas Nicoli, Pai, Amigo, Outros" />

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white">
        <input
          type="checkbox"
          name="isCreditCard"
          className="h-4 w-4 rounded"
          checked={isCreditCard}
          onChange={(event) => setIsCreditCard(event.target.checked)}
        />
        Movimento no cartao de credito
      </label>

      {needsCreditCardLink ? (
        <>
          <Select name="creditCardId" defaultValue="" required>
            <option value="">Selecione o cartao</option>
            {creditCards.map((creditCard) => (
              <option key={creditCard.id} value={creditCard.id}>
                {creditCard.name}
              </option>
            ))}
          </Select>

          {isCreditCard ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="installmentCurrent" type="number" min="1" placeholder="Parcela atual" />
              <Input name="installmentTotal" type="number" min="1" placeholder="Total parcelas" />
            </div>
          ) : (
            <>
              <input type="hidden" name="installmentCurrent" value="" />
              <input type="hidden" name="installmentTotal" value="" />
            </>
          )}
        </>
      ) : (
        <>
          <input type="hidden" name="creditCardId" value="" />
          <input type="hidden" name="installmentCurrent" value="" />
          <input type="hidden" name="installmentTotal" value="" />
        </>
      )}

      <p className="text-xs text-slate-400">
        `Valor a receber` cria uma entrada pendente. Para compra parcelada, ligue `Movimento no cartao de credito` e preencha as parcelas. Para pagamento de fatura, selecione `Pagamento de fatura do cartao`, escolha o cartao e deixe o checkbox desligado.
      </p>

      <Button type="submit">Salvar item</Button>
    </ActionForm>
  );
}

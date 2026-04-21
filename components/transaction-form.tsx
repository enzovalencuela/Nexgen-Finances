"use client";

import { useMemo, useState } from "react";
import type { CreditCard } from "@prisma/client";

import { createTransaction } from "@/app/actions";
import { transactionCategoryLabels } from "@/lib/constants";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type EntryKind = "income_paid" | "income_pending" | "expense_paid" | "bill_pending";
type FormMode = "general" | "cardPurchase" | "cardPayment";

const generalEntryKindOptions: Array<{ value: EntryKind; label: string }> = [
  { value: "income_paid", label: "Entrada recebida" },
  { value: "income_pending", label: "Valor a receber" },
  { value: "expense_paid", label: "Saída paga" },
  { value: "bill_pending", label: "Conta a pagar" }
];

const entryKindMap: Record<EntryKind, { type: string; status: string }> = {
  income_paid: { type: "INCOME", status: "PAID" },
  income_pending: { type: "INCOME", status: "PENDING" },
  expense_paid: { type: "EXPENSE", status: "PAID" },
  bill_pending: { type: "BILL", status: "PENDING" }
};

export function TransactionForm({ creditCards, mode = "general" }: { creditCards: CreditCard[]; mode?: FormMode }) {
  const today = new Date().toISOString().slice(0, 10);
  const [entryKind, setEntryKind] = useState<EntryKind>("expense_paid");
  const [isInstallmentPurchase, setIsInstallmentPurchase] = useState(false);
  const resolvedValues = useMemo(() => entryKindMap[entryKind], [entryKind]);

  if (mode === "cardPurchase") {
    return (
      <ActionForm serverAction={createTransaction} className="grid gap-3" resetOnSuccess>
        <Input name="title" placeholder="Ex: Mercado, Uber, Amazon" required />
        <Input name="description" placeholder="Observação da compra" />
        <div className="grid gap-3 md:grid-cols-2">
          <Select name="creditCardId" defaultValue="" required>
            <option value="">Selecione o cartão</option>
            {creditCards.map((creditCard) => (
              <option key={creditCard.id} value={creditCard.id}>
                {creditCard.name}
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

        <input type="hidden" name="type" value="BILL" />
        <input type="hidden" name="status" value="PENDING" />
        <input type="hidden" name="source" value="Cartão" />
        <input type="hidden" name="isCreditCard" value="on" />

        <div className="grid gap-3 md:grid-cols-2">
          <Input name="amount" type="number" step="0.01" placeholder="Valor da compra" required />
          <Input name="transactionDate" type="date" defaultValue={today} required />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white">
          <input
            type="checkbox"
            className="h-4 w-4 rounded"
            checked={isInstallmentPurchase}
            onChange={(event) => setIsInstallmentPurchase(event.target.checked)}
          />
          Compra parcelada
        </label>

        {isInstallmentPurchase ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="installmentCurrent" type="number" min="1" defaultValue="1" placeholder="Parcela atual" required />
            <Input name="installmentTotal" type="number" min="2" placeholder="Total de parcelas" required />
          </div>
        ) : (
          <>
            <input type="hidden" name="installmentCurrent" value="" />
            <input type="hidden" name="installmentTotal" value="" />
          </>
        )}

        <p className="text-[11px] text-slate-400">Toda compra de cartão entra como pendente na fatura. Se ficar sem pagar, ela continua aparecendo nos meses seguintes como atrasada.</p>

        <Button type="submit">Salvar compra no cartão</Button>
      </ActionForm>
    );
  }

  if (mode === "cardPayment") {
    return (
      <ActionForm serverAction={createTransaction} className="grid gap-3" resetOnSuccess>
        <Input name="title" placeholder="Ex: Pagamento Inter Black" required />
        <Input name="description" placeholder="Observação do pagamento" />

        <Select name="creditCardId" defaultValue="" required>
          <option value="">Selecione o cartão</option>
          {creditCards.map((creditCard) => (
            <option key={creditCard.id} value={creditCard.id}>
              {creditCard.name}
            </option>
          ))}
        </Select>

        <input type="hidden" name="type" value="EXPENSE" />
        <input type="hidden" name="status" value="PAID" />
        <input type="hidden" name="source" value="Cartão" />
        <input type="hidden" name="isCreditCard" value="" />
        <input type="hidden" name="installmentCurrent" value="" />
        <input type="hidden" name="installmentTotal" value="" />
        <input type="hidden" name="category" value="OTHER" />

        <div className="grid gap-3 md:grid-cols-2">
          <Input name="amount" type="number" step="0.01" placeholder="Valor pago" required />
          <Input name="transactionDate" type="date" defaultValue={today} required />
        </div>

        <p className="text-[11px] text-slate-400">Esse lançamento não cria uma nova dívida. Ele entra como pagamento e abate automaticamente o total aberto da fatura.</p>

        <Button type="submit">Salvar pagamento de fatura</Button>
      </ActionForm>
    );
  }

  return (
    <ActionForm serverAction={createTransaction} className="grid gap-3" resetOnSuccess>
      <Input name="title" placeholder="Ex: Salário, Mercado, Canva, Amigo" required />
      <Input name="description" placeholder="Observação ou detalhe" />

      <div className="grid gap-3 md:grid-cols-2">
        <Select value={entryKind} onChange={(event) => setEntryKind(event.target.value as EntryKind)}>
          {generalEntryKindOptions.map((option) => (
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
      <input type="hidden" name="creditCardId" value="" />
      <input type="hidden" name="installmentCurrent" value="" />
      <input type="hidden" name="installmentTotal" value="" />
      <input type="hidden" name="isCreditCard" value="" />

      <div className="grid gap-3 md:grid-cols-2">
        <Input name="amount" type="number" step="0.01" placeholder="Valor" required />
        <Input name="transactionDate" type="date" defaultValue={today} required />
      </div>

      <Input name="source" placeholder="Grupo: Pai, Nicoli, Contas Nicoli, Outros" />

      <p className="text-[11px] text-slate-400">O fluxo geral não mistura cartão. Compras e pagamentos de fatura agora ficam na página Cartões.</p>

      <Button type="submit">Salvar item</Button>
    </ActionForm>
  );
}

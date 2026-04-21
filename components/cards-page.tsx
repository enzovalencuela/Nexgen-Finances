import Link from "next/link";
import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { CreditCardForm } from "@/components/finance-forms";
import { CreditCardList, TransactionList } from "@/components/finance-lists";
import { TransactionForm } from "@/components/transaction-form";
import type { CardInvoiceView, MonthlyStatementData } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

export function CardsPage({ user, selectedMonth, creditCards, cardInvoices }: Props) {
  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/cartoes"
      title="Cartões"
      description="Página de acompanhamento de faturas, compras e pagamentos por cartão."
    >
      <div className="space-y-8">
        <section className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {cardInvoices.length === 0 ? <EmptyCardState /> : cardInvoices.map((invoice) => <InvoiceSheet key={invoice.creditCard.id} invoice={invoice} creditCards={creditCards} />)}
          </div>

          <div className="space-y-6">
            <SimpleNotebookBlock title="Nova compra">
              <TransactionForm creditCards={creditCards} mode="cardPurchase" />
            </SimpleNotebookBlock>

            <SimpleNotebookBlock title="Pagamento de fatura">
              <TransactionForm creditCards={creditCards} mode="cardPayment" />
            </SimpleNotebookBlock>

            <SimpleNotebookBlock title="Cartões cadastrados">
              <div className="space-y-4">
                <CreditCardForm />
                <CreditCardList creditCards={creditCards} />
              </div>
            </SimpleNotebookBlock>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function InvoiceSheet({ invoice, creditCards }: { invoice: CardInvoiceView; creditCards: MonthlyStatementData["creditCards"] }) {
  return (
    <section className="border-b border-slate-300 pb-6 last:border-b-0 dark:border-slate-800">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-[1rem] font-bold uppercase text-slate-900 dark:text-slate-100">{invoice.creditCard.name}:</h2>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Fecha dia {invoice.creditCard.closingDay ?? "-"} • vence dia {invoice.creditCard.dueDay ?? "-"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Pill label="Fatura" value={formatCurrency(invoice.invoiceTotal)} />
          <Pill label="Atrasado" value={formatCurrency(invoice.overdueTotal)} warning={invoice.overdueTotal > 0} />
          <Link href={`/cartoes/${invoice.creditCard.id}?month=${invoice.monthReference}`} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            Abrir detalhes
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {invoice.sections.map((section) => (
          <div key={section.key} className="rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-200 pb-2 dark:border-slate-800">
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{section.title}</h3>
                <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{section.description}</p>
              </div>
              <span className={cn("text-[13px] font-medium", section.key === "overdue" ? "text-amber-700 dark:text-amber-300" : section.key === "payments" ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-slate-100")}>{formatCurrency(section.total)}</span>
            </div>

            <TransactionList
              items={section.items}
              emptyMessage={section.emptyMessage}
              creditCards={creditCards}
              accentClass={section.key === "overdue" ? "text-amber-700 dark:text-amber-300" : section.key === "payments" ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"}
              compact
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function SimpleNotebookBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[1rem] font-bold uppercase text-slate-900 dark:text-slate-100">{title}:</h2>
      <div className="mt-3 rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">{children}</div>
    </section>
  );
}

function Pill({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn("mt-1 text-[13px] font-medium", warning ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-slate-100")}>{value}</p>
    </div>
  );
}

function EmptyCardState() {
  return (
    <section>
      <h2 className="text-[1rem] font-bold uppercase text-slate-900 dark:text-slate-100">Cartões:</h2>
      <div className="mt-3 rounded-md border border-slate-300 bg-white p-4 text-[13px] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">Nenhuma fatura encontrada neste mês.</div>
    </section>
  );
}

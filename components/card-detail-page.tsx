import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreditCard as CreditCardModel, User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { TransactionList } from "@/components/finance-lists";
import { TransactionForm } from "@/components/transaction-form";
import { CollapsibleBox } from "@/components/ui/collapsible-box";
import type { CardInvoiceView, MonthlyStatementData } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
  selectedCard: CreditCardModel;
  timeline: CardInvoiceView[];
};

const statusLabels = {
  empty: "Sem movimento",
  paid: "Quitada",
  partial: "Parcial",
  open: "Aberta",
  overdue: "Em atraso"
} as const;

export function CardDetailPage({ user, selectedMonth, creditCards, cardInvoices, selectedCard, timeline }: Props) {
  const activeInvoice = cardInvoices.find((invoice) => invoice.creditCard.id === selectedCard.id) ?? timeline[0] ?? null;

  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/cartoes"
      title={`Cartão ${selectedCard.name}`}
      description="Detalhe do cartão com fatura atual, histórico dos ciclos e formulários de compra e pagamento."
    >
      <div className="space-y-8">
        <div>
          <Link href={`/cartoes?month=${selectedMonth}`} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4" />
            Voltar para cartões
          </Link>
        </div>

        {activeInvoice ? (
          <CollapsibleBox title="Fatura atual">
            <div className="grid gap-3 xl:grid-cols-4">
              <InfoCell label="Mês" value={activeInvoice.monthLabel} />
              <InfoCell label="Status" value={statusLabels[activeInvoice.status]} warning={activeInvoice.status === "overdue"} />
              <InfoCell label="Fatura" value={formatCurrency(activeInvoice.invoiceTotal)} />
              <InfoCell label="Fechamento" value={activeInvoice.closingDate ? formatDate(activeInvoice.closingDate) : "-"} />
              <InfoCell label="Vencimento" value={activeInvoice.dueDate ? formatDate(activeInvoice.dueDate) : "-"} />
              <InfoCell label="Compras abertas" value={formatCurrency(activeInvoice.openChargesTotal)} />
              <InfoCell label="Atrasado" value={formatCurrency(activeInvoice.overdueTotal)} warning={activeInvoice.overdueTotal > 0} />
              <InfoCell label="Pagamentos" value={formatCurrency(activeInvoice.paymentsTotal)} success={activeInvoice.paymentsTotal > 0} />
            </div>
          </CollapsibleBox>
        ) : null}

        <section className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <CollapsibleBox title="Histórico">
              <div className="divide-y divide-slate-200 rounded-md border border-slate-300 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
                {timeline.map((invoice) => (
                  <div key={`${invoice.creditCard.id}-${invoice.monthReference}`} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{invoice.monthLabel}</p>
                      <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Fechamento {invoice.closingDate ? formatDate(invoice.closingDate) : "-"} • vencimento {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]", invoice.status === "overdue" ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300" : invoice.status === "paid" ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{statusLabels[invoice.status]}</span>
                      <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{formatCurrency(invoice.invoiceTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleBox>

            {activeInvoice ? (
              <CollapsibleBox title="Composição">
                <div className="grid gap-4 xl:grid-cols-2">
                  {activeInvoice.sections.map((section) => (
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
              </CollapsibleBox>
            ) : null}
          </div>

          <div className="space-y-8">
            <CollapsibleBox title="Nova compra">
              <div className="rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <TransactionForm creditCards={[selectedCard]} mode="cardPurchase" />
              </div>
            </CollapsibleBox>

            <CollapsibleBox title="Pagamento">
              <div className="rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <TransactionForm creditCards={[selectedCard]} mode="cardPayment" />
              </div>
            </CollapsibleBox>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function InfoCell({ label, value, warning, success }: { label: string; value: string; warning?: boolean; success?: boolean }) {
  return (
    <div className="rounded-md border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn("mt-1 text-[13px] font-medium", warning ? "text-amber-700 dark:text-amber-300" : success ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-slate-100")}>{value}</p>
    </div>
  );
}

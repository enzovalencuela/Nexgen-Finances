import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreditCard as CreditCardModel, User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { TransactionList } from "@/components/finance-lists";
import { TransactionForm } from "@/components/transaction-form";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
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
      description="Detalhe do cartão com ciclo atual, histórico recente e formulários diretos de compra e pagamento."
    >
      <section className="flex items-center gap-3">
        <Link href={`/cartoes?month=${selectedMonth}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#20252d] px-3 py-2 text-[13px] text-slate-300 transition hover:bg-[#262c35] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Voltar para cartões
        </Link>
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-3">
          {activeInvoice ? <CurrentInvoiceBlock invoice={activeInvoice} /> : null}

          <Panel>
            <SectionHeading eyebrow="Histórico" title="Últimos ciclos de fatura" description="Leitura simples da evolução da fatura nos últimos meses." />
            <div className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#20252d]">
              {timeline.map((invoice) => (
                <div key={`${invoice.creditCard.id}-${invoice.monthReference}`} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-white">{invoice.monthLabel}</p>
                    <p className="mt-1 text-[12px] text-slate-400">
                      Fechamento {invoice.closingDate ? formatDate(invoice.closingDate) : "-"} • vencimento {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]", invoice.status === "overdue" ? "border-amber-300/20 bg-amber-500/10 text-amber-200" : invoice.status === "paid" ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/[0.04] text-slate-300")}>{statusLabels[invoice.status]}</span>
                    <span className="text-[13px] font-medium text-white">{formatCurrency(invoice.invoiceTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {activeInvoice ? (
            <Panel>
              <SectionHeading eyebrow="Composição" title="O que forma a fatura atual" description="Separação direta do que está compondo a fatura deste cartão." />
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {activeInvoice.sections.map((section) => (
                  <div key={section.key} className="rounded-xl border border-white/10 bg-[#20252d] p-3">
                    <div className="mb-3 flex items-start justify-between gap-3 border-b border-white/10 pb-2">
                      <div>
                        <h3 className="text-[13px] font-semibold text-white">{section.title}</h3>
                        <p className="mt-1 text-[12px] text-slate-400">{section.description}</p>
                      </div>
                      <span className={cn("text-[13px] font-medium", section.key === "overdue" ? "text-amber-200" : section.key === "payments" ? "text-emerald-200" : "text-white")}>{formatCurrency(section.total)}</span>
                    </div>
                    <TransactionList
                      items={section.items}
                      emptyMessage={section.emptyMessage}
                      creditCards={creditCards}
                      accentClass={section.key === "overdue" ? "text-amber-200" : section.key === "payments" ? "text-emerald-200" : "text-slate-200"}
                      compact
                    />
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-3">
          <Panel>
            <SectionHeading eyebrow="Compra" title={`Comprar com ${selectedCard.name}`} description="Lançamento direto de compra para este cartão." />
            <div className="mt-3">
              <TransactionForm creditCards={[selectedCard]} mode="cardPurchase" />
            </div>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Pagamento" title={`Pagar ${selectedCard.name}`} description="Abate o saldo aberto da fatura deste cartão." />
            <div className="mt-3">
              <TransactionForm creditCards={[selectedCard]} mode="cardPayment" />
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}

function CurrentInvoiceBlock({ invoice }: { invoice: CardInvoiceView }) {
  return (
    <Panel>
      <SectionHeading eyebrow="Fatura atual" title={invoice.monthLabel} description="Resumo do ciclo atual do cartão." />
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <InfoBox label="Status" value={statusLabels[invoice.status]} warning={invoice.status === "overdue"} />
        <InfoBox label="Fatura" value={formatCurrency(invoice.invoiceTotal)} />
        <InfoBox label="Fechamento" value={invoice.closingDate ? formatDate(invoice.closingDate) : "-"} />
        <InfoBox label="Vencimento" value={invoice.dueDate ? formatDate(invoice.dueDate) : "-"} />
        <InfoBox label="Compras abertas" value={formatCurrency(invoice.openChargesTotal)} />
        <InfoBox label="Atrasado" value={formatCurrency(invoice.overdueTotal)} warning={invoice.overdueTotal > 0} />
        <InfoBox label="Pagamentos" value={formatCurrency(invoice.paymentsTotal)} success={invoice.paymentsTotal > 0} />
      </div>
    </Panel>
  );
}

function InfoBox({ label, value, warning, success }: { label: string; value: string; warning?: boolean; success?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#20252d] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={cn("mt-1 text-[13px] font-medium", warning ? "text-amber-200" : success ? "text-emerald-200" : "text-white")}>{value}</p>
    </div>
  );
}

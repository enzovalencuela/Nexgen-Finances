import { ArrowLeft, CalendarRange, CreditCard, ReceiptText } from "lucide-react";
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

const statusClasses = {
  empty: "text-slate-300 bg-white/[0.04] border-white/10",
  paid: "text-emerald-200 bg-emerald-500/10 border-emerald-400/20",
  partial: "text-sky-200 bg-sky-500/10 border-sky-400/20",
  open: "text-yellow-100 bg-yellow-500/10 border-yellow-300/20",
  overdue: "text-amber-200 bg-amber-500/10 border-amber-300/20"
} as const;

export function CardDetailPage({ user, selectedMonth, creditCards, cardInvoices, selectedCard, timeline }: Props) {
  const activeInvoice = cardInvoices.find((invoice) => invoice.creditCard.id === selectedCard.id) ?? timeline[0] ?? null;

  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/cartoes"
      title={`Cartao ${selectedCard.name} com leitura por ciclo de fatura`}
      description="Esta tela mostra a fatura atual do cartao, a timeline recente de ciclos e os detalhes de compras, parcelas, atrasados e pagamentos do mesmo cartao."
    >
      <section className="flex items-center gap-3">
        <Link href={`/cartoes?month=${selectedMonth}`} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Voltar para cartoes
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          {activeInvoice ? <CurrentInvoiceHero invoice={activeInvoice} /> : null}

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Timeline" title="Ultimos ciclos de fatura" description="Veja como a fatura deste cartao evoluiu nos ultimos meses." />
            <div className="mt-5 grid gap-3">
              {timeline.map((invoice) => (
                <div key={`${invoice.creditCard.id}-${invoice.monthReference}`} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{invoice.monthLabel}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Fechamento {invoice.closingDate ? formatDate(invoice.closingDate) : "-"} • vencimento {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", statusClasses[invoice.status])}>
                        {statusLabels[invoice.status]}
                      </span>
                      <span className="text-sm font-semibold text-white">{formatCurrency(invoice.invoiceTotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {activeInvoice ? (
            <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
              <SectionHeading eyebrow="Detalhe" title="Composicao da fatura atual" description="Os grupos abaixo explicam exatamente o que esta compondo a fatura deste cartao." />
              <div className="mt-5 grid gap-4">
                {activeInvoice.sections.map((section) => (
                  <div key={section.key} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                        <p className="text-sm text-slate-400">{section.description}</p>
                      </div>
                      <p className={cn("text-lg font-semibold", section.key === "overdue" ? "text-amber-200" : section.key === "payments" ? "text-emerald-200" : "text-white")}>{formatCurrency(section.total)}</p>
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

        <div className="space-y-6">
          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Nova compra" title={`Comprar com ${selectedCard.name}`} description="Esse formulario ja deixa o cartao predefinido e salva a compra direto na fatura dele." />
            <div className="mt-5">
              <TransactionForm creditCards={[selectedCard]} mode="cardPurchase" />
            </div>
          </Panel>

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Pagamento" title={`Pagar ${selectedCard.name}`} description="Registre aqui os pagamentos desta fatura para abater o saldo aberto do cartao." />
            <div className="mt-5">
              <TransactionForm creditCards={[selectedCard]} mode="cardPayment" />
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}

function CurrentInvoiceHero({ invoice }: { invoice: CardInvoiceView }) {
  return (
    <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent/10 p-3 text-accent">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Fatura atual</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{invoice.monthLabel}</h2>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <StatusBadge status={invoice.status} />
            <StatusInfo icon={CalendarRange} label="Fechamento" value={invoice.closingDate ? formatDate(invoice.closingDate) : "-"} />
            <StatusInfo icon={ReceiptText} label="Vencimento" value={invoice.dueDate ? formatDate(invoice.dueDate) : "-"} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ValueBox label="Fatura atual" value={formatCurrency(invoice.invoiceTotal)} accent />
          <ValueBox label="Compras abertas" value={formatCurrency(invoice.openChargesTotal)} />
          <ValueBox label="Em atraso" value={formatCurrency(invoice.overdueTotal)} warning={invoice.overdueTotal > 0} />
          <ValueBox label="Pagamentos" value={formatCurrency(invoice.paymentsTotal)} success={invoice.paymentsTotal > 0} />
        </div>
      </div>
    </Panel>
  );
}

function StatusBadge({ status }: { status: CardInvoiceView["status"] }) {
  return <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", statusClasses[status])}>{statusLabels[status]}</span>;
}

function StatusInfo({ icon: Icon, label, value }: { icon: typeof CalendarRange; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
      <Icon className="h-4 w-4 text-accent" />
      {label}: {value}
    </div>
  );
}

function ValueBox({ label, value, accent, warning, success }: { label: string; value: string; accent?: boolean; warning?: boolean; success?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-sm font-semibold", accent ? "text-accent" : warning ? "text-amber-200" : success ? "text-emerald-200" : "text-white")}>{value}</p>
    </div>
  );
}

import { AlertTriangle, CreditCard, ReceiptText } from "lucide-react";
import Link from "next/link";
import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { CreditCardForm } from "@/components/finance-forms";
import { CreditCardList, TransactionList } from "@/components/finance-lists";
import { TransactionForm } from "@/components/transaction-form";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CardInvoiceView, MonthlyStatementData } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

export function CardsPage({ user, selectedMonth, creditCards, cardInvoices }: Props) {
  const openInvoices = cardInvoices.filter((invoice) => invoice.openChargesTotal > 0 || invoice.paymentsTotal > 0);
  const overdueTotal = cardInvoices.reduce((sum, invoice) => sum + invoice.overdueTotal, 0);

  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/cartoes"
      title="Cartões e faturas agora ficam em um espaço próprio, com leitura mais limpa"
      description="Aqui você trabalha só com cartão: compras, parcelas, atrasados, pagamentos de fatura e cadastro dos cartões. O objetivo foi tirar a ambiguidade do fechamento mensal."
    >
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <CardMetric label="Fatura aberta total" value={formatCurrency(openInvoices.reduce((sum, invoice) => sum + invoice.invoiceTotal, 0))} icon={ReceiptText} tone="neutral" />
            <CardMetric label="Em atraso" value={formatCurrency(overdueTotal)} icon={AlertTriangle} tone="warning" />
            <CardMetric label="Cartões com movimento" value={`${openInvoices.length}`} icon={CreditCard} tone="neutral" />
          </section>

          <div className="space-y-6">
            {cardInvoices.length === 0 ? <EmptyCardState /> : cardInvoices.map((invoice) => <InvoiceCard key={invoice.creditCard.id} invoice={invoice} creditCards={creditCards} />)}
          </div>
        </div>

        <div className="space-y-6">
          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Nova compra" title="Lançamento no cartão" description="Use apenas para compras no cartão. Se for parcelado, marque as parcelas aqui mesmo." />
            <div className="mt-5">
              <TransactionForm creditCards={creditCards} mode="cardPurchase" />
            </div>
          </Panel>

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Pagamento" title="Registrar pagamento de fatura" description="Use este formulário apenas para pagar a fatura. O valor é abatido automaticamente do total do cartão." />
            <div className="mt-5">
              <TransactionForm creditCards={creditCards} mode="cardPayment" />
            </div>
          </Panel>

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Cadastro" title="Cartões" description="Nome, bandeira, fechamento e vencimento ficam centralizados aqui." />
            <div className="mt-5 space-y-4">
              <CreditCardForm />
              <CreditCardList creditCards={creditCards} />
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}

function InvoiceCard({ invoice, creditCards }: { invoice: CardInvoiceView; creditCards: MonthlyStatementData["creditCards"] }) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-[#0a1220] p-6 shadow-glow">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-accent/80">Fatura</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{invoice.creditCard.name}</h2>
          <p className="mt-2 text-[13px] text-slate-300">
            Fecha dia {invoice.creditCard.closingDay ?? "-"} • vence dia {invoice.creditCard.dueDay ?? "-"}
            {invoice.creditCard.note ? ` • ${invoice.creditCard.note}` : ""}
          </p>
          <div className="mt-4">
            <Link href={`/cartoes/${invoice.creditCard.id}?month=${invoice.monthReference}`} className="inline-flex items-center gap-2 rounded-2xl border border-accent/15 bg-accent/5 px-4 py-2 text-[13px] text-accent transition hover:bg-accent/10">
              Abrir linha do tempo deste cartão
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InvoiceStat label="Fatura atual" value={formatCurrency(invoice.invoiceTotal)} strong />
          <InvoiceStat label="Status" value={invoice.status === "paid" ? "Quitada" : invoice.status === "partial" ? "Parcial" : invoice.status === "overdue" ? "Em atraso" : invoice.status === "open" ? "Aberta" : "Sem movimento"} />
          <InvoiceStat label="Atrasado" value={formatCurrency(invoice.overdueTotal)} warning={invoice.overdueTotal > 0} />
          <InvoiceStat label="Pagamentos" value={formatCurrency(invoice.paymentsTotal)} />
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {invoice.sections.map((section) => (
          <div key={section.key} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{section.title}</h3>
                <p className="text-[13px] text-slate-400">{section.description}</p>
              </div>
              <p className={cn("text-base font-semibold", section.key === "overdue" ? "text-amber-200" : "text-white")}>{formatCurrency(section.total)}</p>
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
    </section>
  );
}

function CardMetric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof CreditCard; tone: "neutral" | "warning" }) {
  return (
    <Panel className={cn("rounded-[28px] border-white/10 p-5", tone === "warning" ? "bg-amber-500/10" : "bg-white/[0.04]")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-slate-400">{label}</p>
        <Icon className={cn("h-5 w-5", tone === "warning" ? "text-amber-200" : "text-accent")} />
      </div>
      <p className="mt-4 text-[1.7rem] font-semibold tracking-tight text-white">{value}</p>
    </Panel>
  );
}

function InvoiceStat({ label, value, strong, warning }: { label: string; value: string; strong?: boolean; warning?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-sm font-semibold", strong ? "text-accent" : warning ? "text-amber-200" : "text-white")}>{value}</p>
    </div>
  );
}

function EmptyCardState() {
  return (
    <Panel className="rounded-[34px] border-white/10 bg-[#0a1220] p-6">
      <SectionHeading eyebrow="Sem movimento" title="Nenhuma fatura encontrada neste mês" description="Cadastre um cartão ou registre uma compra ou pagamento para começar a organizar as faturas por cartão." />
    </Panel>
  );
}

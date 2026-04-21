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
  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/cartoes"
      title="Cartões"
      description="Compras, pagamentos e leitura da fatura por cartão, em uma estrutura mais direta de trabalho."
    >
      <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-3">
          {cardInvoices.length === 0 ? <EmptyCardState /> : cardInvoices.map((invoice) => <InvoiceRow key={invoice.creditCard.id} invoice={invoice} creditCards={creditCards} />)}
        </div>

        <div className="space-y-3">
          <Panel>
            <SectionHeading eyebrow="Compra" title="Lançar compra no cartão" description="Use apenas para compras. Se for parcelado, informe as parcelas aqui." />
            <div className="mt-3">
              <TransactionForm creditCards={creditCards} mode="cardPurchase" />
            </div>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Pagamento" title="Registrar pagamento de fatura" description="O valor entra como abatimento da fatura do cartão." />
            <div className="mt-3">
              <TransactionForm creditCards={creditCards} mode="cardPayment" />
            </div>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Cadastro" title="Cartões cadastrados" description="Cadastro e edição dos cartões." />
            <div className="mt-3 space-y-3">
              <CreditCardForm />
              <CreditCardList creditCards={creditCards} />
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}

function InvoiceRow({ invoice, creditCards }: { invoice: CardInvoiceView; creditCards: MonthlyStatementData["creditCards"] }) {
  return (
    <Panel>
      <div className="flex flex-col gap-3 border-b border-white/10 pb-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[15px] font-semibold text-white">{invoice.creditCard.name}</p>
          <p className="mt-1 text-[12px] text-slate-400">
            Fecha dia {invoice.creditCard.closingDay ?? "-"} • vence dia {invoice.creditCard.dueDay ?? "-"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MiniPill label="Fatura" value={formatCurrency(invoice.invoiceTotal)} />
          <MiniPill label="Atrasado" value={formatCurrency(invoice.overdueTotal)} warning={invoice.overdueTotal > 0} />
          <Link href={`/cartoes/${invoice.creditCard.id}?month=${invoice.monthReference}`} className="rounded-xl border border-white/10 bg-[#20252d] px-3 py-2 text-[13px] text-slate-200 transition hover:bg-[#262c35]">
            Abrir detalhes
          </Link>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {invoice.sections.map((section) => (
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
  );
}

function MiniPill({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#20252d] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={cn("mt-1 text-[13px] font-medium", warning ? "text-amber-200" : "text-white")}>{value}</p>
    </div>
  );
}

function EmptyCardState() {
  return (
    <Panel>
      <SectionHeading eyebrow="Sem movimento" title="Nenhuma fatura encontrada neste mês" description="Cadastre um cartão ou registre uma compra para começar a organizar as faturas." />
    </Panel>
  );
}

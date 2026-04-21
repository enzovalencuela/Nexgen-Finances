import { NotebookText } from "lucide-react";
import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { BucketList, CreditCardList, InvestmentList, TransactionList } from "@/components/finance-lists";
import { CreditCardForm, InvestmentForm, SummaryForm } from "@/components/finance-forms";
import { ClassificationPieChart } from "@/components/monthly-charts";
import { TransactionForm } from "@/components/transaction-form";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MonthlyStatementData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

const sectionThemes = {
  entries: "text-cyan-200",
  payables: "text-yellow-100",
  receivables: "text-sky-100",
  expenses: "text-fuchsia-100"
} as const;

export function MonthlyClosurePage({
  user,
  selectedMonth,
  totals,
  entries,
  payableBuckets,
  receivableBuckets,
  expenseBuckets,
  classificationTotals,
  creditCards,
  investments,
  summary,
  summaryMeta,
  investmentOverview
}: Props) {
  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/fechamento"
      title="Fechamento do mês"
      description="Leitura direta dos blocos do seu fechamento, com edição rápida e sem cara de dashboard."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-x-6 gap-y-5 lg:grid-cols-2">
          <WorkSection title={`Entradas • ${formatCurrency(totals.entries)}`}>
            <TransactionList items={entries} emptyMessage="Nenhuma entrada registrada neste período." creditCards={creditCards} accentClass={sectionThemes.entries} />
          </WorkSection>

          <WorkSection title={`A pagar • ${formatCurrency(totals.payables)}`}>
            <BucketList buckets={payableBuckets} emptyMessage="Nenhum valor pendente neste período." creditCards={creditCards} accentClass={sectionThemes.payables} />
          </WorkSection>

          <WorkSection title={`A receber • ${formatCurrency(totals.receivables)}`}>
            <BucketList buckets={receivableBuckets} emptyMessage="Nenhum valor a receber neste período." creditCards={creditCards} accentClass={sectionThemes.receivables} />
          </WorkSection>

          <WorkSection title={`Contas • ${formatCurrency(totals.expenses)}`}>
            <BucketList buckets={expenseBuckets} emptyMessage="Nenhuma conta paga neste período." creditCards={creditCards} accentClass={sectionThemes.expenses} />
          </WorkSection>

          <WorkSection title={`Investimentos • ${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`} className="lg:col-span-2">
            <InvestmentList investments={investments} />
          </WorkSection>
        </div>

        <div className="space-y-4 border-l border-white/10 pl-0 xl:pl-4">
          <Panel className="bg-transparent px-0 py-0">
            <div className="flex items-center gap-2">
              <NotebookText className="h-4 w-4 text-slate-400" />
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Resumo</p>
            </div>
            <div className="mt-3 grid gap-2">
              <InfoLine label="Salário-base" value={formatCurrency(summaryMeta.salaryBase)} />
              <InfoLine label="A comprar" value={formatCurrency(summaryMeta.purchaseEstimate)} />
              <InfoLine label="Retirado dos investimentos" value={formatCurrency(summaryMeta.investmentWithdrawn)} />
              <InfoLine label="Sobra total" value={formatCurrency(totals.leftover)} />
            </div>
          </Panel>

          <Panel className="bg-transparent px-0 py-0">
            <SectionHeading eyebrow="Lançar" title="Novo item" description="Entradas, contas pagas, valores a receber e pendências gerais." />
            <div className="mt-3">
              <TransactionForm creditCards={creditCards} mode="general" />
            </div>
          </Panel>

          <Panel className="bg-transparent px-0 py-0">
            <SectionHeading eyebrow="Fechar" title="Resumo do mês" description="Números finais e observações do fechamento." />
            <div className="mt-3">
              <SummaryForm
                selectedMonth={selectedMonth}
                summary={summary ? { cashBalance: Number(summary.cashBalance ?? 0), digitalBalance: Number(summary.digitalBalance ?? 0) } : null}
                summaryMeta={summaryMeta}
              />
            </div>
          </Panel>

          <Panel className="bg-transparent px-0 py-0">
            <SectionHeading eyebrow="Investimentos" title="Atualizar posição" description="Cadastro rápido de posição e ajuste." />
            <div className="mt-3">
              <InvestmentForm />
            </div>
          </Panel>

          <Panel className="bg-transparent px-0 py-0">
            <SectionHeading eyebrow="Cartões" title="Cadastro" description="Cadastro básico de cartão, fechamento e vencimento." />
            <div className="mt-3 space-y-3">
              <CreditCardForm />
              <CreditCardList creditCards={creditCards} />
            </div>
          </Panel>

          <Panel className="bg-transparent px-0 py-0">
            <SectionHeading eyebrow="Classificação" title="Distribuição dos gastos" description="Apenas para conferência visual rápida." />
            <div className="mt-3 rounded-xl border border-white/10 bg-[#20252d] p-3">
              <ClassificationPieChart
                necessary={classificationTotals.necessary}
                optional={classificationTotals.optional}
                leisure={classificationTotals.leisure}
                investment={classificationTotals.investment}
              />
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}

function WorkSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="border-b border-white/10 pb-2">
        <h2 className="text-[14px] font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#20252d] px-3 py-2.5">
      <span className="text-[12px] text-slate-400">{label}</span>
      <span className="text-[13px] font-medium text-white">{value}</span>
    </div>
  );
}

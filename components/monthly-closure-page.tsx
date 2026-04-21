import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { BucketList, CreditCardList, InvestmentList, TransactionList } from "@/components/finance-lists";
import { CreditCardForm, InvestmentForm, SummaryForm } from "@/components/finance-forms";
import { ClassificationPieChart } from "@/components/monthly-charts";
import { TransactionForm } from "@/components/transaction-form";
import type { MonthlyStatementData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

const themes = {
  entries: "text-cyan-700",
  payables: "text-teal-700",
  receivables: "text-sky-700",
  expenses: "text-fuchsia-700"
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
      title={`Fechamento ${selectedMonth.replace("-", "/")}`}
      description="Página principal do seu fechamento mensal, organizada como uma folha de caderno com blocos diretos de leitura."
    >
      <div className="space-y-8">
        <header className="border-b border-slate-300 pb-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Salário / fechamento</p>
          <h1 className="mt-2 text-[1.4rem] font-semibold text-slate-900">Visão mensal</h1>
          <p className="mt-1 text-[13px] text-slate-500">Leitura simples das entradas, pendências, contas, sobra e investimentos.</p>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1fr_1fr]">
          <NotebookBlock title="Entradas" totalLabel={`Total recebido: ${formatCurrency(totals.entries)}`} tone="cyan">
            <TransactionList items={entries} emptyMessage="Nenhuma entrada registrada neste período." creditCards={creditCards} accentClass={themes.entries} />
          </NotebookBlock>

          <NotebookBlock title="Contas" totalLabel={`Total gasto: ${formatCurrency(totals.expenses)}`} tone="magenta">
            <BucketList buckets={expenseBuckets} emptyMessage="Nenhuma conta paga neste período." creditCards={creditCards} accentClass={themes.expenses} />
          </NotebookBlock>

          <NotebookBlock title="A pagar" totalLabel={`Total a pagar: ${formatCurrency(totals.payables)}`} tone="teal">
            <BucketList buckets={payableBuckets} emptyMessage="Nenhum valor pendente neste período." creditCards={creditCards} accentClass={themes.payables} />
          </NotebookBlock>

          <NotebookBlock title="Resumo do mês" tone="yellow">
            <SummaryLine label="Salário-base" value={formatCurrency(summaryMeta.salaryBase)} />
            <SummaryLine label="A comprar" value={formatCurrency(summaryMeta.purchaseEstimate)} />
            <SummaryLine label="Retirado dos investimentos" value={formatCurrency(summaryMeta.investmentWithdrawn)} />
            <SummaryLine label="Sobra total" value={formatCurrency(totals.leftover)} />
            <SummaryLine label="Investimentos" value={`${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`} />
          </NotebookBlock>

          <NotebookBlock title="A receber" totalLabel={`Total a receber: ${formatCurrency(totals.receivables)}`} tone="blue">
            <BucketList buckets={receivableBuckets} emptyMessage="Nenhum valor a receber neste período." creditCards={creditCards} accentClass={themes.receivables} />
          </NotebookBlock>

          <NotebookBlock title="Classificação" tone="gray">
            <div className="rounded-lg border border-slate-300 bg-white p-3">
              <ClassificationPieChart
                necessary={classificationTotals.necessary}
                optional={classificationTotals.optional}
                leisure={classificationTotals.leisure}
                investment={classificationTotals.investment}
              />
            </div>
          </NotebookBlock>

          <NotebookBlock title="Investimentos" totalLabel={`${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`} tone="gray" className="xl:col-span-2">
            <InvestmentList investments={investments} />
          </NotebookBlock>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1fr_1fr_1fr]">
          <NotebookBlock title="Novo item" tone="gray">
            <TransactionForm creditCards={creditCards} mode="general" />
          </NotebookBlock>

          <NotebookBlock title="Fechamento" tone="gray">
            <SummaryForm
              selectedMonth={selectedMonth}
              summary={summary ? { cashBalance: Number(summary.cashBalance ?? 0), digitalBalance: Number(summary.digitalBalance ?? 0) } : null}
              summaryMeta={summaryMeta}
            />
          </NotebookBlock>

          <NotebookBlock title="Cadastro rápido" tone="gray">
            <div className="space-y-4">
              <CreditCardForm />
              <InvestmentForm />
              <CreditCardList creditCards={creditCards} />
            </div>
          </NotebookBlock>
        </section>
      </div>
    </AppShell>
  );
}

function NotebookBlock({ title, totalLabel, tone, className, children }: { title: string; totalLabel?: string; tone: "cyan" | "teal" | "blue" | "magenta" | "yellow" | "gray"; className?: string; children: React.ReactNode }) {
  const toneClasses = {
    cyan: "border-cyan-300 bg-cyan-50",
    teal: "border-teal-300 bg-teal-50",
    blue: "border-sky-300 bg-sky-50",
    magenta: "border-fuchsia-300 bg-fuchsia-50",
    yellow: "border-yellow-300 bg-yellow-50",
    gray: "border-slate-300 bg-white"
  };

  return (
    <section className={className}>
      <div className="mb-3">
        <h2 className="text-[1rem] font-bold uppercase text-slate-900">{title}:</h2>
        {totalLabel ? <p className="mt-1 inline-block bg-cyan-200 px-1.5 py-0.5 text-[13px] font-semibold text-slate-900">{totalLabel}</p> : null}
      </div>
      <div className={`rounded-md border p-3 ${toneClasses[tone]}`}>{children}</div>
    </section>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-[13px] text-slate-800 last:mb-0">
      <span>{label}</span>
      <span className="bg-cyan-200 px-1.5 py-0.5 font-semibold text-slate-900">{value}</span>
    </div>
  );
}

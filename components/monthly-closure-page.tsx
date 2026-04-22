import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { BucketList, CreditCardList, InvestmentList, TransactionList } from "@/components/finance-lists";
import { CreditCardForm, InvestmentForm, SummaryForm } from "@/components/finance-forms";
import { ClassificationPieChart } from "@/components/monthly-charts";
import { TransactionForm } from "@/components/transaction-form";
import { CollapsibleBox } from "@/components/ui/collapsible-box";
import type { MonthlyStatementData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

const themes = {
  entries: "text-cyan-700 dark:text-cyan-300",
  payables: "text-teal-700 dark:text-teal-300",
  receivables: "text-sky-700 dark:text-sky-300",
  expenses: "text-fuchsia-700 dark:text-fuchsia-300"
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
        <header className="border-b border-slate-300 pb-4 dark:border-slate-800">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Salário / fechamento</p>
          <h1 className="mt-2 text-[1.4rem] font-semibold text-slate-900 dark:text-slate-100">Visão mensal</h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Leitura simples das entradas, pendências, contas, sobra e investimentos.</p>
        </header>

        <section className="grid gap-8 xl:grid-cols-2 xl:items-start">
          <div className="space-y-8">
            <NotebookBlock title="Entradas" totalLabel={`Total recebido: ${formatCurrency(totals.entries)}`} tone="cyan">
              <TransactionList items={entries} emptyMessage="Nenhuma entrada registrada neste período." creditCards={creditCards} accentClass={themes.entries} />
            </NotebookBlock>

            <NotebookBlock title="A pagar" totalLabel={`Total a pagar: ${formatCurrency(totals.payables)}`} tone="teal">
              <BucketList buckets={payableBuckets} emptyMessage="Nenhum valor pendente neste período." creditCards={creditCards} accentClass={themes.payables} />
            </NotebookBlock>

            <NotebookBlock title="A receber" totalLabel={`Total a receber: ${formatCurrency(totals.receivables)}`} tone="blue">
              <BucketList buckets={receivableBuckets} emptyMessage="Nenhum valor a receber neste período." creditCards={creditCards} accentClass={themes.receivables} />
            </NotebookBlock>
          </div>

          <div className="space-y-8">
            <NotebookBlock title="Contas" totalLabel={`Total gasto: ${formatCurrency(totals.expenses)}`} tone="magenta">
              <BucketList buckets={expenseBuckets} emptyMessage="Nenhuma conta paga neste período." creditCards={creditCards} accentClass={themes.expenses} />
            </NotebookBlock>

            <NotebookBlock title="Resumo do mês" tone="yellow">
              <SummaryLine label="Salário-base" value={formatCurrency(summaryMeta.salaryBase)} />
              <SummaryLine label="A comprar" value={formatCurrency(summaryMeta.purchaseEstimate)} />
              <SummaryLine label="Retirado dos investimentos" value={formatCurrency(summaryMeta.investmentWithdrawn)} />
              <SummaryLine label="Sobra total" value={formatCurrency(totals.leftover)} />
              <SummaryLine label="Investimentos" value={`${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`} />
            </NotebookBlock>

            <NotebookBlock title="Classificação" tone="gray">
              <div className="rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <ClassificationPieChart
                  necessary={classificationTotals.necessary}
                  optional={classificationTotals.optional}
                  leisure={classificationTotals.leisure}
                  investment={classificationTotals.investment}
                />
              </div>
            </NotebookBlock>
          </div>
        </section>

        <section>
          <NotebookBlock title="Investimentos" totalLabel={`${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`} tone="gray">
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
    cyan: "border-cyan-300 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-950/30",
    teal: "border-teal-300 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/30",
    blue: "border-sky-300 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30",
    magenta: "border-fuchsia-300 bg-fuchsia-50 dark:border-fuchsia-900 dark:bg-fuchsia-950/30",
    yellow: "border-yellow-300 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30",
    gray: "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
  };

  return (
    <CollapsibleBox
      title={title}
      className={className}
      summaryRight={
        totalLabel ? <p className="inline-block bg-cyan-200 px-1.5 py-0.5 text-[13px] font-semibold text-slate-900 dark:bg-cyan-900/50 dark:text-cyan-50">{totalLabel}</p> : null
      }
    >
      <div className={`rounded-md border p-3 ${toneClasses[tone]}`}>{children}</div>
    </CollapsibleBox>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-[13px] text-slate-800 last:mb-0 dark:text-slate-200">
      <span>{label}</span>
      <span className="bg-cyan-200 px-1.5 py-0.5 font-semibold text-slate-900 dark:bg-cyan-900/50 dark:text-cyan-50">{value}</span>
    </div>
  );
}

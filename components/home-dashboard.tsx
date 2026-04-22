import { CreditCard } from "lucide-react";
import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { OverviewBarChart } from "@/components/monthly-charts";
import { CollapsibleBox } from "@/components/ui/collapsible-box";
import type { MonthlyStatementData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

export function HomeDashboard({ user, selectedMonth, totals, payableBuckets, receivableBuckets, expenseBuckets, cardInvoices, investmentOverview }: Props) {
  const topCard = [...cardInvoices].sort((left, right) => right.invoiceTotal - left.invoiceTotal)[0] ?? null;

  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/"
      title="Página inicial"
      description="Uma visão simples para abrir o mês e localizar rapidamente o que exige atenção."
    >
      <div className="space-y-8">
        <section className="grid gap-8 xl:grid-cols-[320px_1fr]">
          <section>
            <h2 className="text-[1rem] font-bold uppercase text-slate-900 dark:text-slate-100">Totais:</h2>
            <div className="mt-3 space-y-2 text-[13px] text-slate-800 dark:text-slate-200">
              <SummaryRow label="Entradas" value={formatCurrency(totals.entries)} />
              <SummaryRow label="A pagar" value={formatCurrency(totals.payables)} />
              <SummaryRow label="A receber" value={formatCurrency(totals.receivables)} />
              <SummaryRow label="Contas" value={formatCurrency(totals.expenses)} />
              <SummaryRow label="Sobra" value={formatCurrency(totals.leftover)} />
              <SummaryRow label="Investimentos" value={`${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`} />
            </div>
          </section>

          <section>
            <h2 className="text-[1rem] font-bold uppercase text-slate-900 dark:text-slate-100">Panorama:</h2>
            <div className="mt-3 rounded-md border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <OverviewBarChart
                entries={totals.entries}
                payables={totals.payables}
                receivables={totals.receivables}
                expenses={totals.expenses}
                leftover={totals.leftover}
              />
            </div>
          </section>
        </section>

        <section className="grid gap-8 xl:grid-cols-3">
          <SimpleBlock title="A pagar">
            <SummaryRow label="Maior grupo" value={payableBuckets[0]?.label ?? "Sem pendências"} />
            <SummaryRow label="Valor" value={payableBuckets[0] ? formatCurrency(payableBuckets[0].total) : "-"} />
            <SummaryRow label="Maior fatura" value={topCard ? `${topCard.creditCard.name} • ${formatCurrency(topCard.invoiceTotal)}` : "Sem fatura aberta"} icon />
          </SimpleBlock>

          <SimpleBlock title="A receber">
            <SummaryRow label="Maior grupo" value={receivableBuckets[0]?.label ?? "Sem valores pendentes"} />
            <SummaryRow label="Valor" value={receivableBuckets[0] ? formatCurrency(receivableBuckets[0].total) : "-"} />
          </SimpleBlock>

          <SimpleBlock title="Contas">
            <SummaryRow label="Maior grupo" value={expenseBuckets[0]?.label ?? "Sem contas pagas"} />
            <SummaryRow label="Valor" value={expenseBuckets[0] ? formatCurrency(expenseBuckets[0].total) : "-"} />
          </SimpleBlock>
        </section>
      </div>
    </AppShell>
  );
}

function SimpleBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <CollapsibleBox title={title}>
      <div className="rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">{children}</div>
    </CollapsibleBox>
  );
}

function SummaryRow({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-[13px] text-slate-800 last:mb-0 dark:text-slate-200">
      <div className="flex items-center gap-2">
        {icon ? <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-400" /> : null}
        <span>{label}</span>
      </div>
      <span className="bg-cyan-200 px-1.5 py-0.5 font-semibold text-slate-900 dark:bg-cyan-900/50 dark:text-cyan-50">{value}</span>
    </div>
  );
}

import { CreditCard } from "lucide-react";
import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { OverviewBarChart } from "@/components/monthly-charts";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MonthlyStatementData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

export function HomeDashboard({ user, selectedMonth, totals, payableBuckets, receivableBuckets, expenseBuckets, cardInvoices, investmentOverview }: Props) {
  const topCard = [...cardInvoices].sort((left, right) => right.invoiceTotal - left.invoiceTotal)[0] ?? null;
  const rows = [
    { label: "Entradas", value: totals.entries },
    { label: "A pagar", value: totals.payables },
    { label: "A receber", value: totals.receivables },
    { label: "Contas", value: totals.expenses },
    { label: "Sobra", value: totals.leftover },
    { label: "Investimentos (BRL)", value: investmentOverview.totalBRL }
  ];

  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/"
      title="Resumo do mês"
      description="Visão rápida para bater os números principais e entrar na área certa sem ruído visual."
    >
      <section className="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Panel>
          <SectionHeading eyebrow="Totais" title="Conferência rápida" description="Os números principais do mês em uma lista direta." />
          <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#20252d]">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-[13px] text-slate-300">{row.label}</span>
                <span className="text-[13px] font-semibold text-white">{formatCurrency(row.value)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Panorama" title="Comparação do mês" description="Use o gráfico apenas para ter uma leitura geral; os detalhes ficam nas páginas de trabalho." />
          <div className="mt-4 rounded-xl border border-white/10 bg-[#20252d] p-4">
            <OverviewBarChart
              entries={totals.entries}
              payables={totals.payables}
              receivables={totals.receivables}
              expenses={totals.expenses}
              leftover={totals.leftover}
            />
          </div>
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel>
          <SectionHeading eyebrow="A pagar" title="Maior grupo aberto" description="Atalho para o que mais está pressionando o mês." />
          <SimpleInfoRow label="Grupo" value={payableBuckets[0]?.label ?? "Sem pendências"} />
          <SimpleInfoRow label="Valor" value={payableBuckets[0] ? formatCurrency(payableBuckets[0].total) : "-"} />
          <SimpleInfoRow label="Maior fatura" value={topCard ? `${topCard.creditCard.name} • ${formatCurrency(topCard.invoiceTotal)}` : "Sem fatura aberta"} icon />
        </Panel>

        <Panel>
          <SectionHeading eyebrow="A receber" title="Maior grupo pendente" description="Veja de onde ainda falta entrar valor neste mês." />
          <SimpleInfoRow label="Grupo" value={receivableBuckets[0]?.label ?? "Sem valores pendentes"} />
          <SimpleInfoRow label="Valor" value={receivableBuckets[0] ? formatCurrency(receivableBuckets[0].total) : "-"} />
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Contas" title="Maior grupo pago" description="Leitura simples do que mais consumiu caixa no mês." />
          <SimpleInfoRow label="Grupo" value={expenseBuckets[0]?.label ?? "Sem contas pagas"} />
          <SimpleInfoRow label="Valor" value={expenseBuckets[0] ? formatCurrency(expenseBuckets[0].total) : "-"} />
        </Panel>
      </section>
    </AppShell>
  );
}

function SimpleInfoRow({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#20252d] px-4 py-3">
      <div className="flex items-center gap-2">
        {icon ? <CreditCard className="h-4 w-4 text-slate-400" /> : null}
        <span className="text-[12px] uppercase tracking-[0.2em] text-slate-500">{label}</span>
      </div>
      <span className="text-[13px] font-medium text-white">{value}</span>
    </div>
  );
}

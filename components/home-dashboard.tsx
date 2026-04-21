import { ArrowDownCircle, ArrowUpCircle, CreditCard, Landmark, PiggyBank, Wallet } from "lucide-react";
import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { OverviewBarChart } from "@/components/monthly-charts";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MonthlyStatementData } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

export function HomeDashboard({ user, selectedMonth, totals, payableBuckets, receivableBuckets, expenseBuckets, cardInvoices, investmentOverview }: Props) {
  const cards = [
    { label: "Entradas", value: totals.entries, icon: ArrowUpCircle, color: "text-cyan-300" },
    { label: "A pagar", value: totals.payables, icon: ArrowDownCircle, color: "text-yellow-200" },
    { label: "A receber", value: totals.receivables, icon: PiggyBank, color: "text-sky-300" },
    { label: "Contas", value: totals.expenses, icon: Landmark, color: "text-fuchsia-300" },
    { label: "Sobra", value: totals.leftover, icon: Wallet, color: "text-violet-300" }
  ];
  const topCard = [...cardInvoices].sort((left, right) => right.invoiceTotal - left.invoiceTotal)[0] ?? null;

  return (
    <AppShell
      user={user}
      selectedMonth={selectedMonth}
      currentPath="/"
      title="Visao rapida do mes para decidir onde agir primeiro"
      description="A home agora ficou enxuta: mostra panorama, gargalos e atalhos. O detalhe operacional foi separado em Fechamento e Cartoes."
    >
      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Panel key={card.label} className="rounded-[28px] border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{card.label}</p>
                <div className={cn("rounded-2xl bg-white/5 p-2.5", card.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-[1.95rem] font-semibold tracking-tight text-white">{formatCurrency(card.value)}</p>
            </Panel>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
          <SectionHeading
            eyebrow="Panorama"
            title="Leitura resumida do mes"
            description="Comparacao imediata entre entradas, contas, pendencias e sobra."
          />
          <div className="mt-6">
            <OverviewBarChart
              entries={totals.entries}
              payables={totals.payables}
              receivables={totals.receivables}
              expenses={totals.expenses}
              leftover={totals.leftover}
            />
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading
              eyebrow="Prioridade"
              title="Onde tem mais pressao"
              description="Resumo do que mais pesa neste mes para voce decidir a proxima acao."
            />
            <div className="mt-5 grid gap-3">
              <QuickMetric label="Maior fatura aberta" value={topCard ? `${topCard.creditCard.name} • ${formatCurrency(topCard.invoiceTotal)}` : "Sem fatura aberta"} icon={CreditCard} />
              <QuickMetric label="Bucket de A pagar mais alto" value={payableBuckets[0] ? `${payableBuckets[0].label} • ${formatCurrency(payableBuckets[0].total)}` : "Sem pendencias"} />
              <QuickMetric label="Bucket de A receber mais alto" value={receivableBuckets[0] ? `${receivableBuckets[0].label} • ${formatCurrency(receivableBuckets[0].total)}` : "Sem recebimentos pendentes"} />
              <QuickMetric label="Bucket de Contas mais alto" value={expenseBuckets[0] ? `${expenseBuckets[0].label} • ${formatCurrency(expenseBuckets[0].total)}` : "Sem contas pagas"} />
              <QuickMetric label="Posicao em investimentos" value={`${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`} />
            </div>
          </Panel>

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading
              eyebrow="Fluxo novo"
              title="Como usar agora"
              description="Cada area passou a representar uma tarefa real em vez de concentrar tudo numa pagina so."
            />
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <GuideRow title="Inicio" text="Leia o mes e veja os maiores gargalos." />
              <GuideRow title="Fechamento" text="Lance entradas, contas, recebimentos, resumo mensal e investimentos." />
              <GuideRow title="Cartoes" text="Gerencie compras no cartao, parcelas, atrasados, pagamentos de fatura e cadastro dos cartoes." />
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}

function QuickMetric({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof CreditCard }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-accent" /> : null}
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function GuideRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{text}</p>
    </div>
  );
}

import { NotebookText } from "lucide-react";
import type { User } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { CreditCardList, BucketList, InvestmentList, TransactionList } from "@/components/finance-lists";
import { CreditCardForm, InvestmentForm, SummaryForm } from "@/components/finance-forms";
import { ClassificationPieChart } from "@/components/monthly-charts";
import { TransactionForm } from "@/components/transaction-form";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MonthlyStatementData } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

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
      title="Fechamento mensal organizado como caderno, mas sem confundir cartao com resto"
      description="Aqui fica o fechamento do mes: entradas, a pagar, a receber, contas, investimentos e fechamento final. A operacao de fatura foi separada para a pagina de Cartoes."
    >
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <ClosureSection eyebrow="Entradas" title={`Total recebido: ${formatCurrency(totals.entries)}`} description="Entradas efetivamente recebidas no mes, incluindo o saldo automatico do mes passado quando existir.">
            <TransactionList items={entries} emptyMessage="Nenhuma entrada registrada neste periodo." creditCards={creditCards} accentClass={sectionThemes.entries} />
          </ClosureSection>

          <ClosureSection eyebrow="A pagar" title={`Total a pagar: ${formatCurrency(totals.payables)}`} description="Pendencias gerais do mes. A leitura detalhada da fatura foi separada em Cartoes.">
            <BucketList buckets={payableBuckets} emptyMessage="Nenhum valor pendente neste periodo." creditCards={creditCards} accentClass={sectionThemes.payables} />
          </ClosureSection>

          <ClosureSection eyebrow="A receber" title={`Total a receber: ${formatCurrency(totals.receivables)}`} description="Valores prometidos mas ainda nao recebidos.">
            <BucketList buckets={receivableBuckets} emptyMessage="Nenhum valor a receber neste periodo." creditCards={creditCards} accentClass={sectionThemes.receivables} />
          </ClosureSection>

          <ClosureSection eyebrow="Contas" title={`Total gasto: ${formatCurrency(totals.expenses)}`} description="Saidas ja pagas no mes, agrupadas do jeito que voce acompanha no dia a dia.">
            <BucketList buckets={expenseBuckets} emptyMessage="Nenhuma conta paga neste periodo." creditCards={creditCards} accentClass={sectionThemes.expenses} />
          </ClosureSection>

          <ClosureSection eyebrow="Investimentos" title={`${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`} description="Posicao consolidada dos investimentos com continuidade entre meses.">
            <InvestmentList investments={investments} />
          </ClosureSection>
        </div>

        <div className="space-y-6">
          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                <NotebookText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Conferencia</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Painel do fechamento</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <MiniStat label="Salario base" value={formatCurrency(summaryMeta.salaryBase)} />
              <MiniStat label="A comprar" value={formatCurrency(summaryMeta.purchaseEstimate)} />
              <MiniStat label="Retirado dos investimentos" value={formatCurrency(summaryMeta.investmentWithdrawn)} />
              <MiniStat label="Sobra total" value={formatCurrency(totals.leftover)} />
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <SectionHeading eyebrow="Classificacao" title="Mapa visual dos gastos" description="Distribuicao por tipo para bater com a leitura do seu fechamento." />
              <div className="mt-5">
                <ClassificationPieChart
                  necessary={classificationTotals.necessary}
                  optional={classificationTotals.optional}
                  leisure={classificationTotals.leisure}
                  investment={classificationTotals.investment}
                />
              </div>
            </div>
          </Panel>

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Lancamentos" title="Novo item de fluxo geral" description="Use este formulario para entradas, contas pagas, valores a receber e pendencias gerais fora da fatura." />
            <div className="mt-5">
              <TransactionForm creditCards={creditCards} mode="general" />
            </div>
          </Panel>

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Fechamento" title="Resumo do mes" description="Registre os numeros finais do mes e as observacoes do caderno." />
            <div className="mt-5">
              <SummaryForm
                selectedMonth={selectedMonth}
                summary={summary ? { cashBalance: Number(summary.cashBalance ?? 0), digitalBalance: Number(summary.digitalBalance ?? 0) } : null}
                summaryMeta={summaryMeta}
              />
            </div>
          </Panel>

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Investimentos" title="Atualizar posicao" description="Cadastre novo investimento ou ajuste uma posicao ja existente." />
            <div className="mt-5">
              <InvestmentForm />
            </div>
          </Panel>

          <Panel className="rounded-[32px] border-white/10 bg-[#0a1220] p-6">
            <SectionHeading eyebrow="Cartoes cadastrados" title="Cadastro rapido" description="O gerenciamento detalhado de fatura fica em Cartoes, mas o cadastro base continua acessivel aqui." />
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

function ClosureSection({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="ledger-paper rounded-[34px] border border-white/10 bg-[#0a1220] p-6 shadow-glow">
      <div className="mb-5 space-y-2">
        <p className="text-xs uppercase tracking-[0.34em] text-accent/80">{eyebrow}</p>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="max-w-3xl text-sm text-slate-300">{description}</p>
      </div>
      {children}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4")}>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

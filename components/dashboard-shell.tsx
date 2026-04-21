import { ArrowDownCircle, ArrowUpCircle, Landmark, NotebookText, PiggyBank, Wallet } from "lucide-react";
import Image from "next/image";
import type { CreditCard, Investment, Summary, User } from "@prisma/client";

import { createCreditCard, createInvestment, createTransaction, upsertSummary } from "@/app/actions";
import { assetTypeLabels, transactionCategoryLabels, transactionStatusLabels, transactionTypeLabels } from "@/lib/constants";
import type { MonthlyStatementData, StatementBucket, TransactionWithCard } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { EditableInvestmentCard } from "@/components/editable-investment-card";
import { EditableCreditCard } from "@/components/editable-credit-card";
import { EditableTransactionCard } from "@/components/editable-transaction-card";
import { ClassificationPieChart, OverviewBarChart } from "@/components/monthly-charts";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { SignOutButton } from "@/components/sign-out-button";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

type TapeTheme = {
  shell: string;
  ink: string;
  badge: string;
  line: string;
};

const tapeThemes = {
  entries: {
    shell: "bg-cyan-500/10 border-cyan-400/35",
    ink: "text-cyan-200",
    badge: "bg-cyan-300 text-slate-950",
    line: "bg-cyan-300"
  },
  payables: {
    shell: "bg-yellow-500/10 border-yellow-300/35",
    ink: "text-yellow-100",
    badge: "bg-yellow-300 text-slate-950",
    line: "bg-yellow-300"
  },
  receivables: {
    shell: "bg-sky-500/10 border-sky-300/35",
    ink: "text-sky-100",
    badge: "bg-sky-300 text-slate-950",
    line: "bg-sky-300"
  },
  expenses: {
    shell: "bg-fuchsia-500/10 border-fuchsia-400/35",
    ink: "text-fuchsia-100",
    badge: "bg-fuchsia-300 text-slate-950",
    line: "bg-fuchsia-300"
  },
  investments: {
    shell: "bg-emerald-500/10 border-emerald-400/35",
    ink: "text-emerald-100",
    badge: "bg-emerald-300 text-slate-950",
    line: "bg-emerald-300"
  }
} as const;

export function DashboardShell({
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
  investmentOverview,
  summary,
  summaryMeta
}: Props) {
  const baseForPercent = totals.entries > 0 ? totals.entries : 1;

  const heroCards = [
    { id: "entries", label: "Total Recebido", icon: ArrowUpCircle, color: "text-cyan-300", value: totals.entries },
    { id: "payables", label: "Total a Pagar", icon: ArrowDownCircle, color: "text-yellow-200", value: totals.payables },
    { id: "receivables", label: "Total a Receber", icon: PiggyBank, color: "text-sky-300", value: totals.receivables },
    { id: "expenses", label: "Contas", icon: Landmark, color: "text-fuchsia-300", value: totals.expenses },
    { id: "leftover", label: "Total Restante", icon: Wallet, color: "text-violet-300", value: totals.leftover }
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(7,16,30,0.98)_0%,rgba(10,25,48,0.96)_45%,rgba(7,16,30,0.98)_100%)] p-6 shadow-glow sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-accent/20 bg-accent/10">
                  <Image src="/favicon.ico" alt="Nexgen Finance" width={34} height={34} className="h-9 w-9 rounded-lg" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Nexgen Finance</p>
                  <p className="mt-1 text-sm text-slate-400">Fechamento mensal inspirado no seu caderno do OneNote</p>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-4xl text-3xl font-semibold leading-[1.02] tracking-tight text-white sm:text-4xl xl:text-[3.25rem]">
                  Fechamento de {selectedMonth.replace("-", "/")} com leitura direta, colorida e editavel.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-[1.05rem]">
                  Cada bloco abaixo segue a logica do seu documento: entradas, a pagar, a receber, contas, sobra e investimentos. Clique em qualquer item para editar sem sair da pagina.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {heroCards.map((card) => {
                  const Icon = card.icon;
                  const progressWidth = `${Math.max(12, Math.min(100, (card.value / baseForPercent) * 100))}%`;

                  return (
                    <div key={card.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-400">{card.label}</p>
                        <div className={cn("shrink-0 rounded-2xl bg-white/5 p-2.5", card.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-5 text-[clamp(1.75rem,1.65vw,2.125rem)] font-semibold leading-[0.95] tracking-tight text-white">
                        {formatCurrency(card.value)}
                      </p>
                      <div className="mt-5 h-2 rounded-full bg-white/5">
                        <div className={cn("h-2 rounded-full", card.color.replace("text-", "bg-"))} style={{ width: progressWidth }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6">
              <Panel className="rounded-[30px] border-white/10 bg-white/[0.04] p-5">
                <SectionHeading
                  eyebrow="Controles"
                  title="Filtragem e sessao"
                  description="Mude de mes ou encerre a sessao rapidamente."
                />
                <div className="mt-5 space-y-4">
                  <FilterForm selectedMonth={selectedMonth} />
                  <SignOutButton />
                </div>
              </Panel>

              <Panel className="rounded-[30px] border-white/10 bg-white/[0.04] p-5">
                <SectionHeading
                  eyebrow="Resumo visual"
                  title="Balanço do mes"
                  description="Comparacao imediata entre entradas, contas, a pagar, a receber e sobra."
                />
                <div className="mt-4">
                  <OverviewBarChart
                    entries={totals.entries}
                    payables={totals.payables}
                    receivables={totals.receivables}
                    expenses={totals.expenses}
                    leftover={totals.leftover}
                  />
                </div>
              </Panel>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Panel id="overview" className="paper-dots rounded-[34px] border-white/10 bg-[#0a1220] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Mapa do Fechamento</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Painel de conferencia</h2>
                </div>
                <div className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-100">
                  Salario base: {formatCurrency(summaryMeta.salaryBase)}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <MetaStrip label="A comprar" value={summaryMeta.purchaseEstimate} tone="warning" />
                <MetaStrip label="Retirado dos investimentos" value={summaryMeta.investmentWithdrawn} tone="info" />
                <MetaStrip label="Sobra em dinheiro" value={Number(summary?.cashBalance ?? 0)} tone="neutral" />
                <MetaStrip label="Sobra digital" value={Number(summary?.digitalBalance ?? 0)} tone="neutral" />
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <SectionHeading
                  eyebrow="Classificacao"
                  title="Leitura dos gastos por cor"
                  description="Distribuicao visual semelhante ao destaque que voce usa no documento."
                />
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

            <LedgerSection
              sectionId="entries"
              theme={tapeThemes.entries}
              eyebrow="Entradas"
              title={`Total recebido: ${formatCurrency(totals.entries)}`}
              subtitle="Bloco de entradas do mes, com edicao direta de cada linha."
            >
              <TransactionList items={entries} emptyMessage="Nenhuma entrada registrada neste periodo." creditCards={creditCards} accentClass={tapeThemes.entries.ink} />
            </LedgerSection>

            <LedgerSection
              sectionId="payables"
              theme={tapeThemes.payables}
              eyebrow="A pagar"
              title={`Total a pagar: ${formatCurrency(totals.payables)}`}
              subtitle="Separado por cartao, contas da Nicoli e investimentos pendentes."
            >
              <BucketList buckets={payableBuckets} emptyMessage="Nenhum valor pendente neste periodo." creditCards={creditCards} accentClass={tapeThemes.payables.ink} />
            </LedgerSection>

            <LedgerSection
              sectionId="receivables"
              theme={tapeThemes.receivables}
              eyebrow="A receber"
              title={`Total a receber: ${formatCurrency(totals.receivables)}`}
              subtitle="Valores que ainda vao entrar e precisam ser acompanhados."
            >
              <BucketList buckets={receivableBuckets} emptyMessage="Nenhum valor a receber neste periodo." creditCards={creditCards} accentClass={tapeThemes.receivables.ink} />
            </LedgerSection>

            <LedgerSection
              sectionId="expenses"
              theme={tapeThemes.expenses}
              eyebrow="Contas"
              title={`Total gasto: ${formatCurrency(totals.expenses)}`}
              subtitle="Gastos efetivos do mes, agrupados do jeito que voce costuma organizar no caderno."
            >
              <BucketList buckets={expenseBuckets} emptyMessage="Nenhuma conta paga neste periodo." creditCards={creditCards} accentClass={tapeThemes.expenses.ink} />
            </LedgerSection>

            <LedgerSection
              sectionId="investments"
              theme={tapeThemes.investments}
              eyebrow="Investimentos"
              title={`${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`}
              subtitle="Ativos do mes com edicao inline para ajustes rapidos."
            >
              <InvestmentList investments={investments} />
            </LedgerSection>
          </div>

          <div className="space-y-6">
            <NotebookIndex
              selectedMonth={selectedMonth}
              totals={totals}
              summary={summary}
              summaryMeta={summaryMeta}
              investmentOverview={investmentOverview}
            />

            <Panel className="rounded-[34px] border-white/10 bg-[#0a1220] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                  <NotebookText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Editor Rapido</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Adicionar e ajustar</h2>
                </div>
              </div>

              <div className="space-y-6">
                <StickyPanel title="Novo item" tone="cyan">
                  <TransactionForm creditCards={creditCards} />
                </StickyPanel>

                <StickyPanel title="Cartoes" tone="yellow">
                  <CreditCardForm />
                  <div className="mt-4">
                    <CreditCardList creditCards={creditCards} />
                  </div>
                </StickyPanel>

                <StickyPanel title="Fechamento mensal" tone="violet">
                  <SummaryForm selectedMonth={selectedMonth} summary={summary} summaryMeta={summaryMeta} />
                </StickyPanel>

                <StickyPanel title="Investimento" tone="green">
                  <InvestmentForm />
                </StickyPanel>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterForm({ selectedMonth }: { selectedMonth: string }) {
  return (
    <form className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <Input type="month" name="month" defaultValue={selectedMonth} className="min-w-40 bg-transparent" />
      <Button type="submit" variant="secondary">
        Abrir mes
      </Button>
    </form>
  );
}

function MetaStrip({ label, value, tone }: { label: string; value: number; tone: "warning" | "info" | "neutral" }) {
  const toneClasses = {
    warning: "border-yellow-300/25 bg-yellow-400/8 text-yellow-100",
    info: "border-cyan-300/25 bg-cyan-400/8 text-cyan-100",
    neutral: "border-white/10 bg-white/[0.03] text-white"
  };

  return (
    <div className={cn("rounded-3xl border px-5 py-4", toneClasses[tone])}>
      <p className="text-xs uppercase tracking-[0.24em] opacity-70">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{formatCurrency(value)}</p>
    </div>
  );
}

function LedgerSection({
  sectionId,
  theme,
  eyebrow,
  title,
  subtitle,
  children
}: {
  sectionId: string;
  theme: TapeTheme;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={sectionId} className={cn("ledger-paper rounded-[34px] border p-6 shadow-glow", theme.shell)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className={cn("mb-4 h-2 w-24 rounded-full", theme.line)} />
          <p className={cn("text-xs uppercase tracking-[0.34em]", theme.ink)}>{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">{subtitle}</p>
        </div>
        <span className={cn("rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]", theme.badge)}>{eyebrow}</span>
      </div>

      {children}
    </section>
  );
}

function NotebookIndex({
  selectedMonth,
  totals,
  summary,
  summaryMeta,
  investmentOverview
}: {
  selectedMonth: string;
  totals: MonthlyStatementData["totals"];
  summary: Summary | null;
  summaryMeta: { salaryBase: number; purchaseEstimate: number; investmentWithdrawn: number; noteText: string };
  investmentOverview: MonthlyStatementData["investmentOverview"];
}) {
  const links = [
    { href: "#overview", label: "Resumo Geral", color: "bg-violet-300" },
    { href: "#entries", label: "Entradas", color: "bg-cyan-300" },
    { href: "#payables", label: "A Pagar", color: "bg-yellow-300" },
    { href: "#receivables", label: "A Receber", color: "bg-sky-300" },
    { href: "#expenses", label: "Contas", color: "bg-fuchsia-300" },
    { href: "#investments", label: "Investimentos", color: "bg-emerald-300" }
  ];

  return (
    <Panel className="paper-dots rounded-[34px] border-white/10 bg-[#0a1220] p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Indice do mes</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Caderno {selectedMonth.replace("-", "/")}</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
          Leitura rapida
        </span>
      </div>

      <div className="space-y-3">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className={cn("h-3.5 w-3.5 rounded-sm", link.color)} />
              <span className="text-sm font-medium text-white">{link.label}</span>
            </div>
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Abrir</span>
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        <MiniNote label="Salario base" value={formatCurrency(summaryMeta.salaryBase)} />
        <MiniNote label="Sobra total" value={formatCurrency(totals.leftover)} />
        <MiniNote label="A comprar" value={formatCurrency(summaryMeta.purchaseEstimate)} />
        <MiniNote label="USD investido" value={formatCurrency(investmentOverview.totalUSD, "USD")} />
        <MiniNote label="Observacao" value={summaryMeta.noteText || "Sem anotacao"} muted />
      </div>
    </Panel>
  );
}

function MiniNote({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-sm font-medium", muted ? "text-slate-300" : "text-white")}>{value}</p>
    </div>
  );
}

function StickyPanel({ title, tone, children }: { title: string; tone: "cyan" | "yellow" | "violet" | "green"; children: React.ReactNode }) {
  const tones = {
    cyan: "border-cyan-400/30 bg-cyan-500/6",
    yellow: "border-yellow-300/30 bg-yellow-400/6",
    violet: "border-violet-300/30 bg-violet-400/6",
    green: "border-emerald-400/30 bg-emerald-500/6"
  };

  return (
    <div className={cn("rounded-[28px] border p-5", tones[tone])}>
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function BucketList({
  buckets,
  emptyMessage,
  creditCards,
  accentClass
}: {
  buckets: StatementBucket[];
  emptyMessage: string;
  creditCards: CreditCard[];
  accentClass: string;
}) {
  if (buckets.length === 0) {
    return <p className="text-sm text-slate-300">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {buckets.map((bucket) => (
        <div key={bucket.key} className="rounded-[26px] border border-white/10 bg-slate-950/15 p-4">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-white">{bucket.label}</h3>
            <p className={cn("text-lg font-semibold", accentClass)}>{formatCurrency(bucket.total)}</p>
          </div>
          <TransactionList items={bucket.items} emptyMessage="Nenhum item." creditCards={creditCards} accentClass={accentClass} compact />
        </div>
      ))}
    </div>
  );
}

function TransactionList({
  items,
  emptyMessage,
  creditCards,
  accentClass,
  compact = false
}: {
  items: TransactionWithCard[];
  emptyMessage: string;
  creditCards: CreditCard[];
  accentClass: string;
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-300">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((transaction) => (
        <EditableTransactionCard key={transaction.id} transaction={transaction} creditCards={creditCards} accentClass={accentClass} compact={compact} />
      ))}
    </div>
  );
}

function TransactionForm({ creditCards }: { creditCards: CreditCard[] }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ActionForm serverAction={createTransaction} className="grid gap-3" resetOnSuccess>
      <Input name="title" placeholder="Ex: Salario, Mercado, Canva, Pai" required />
      <Input name="description" placeholder="Observacao ou detalhe" />
      <div className="grid gap-3 md:grid-cols-2">
        <Select name="type" defaultValue="EXPENSE">
          {Object.entries(transactionTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select name="category" defaultValue="NECESSARY">
          {Object.entries(transactionCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="amount" type="number" step="0.01" placeholder="Valor" required />
        <Input name="transactionDate" type="date" defaultValue={today} required />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select name="status" defaultValue="PAID">
          {Object.entries(transactionStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input name="source" placeholder="Grupo: Cartao, Nicoli, Pai, Outros" />
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white">
        <input type="checkbox" name="isCreditCard" className="h-4 w-4 rounded" />
        Movimento no cartao de credito
      </label>
      <Select name="creditCardId" defaultValue="">
        <option value="">Selecione o cartao</option>
        {creditCards.map((creditCard) => (
          <option key={creditCard.id} value={creditCard.id}>
            {creditCard.name}
          </option>
        ))}
      </Select>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="installmentCurrent" type="number" min="1" placeholder="Parcela atual" />
        <Input name="installmentTotal" type="number" min="1" placeholder="Total de parcelas" />
      </div>
      <Button type="submit">Salvar item</Button>
    </ActionForm>
  );
}

function CreditCardForm() {
  return (
    <ActionForm serverAction={createCreditCard} className="grid gap-3" resetOnSuccess>
      <Input name="name" placeholder="Ex: Inter Black" required />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="brand" placeholder="Bandeira" />
        <Input name="closingDay" type="number" min="1" max="31" placeholder="Dia de fechamento" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="dueDay" type="number" min="1" max="31" placeholder="Dia de vencimento" />
        <Input name="note" placeholder="Observacao" />
      </div>
      <Button type="submit" variant="secondary">
        Adicionar cartao
      </Button>
    </ActionForm>
  );
}

function CreditCardList({ creditCards }: { creditCards: CreditCard[] }) {
  if (creditCards.length === 0) {
    return <p className="text-sm text-slate-300">Nenhum cartao cadastrado ainda.</p>;
  }

  return (
    <div className="grid gap-3">
      {creditCards.map((creditCard) => (
        <EditableCreditCard key={creditCard.id} creditCard={creditCard} />
      ))}
    </div>
  );
}

function InvestmentForm() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ActionForm serverAction={createInvestment} className="grid gap-3" resetOnSuccess>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="name" placeholder="Ex: CDB Liquidez Diaria" required />
        <Input name="ticker" placeholder="Ticker" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select name="assetType" defaultValue="CDB">
          {Object.entries(assetTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input name="institution" placeholder="Instituicao" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="quantity" type="number" step="0.0001" placeholder="Quantidade" />
        <Input name="amountBRL" type="number" step="0.01" placeholder="Valor em BRL" required />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="usdRate" type="number" step="0.0001" placeholder="Cotacao USD" />
        <Input name="referenceDate" type="date" defaultValue={today} required />
      </div>
      <Input name="notes" placeholder="Observacoes" />
      <Button type="submit" variant="secondary">
        Salvar investimento
      </Button>
    </ActionForm>
  );
}

function InvestmentList({ investments }: { investments: Investment[] }) {
  if (investments.length === 0) {
    return <p className="text-sm text-slate-300">Nenhum ativo registrado neste periodo.</p>;
  }

  return (
    <div className="space-y-3">
      {investments.map((investment) => (
        <EditableInvestmentCard key={investment.id} investment={investment} />
      ))}
    </div>
  );
}

function SummaryForm({
  selectedMonth,
  summary,
  summaryMeta
}: {
  selectedMonth: string;
  summary: Summary | null;
  summaryMeta: { salaryBase: number; purchaseEstimate: number; investmentWithdrawn: number; noteText: string };
}) {
  return (
    <ActionForm serverAction={upsertSummary} className="grid gap-3">
      <Input type="month" name="monthReference" defaultValue={selectedMonth} required />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="salaryBase" type="number" step="0.01" placeholder="Salario base" defaultValue={summaryMeta.salaryBase} />
        <Input name="purchaseEstimate" type="number" step="0.01" placeholder="A comprar" defaultValue={summaryMeta.purchaseEstimate} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="cashBalance" type="number" step="0.01" placeholder="Sobra em dinheiro" defaultValue={Number(summary?.cashBalance ?? 0)} required />
        <Input name="digitalBalance" type="number" step="0.01" placeholder="Sobra digital" defaultValue={Number(summary?.digitalBalance ?? 0)} required />
      </div>
      <Input name="investmentWithdrawn" type="number" step="0.01" placeholder="Retirado dos investimentos" defaultValue={summaryMeta.investmentWithdrawn} />
      <Input name="noteText" placeholder="Observacao" defaultValue={summaryMeta.noteText} />
      <Button type="submit" variant="secondary">
        Salvar fechamento
      </Button>
    </ActionForm>
  );
}

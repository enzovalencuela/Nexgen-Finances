import { ArrowDownCircle, ArrowUpCircle, BadgeDollarSign, Landmark, PiggyBank, Wallet } from "lucide-react";
import Image from "next/image";
import type { CreditCard, Investment, Summary, User } from "@prisma/client";

import { createCreditCard, createInvestment, createTransaction, upsertSummary } from "@/app/actions";
import { assetTypeLabels, transactionCategoryLabels, transactionStatusLabels, transactionTypeLabels } from "@/lib/constants";
import type { MonthlyStatementData, StatementBucket, TransactionWithCard } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { EditableInvestmentCard } from "@/components/editable-investment-card";
import { EditableTransactionCard } from "@/components/editable-transaction-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { SignOutButton } from "@/components/sign-out-button";

type Props = MonthlyStatementData & {
  user: Pick<User, "name" | "email" | "image">;
};

const sectionThemes = {
  entries: {
    panel: "border-cyan-400/30 bg-cyan-500/5",
    total: "text-cyan-300"
  },
  payables: {
    panel: "border-yellow-300/30 bg-yellow-400/5",
    total: "text-yellow-200"
  },
  receivables: {
    panel: "border-sky-400/30 bg-sky-500/5",
    total: "text-sky-300"
  },
  expenses: {
    panel: "border-fuchsia-400/30 bg-fuchsia-500/5",
    total: "text-fuchsia-300"
  },
  investments: {
    panel: "border-emerald-400/30 bg-emerald-500/5",
    total: "text-emerald-300"
  }
} as const;

const overviewCards = [
  { key: "entries", label: "Entradas", icon: ArrowUpCircle, color: "text-accent" },
  { key: "payables", label: "A Pagar", icon: ArrowDownCircle, color: "text-danger" },
  { key: "expenses", label: "Contas do Mes", icon: BadgeDollarSign, color: "text-warning" },
  { key: "leftover", label: "Sobra", icon: Wallet, color: "text-info" },
  { key: "investmentsBRL", label: "Investimentos BRL", icon: Landmark, color: "text-info" },
  { key: "receivables", label: "A Receber", icon: PiggyBank, color: "text-accent" }
] as const;

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
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Panel className="overflow-hidden bg-grid p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-accent/20 bg-accent/10">
                  <Image src="/favicon.ico" alt="Nexgen Finance" width={30} height={30} className="h-8 w-8 rounded-lg" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Nexgen Finance</p>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  Fechamento mensal de {user.name?.split(" ")[0] ?? "usuario"}.
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted sm:text-base">
                  Uma leitura no mesmo formato do seu documento: entradas, a pagar, a receber, contas, sobra e investimentos.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <FilterForm selectedMonth={selectedMonth} />
              <SignOutButton />
            </div>
          </div>
        </Panel>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {overviewCards.map((card) => {
            const Icon = card.icon;
            const value = totals[card.key];

            return (
              <Panel key={card.key} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted">{card.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(value)}</p>
                  </div>
                  <div className={cn("rounded-2xl bg-white/5 p-3", card.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Panel>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6">
            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Resumo do mes"
                title="Visao consolidada"
                description="Totais principais espelhando seu fechamento manual de janeiro e dos proximos meses."
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric label="Salario Base" value={summaryMeta.salaryBase} subtle />
                <SummaryMetric label="A Receber" value={totals.receivables} subtle />
                <SummaryMetric label="A Comprar" value={summaryMeta.purchaseEstimate} subtle />
                <SummaryMetric label="Retirado dos Investimentos" value={summaryMeta.investmentWithdrawn} subtle />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SummaryMetric label="Sobra Dinheiro" value={Number(summary?.cashBalance ?? 0)} subtle />
                <SummaryMetric label="Sobra Digital" value={Number(summary?.digitalBalance ?? 0)} subtle />
              </div>
            </Panel>

            <MonthlySection
              eyebrow="Entradas"
              title="Dinheiro que entrou no mes"
              description={`Total recebido: ${formatCurrency(totals.entries)}`}
              items={entries}
              emptyMessage="Nenhuma entrada registrada neste periodo."
              creditCards={creditCards}
              theme={sectionThemes.entries}
            />

            <BucketSection
              eyebrow="A pagar"
              title="Compromissos em aberto"
              description={`Total a pagar: ${formatCurrency(totals.payables)}`}
              buckets={payableBuckets}
              emptyMessage="Nenhum valor pendente neste periodo."
              creditCards={creditCards}
              theme={sectionThemes.payables}
            />

            <BucketSection
              eyebrow="A receber"
              title="Valores que ainda vao entrar"
              description={`Total a receber: ${formatCurrency(totals.receivables)}`}
              buckets={receivableBuckets}
              emptyMessage="Nenhum valor a receber neste periodo."
              creditCards={creditCards}
              theme={sectionThemes.receivables}
            />

            <Panel className={cn("space-y-5", sectionThemes.expenses.panel)}>
              <SectionHeading
                eyebrow="Contas"
                title="Gastos efetivos do mes"
                description={`Total de contas do mes: ${formatCurrency(totals.expenses)}`}
              />

              <BucketList buckets={expenseBuckets} emptyMessage="Nenhuma conta paga neste periodo." creditCards={creditCards} accentClass={sectionThemes.expenses.total} />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric label="Gastos Necessarios" value={classificationTotals.necessary} subtle />
                <SummaryMetric label="Nao tao necessarios" value={classificationTotals.optional} subtle />
                <SummaryMetric label="Lazer" value={classificationTotals.leisure} subtle />
                <SummaryMetric label="Investimentos" value={classificationTotals.investment} subtle />
              </div>
            </Panel>

            <Panel className={cn("space-y-5", sectionThemes.investments.panel)}>
              <SectionHeading
                eyebrow="Investimentos"
                title="Carteira do mes"
                description={`Total: ${formatCurrency(investmentOverview.totalBRL)} + ${formatCurrency(investmentOverview.totalUSD, "USD")}`}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <SummaryMetric label="Investido em BRL" value={investmentOverview.totalBRL} subtle />
                <SummaryMetric label="Investido em USD" value={investmentOverview.totalUSD} currency="USD" subtle />
                <SummaryMetric label="Ativos cadastrados" value={investments.length} numeric subtle />
              </div>

              <InvestmentList investments={investments} />
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Lancamento rapido"
                title="Novo item do fechamento"
                description="Use este formulario para registrar entradas, contas, parcelas, valores a receber e outros movimentos."
              />
              <TransactionForm creditCards={creditCards} />
            </Panel>

            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Cartoes"
                title="Controle intuitivo de parcelas"
                description="Mantenha os cartoes separados e registre parcela atual/total para acompanhar 5/12, 1/2 e similares."
              />
              <CreditCardForm />
              <CreditCardList creditCards={creditCards} />
            </Panel>

            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Fechamento mensal"
                title="Sobra, salario e observacoes"
                description="Consolide salario base, sobra em dinheiro, sobra digital, compras planejadas e retiradas de investimentos."
              />
              <SummaryForm selectedMonth={selectedMonth} summary={summary} summaryMeta={summaryMeta} />
            </Panel>

            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Adicionar ativo"
                title="Investimento"
                description="Cadastre CDB, LCI, fundos, cripto, Binance, MB e posicao em USD."
              />
              <InvestmentForm />
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
        Filtrar mes
      </Button>
    </form>
  );
}

function SummaryMetric({
  label,
  value,
  subtle,
  currency = "BRL",
  numeric = false
}: {
  label: string;
  value: number;
  subtle?: boolean;
  currency?: "BRL" | "USD";
  numeric?: boolean;
}) {
  return (
    <div className={cn("rounded-3xl border p-4", subtle ? "border-white/8 bg-white/[0.03]" : "border-accent/15 bg-accent/5")}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{numeric ? value : formatCurrency(value, currency)}</p>
    </div>
  );
}

function MonthlySection({
  eyebrow,
  title,
  description,
  items,
  emptyMessage,
  creditCards,
  theme
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: TransactionWithCard[];
  emptyMessage: string;
  creditCards: CreditCard[];
  theme: { panel: string; eyebrow: string; total: string };
}) {
  return (
    <Panel className={cn("space-y-5", theme.panel)}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <TransactionList items={items} emptyMessage={emptyMessage} creditCards={creditCards} accentClass={theme.total} />
    </Panel>
  );
}

function BucketSection({
  eyebrow,
  title,
  description,
  buckets,
  emptyMessage,
  creditCards,
  theme
}: {
  eyebrow: string;
  title: string;
  description: string;
  buckets: StatementBucket[];
  emptyMessage: string;
  creditCards: CreditCard[];
  theme: { panel: string; eyebrow: string; total: string };
}) {
  return (
    <Panel className={cn("space-y-5", theme.panel)}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <BucketList buckets={buckets} emptyMessage={emptyMessage} creditCards={creditCards} accentClass={theme.total} />
    </Panel>
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
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {buckets.map((bucket) => (
        <div key={bucket.key} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/8 pb-4">
            <h3 className="text-lg font-semibold text-white">{bucket.label}</h3>
            <p className={cn("text-base font-semibold", accentClass)}>{formatCurrency(bucket.total)}</p>
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
    return <p className="text-sm text-muted">{emptyMessage}</p>;
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
    <form action={createTransaction} className="grid gap-3">
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
    </form>
  );
}

function CreditCardForm() {
  return (
    <form action={createCreditCard} className="grid gap-3">
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
    </form>
  );
}

function CreditCardList({ creditCards }: { creditCards: CreditCard[] }) {
  if (creditCards.length === 0) {
    return <p className="text-sm text-muted">Nenhum cartao cadastrado ainda.</p>;
  }

  return (
    <div className="grid gap-3">
      {creditCards.map((creditCard) => (
        <div key={creditCard.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">{creditCard.name}</p>
              <p className="text-sm text-muted">{creditCard.brand ?? "Sem bandeira"}</p>
            </div>
            <p className="text-sm text-muted">
              Fecha dia {creditCard.closingDay ?? "-"} • vence dia {creditCard.dueDay ?? "-"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InvestmentForm() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={createInvestment} className="grid gap-3">
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
    </form>
  );
}

function InvestmentList({ investments }: { investments: Investment[] }) {
  if (investments.length === 0) {
    return <p className="text-sm text-muted">Nenhum ativo registrado neste periodo.</p>;
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
    <form action={upsertSummary} className="grid gap-3">
      <Input type="month" name="monthReference" defaultValue={selectedMonth} required />
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          name="salaryBase"
          type="number"
          step="0.01"
          placeholder="Salario base"
          defaultValue={summaryMeta.salaryBase}
        />
        <Input
          name="purchaseEstimate"
          type="number"
          step="0.01"
          placeholder="A comprar"
          defaultValue={summaryMeta.purchaseEstimate}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          name="cashBalance"
          type="number"
          step="0.01"
          placeholder="Sobra em dinheiro"
          defaultValue={Number(summary?.cashBalance ?? 0)}
          required
        />
        <Input
          name="digitalBalance"
          type="number"
          step="0.01"
          placeholder="Sobra digital"
          defaultValue={Number(summary?.digitalBalance ?? 0)}
          required
        />
      </div>
      <Input
        name="investmentWithdrawn"
        type="number"
        step="0.01"
        placeholder="Retirado dos investimentos"
        defaultValue={summaryMeta.investmentWithdrawn}
      />
      <Input name="noteText" placeholder="Observacao" defaultValue={summaryMeta.noteText} />
      <Button type="submit" variant="secondary">
        Salvar fechamento
      </Button>
    </form>
  );
}

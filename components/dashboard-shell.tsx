import { ArrowDownCircle, ArrowUpCircle, Landmark, Wallet } from "lucide-react";
import { TransactionCategory, type CreditCard, type Investment, type Summary, type Transaction, type User } from "@prisma/client";

import { createCreditCard, createInvestment, createTransaction, upsertSummary } from "@/app/actions";
import { assetTypeLabels, transactionCategoryLabels, transactionStatusLabels, transactionTypeLabels } from "@/lib/constants";
import type { DashboardTotals } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { SignOutButton } from "@/components/sign-out-button";

type Props = {
  user: Pick<User, "name" | "email" | "image">;
  selectedMonth: string;
  selectedCategory: TransactionCategory | "ALL";
  totals: DashboardTotals;
  transactions: Array<Transaction & { creditCard: CreditCard | null }>;
  investments: Investment[];
  summary: Summary | null;
  creditCards: CreditCard[];
  investmentOverview: {
    totalBRL: number;
    totalUSD: number;
    byType: Partial<Record<Investment["assetType"], number>>;
  };
};

const statCards = [
  {
    label: "Total Recebido",
    key: "totalReceived",
    icon: ArrowUpCircle,
    color: "text-accent"
  },
  {
    label: "Total a Pagar",
    key: "totalToPay",
    icon: ArrowDownCircle,
    color: "text-danger"
  },
  {
    label: "Total Investido",
    key: "totalInvested",
    icon: Landmark,
    color: "text-info"
  },
  {
    label: "Sobra Atual",
    key: "currentBalance",
    icon: Wallet,
    color: "text-warning"
  }
] as const;

export function DashboardShell(props: Props) {
  const {
    user,
    selectedMonth,
    selectedCategory,
    totals,
    transactions,
    investments,
    summary,
    creditCards,
    investmentOverview
  } = props;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Panel className="overflow-hidden bg-grid p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Nexgen Finance</p>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  Visao financeira completa, {user.name?.split(" ")[0] ?? "usuario"}.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
                  Dashboard com resumo automatico por classificacao, historico mensal, investimentos e controle intuitivo de parcelas do cartao.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <FilterForm selectedMonth={selectedMonth} selectedCategory={selectedCategory} />
              <SignOutButton />
            </div>
          </div>
        </Panel>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
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

        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-6">
            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Resumo automatico"
                title="Classificacao mensal"
                description="Replica seu fechamento manual com totais por Necessarios, Lazer e Investimentos."
              />

              <div className="grid gap-4 md:grid-cols-3">
                <SummaryMetric label="Necessarios" value={totals.necessaryTotal} />
                <SummaryMetric label="Lazer" value={totals.leisureTotal} />
                <SummaryMetric label="Investimentos" value={totals.investmentCategoryTotal} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SummaryMetric label="Sobra Dinheiro" value={totals.cashLeftover} subtle />
                <SummaryMetric label="Sobra Digital" value={totals.digitalLeftover} subtle />
              </div>
            </Panel>

            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Historico financeiro"
                title="Lancamentos do periodo"
                description="Tabela filtravel por mes e classificacao com status, fonte e parcelas do cartao."
              />
              <HistoryTable transactions={transactions} />
            </Panel>

            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Investimentos"
                title="Carteira e ativos acompanhados"
                description="Area dedicada para CDB, LCI, fundos, cripto e ETF GOLB11 com conversao simples para USD."
              />

              <div className="grid gap-4 md:grid-cols-3">
                <SummaryMetric label="Investido em BRL" value={investmentOverview.totalBRL} />
                <SummaryMetric label="Equivalente em USD" value={investmentOverview.totalUSD} currency="USD" />
                <SummaryMetric label="Ativos cadastrados" value={investments.length} numeric />
              </div>

              <InvestmentList investments={investments} />
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Adicao rapida"
                title="Novo lancamento"
                description="Cadastre entrada, saida, investimento ou conta a pagar em um clique."
              />
              <TransactionForm creditCards={creditCards} />
            </Panel>

            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Cartao de credito"
                title="Parcelamento intuitivo"
                description="Cadastre o cartao e use os campos atual/total para registrar 7/12, 1/2 e similares."
              />
              <CreditCardForm />
              <CreditCardList creditCards={creditCards} />
            </Panel>

            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Investimentos"
                title="Adicionar ativo"
                description="Inclua ticker, instituicao, valor em BRL e taxa de cambio para gerar USD automaticamente."
              />
              <InvestmentForm />
            </Panel>

            <Panel className="space-y-5">
              <SectionHeading
                eyebrow="Fechamento"
                title="Resumo de sobra"
                description="Registre a sobra em dinheiro e digital para fechar o mes com precisao."
              />
              <SummaryForm selectedMonth={selectedMonth} summary={summary} />
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterForm({ selectedMonth, selectedCategory }: { selectedMonth: string; selectedCategory: TransactionCategory | "ALL" }) {
  return (
    <form className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <Input type="month" name="month" defaultValue={selectedMonth} className="min-w-40 bg-transparent" />
      <Select name="category" defaultValue={selectedCategory} className="min-w-40 bg-transparent">
        <option value="ALL">Todas categorias</option>
        {Object.entries(transactionCategoryLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary">
        Filtrar
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

function HistoryTable({ transactions }: { transactions: Array<Transaction & { creditCard: CreditCard | null }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-muted">
          <tr className="border-b border-white/10">
            <th className="pb-3 font-medium">Titulo</th>
            <th className="pb-3 font-medium">Tipo</th>
            <th className="pb-3 font-medium">Categoria</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Data</th>
            <th className="pb-3 font-medium">Valor</th>
            <th className="pb-3 font-medium">Cartao</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-white/5 text-white/90 last:border-b-0">
              <td className="py-4">
                <div>
                  <p className="font-medium text-white">{transaction.title}</p>
                  {transaction.source ? <p className="text-xs text-muted">{transaction.source}</p> : null}
                </div>
              </td>
              <td className="py-4">{transactionTypeLabels[transaction.type]}</td>
              <td className="py-4">{transactionCategoryLabels[transaction.category]}</td>
              <td className="py-4">{transactionStatusLabels[transaction.status]}</td>
              <td className="py-4">{formatDate(transaction.transactionDate)}</td>
              <td className="py-4 font-medium">{formatCurrency(Number(transaction.amount))}</td>
              <td className="py-4 text-muted">
                {transaction.isCreditCard
                  ? `${transaction.creditCard?.name ?? "Cartao"}${
                      transaction.installmentCurrent && transaction.installmentTotal
                        ? ` • ${transaction.installmentCurrent}/${transaction.installmentTotal}`
                        : ""
                    }`
                  : "-"}
              </td>
            </tr>
          ))}
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-muted">
                Nenhum lancamento encontrado para os filtros atuais.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function TransactionForm({ creditCards }: { creditCards: CreditCard[] }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={createTransaction} className="grid gap-3">
      <Input name="title" placeholder="Ex: Salario, Aluguel, GOLB11" required />
      <Input name="description" placeholder="Descricao opcional" />
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
        <Input name="source" placeholder="Fonte ou conta" />
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white">
        <input type="checkbox" name="isCreditCard" className="h-4 w-4 rounded" />
        Compra no cartao de credito
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
      <Button type="submit">Salvar lancamento</Button>
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
        <Input name="name" placeholder="Ex: Banco Inter GOLB11" required />
        <Input name="ticker" placeholder="Ticker" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select name="assetType" defaultValue="ETF">
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
        Salvar ativo
      </Button>
    </form>
  );
}

function InvestmentList({ investments }: { investments: Investment[] }) {
  if (investments.length === 0) {
    return <p className="text-sm text-muted">Nenhum ativo registrado neste periodo.</p>;
  }

  return (
    <div className="grid gap-3">
      {investments.map((investment) => (
        <div key={investment.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-white">
                {investment.name}
                {investment.ticker ? <span className="text-muted"> • {investment.ticker}</span> : null}
              </p>
              <p className="text-sm text-muted">
                {assetTypeLabels[investment.assetType]}{investment.institution ? ` • ${investment.institution}` : ""}
              </p>
            </div>

            <div className="text-right">
              <p className="font-medium text-white">{formatCurrency(Number(investment.amountBRL))}</p>
              <p className="text-sm text-muted">
                {investment.amountUSD ? formatCurrency(Number(investment.amountUSD), "USD") : "Sem conversao USD"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryForm({ selectedMonth, summary }: { selectedMonth: string; summary: Summary | null }) {
  return (
    <form action={upsertSummary} className="grid gap-3">
      <Input type="month" name="monthReference" defaultValue={selectedMonth} required />
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
      <Input name="note" placeholder="Observacao" defaultValue={summary?.note ?? ""} />
      <Button type="submit" variant="secondary">
        Salvar resumo
      </Button>
    </form>
  );
}

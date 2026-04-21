import { createCreditCard, createInvestment, upsertSummary } from "@/app/actions";
import { assetTypeLabels } from "@/lib/constants";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function CreditCardForm() {
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

export function InvestmentForm() {
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

export function SummaryForm({
  selectedMonth,
  summary,
  summaryMeta
}: {
  selectedMonth: string;
  summary: { cashBalance: number; digitalBalance: number } | null;
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
        <Input name="cashBalance" type="number" step="0.01" placeholder="Sobra em dinheiro" defaultValue={summary?.cashBalance ?? 0} required />
        <Input name="digitalBalance" type="number" step="0.01" placeholder="Sobra digital" defaultValue={summary?.digitalBalance ?? 0} required />
      </div>
      <Input name="investmentWithdrawn" type="number" step="0.01" placeholder="Retirado dos investimentos" defaultValue={summaryMeta.investmentWithdrawn} />
      <Input name="noteText" placeholder="Observacao" defaultValue={summaryMeta.noteText} />
      <Button type="submit" variant="secondary">
        Salvar fechamento
      </Button>
    </ActionForm>
  );
}

import { AssetType, type Investment } from "@prisma/client";

import { deleteInvestment, updateInvestment } from "@/app/actions";
import { assetTypeLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function EditableInvestmentCard({ investment }: { investment: Investment }) {
  const defaultDate = new Date(investment.referenceDate).toISOString().slice(0, 10);

  return (
    <details className="group rounded-2xl border border-white/10 bg-slate-950/20 p-4 open:bg-slate-950/35">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">{investment.name}</p>
            <p className="text-sm text-slate-300">
              {assetTypeLabels[investment.assetType]}
              {investment.institution ? ` • ${investment.institution}` : ""}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-white">{formatCurrency(Number(investment.amountBRL))}</p>
            <p className="text-xs text-slate-300">
              {investment.amountUSD ? formatCurrency(Number(investment.amountUSD), "USD") : "Sem valor em USD"}
            </p>
          </div>
        </div>
      </summary>

      <div className="mt-4 border-t border-white/10 pt-4">
        <ActionForm serverAction={updateInvestment} className="grid gap-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={investment.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="name" defaultValue={investment.name} />
            <Input name="ticker" defaultValue={investment.ticker ?? ""} placeholder="Ticker" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select name="assetType" defaultValue={investment.assetType}>
              {Object.entries(assetTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input name="institution" defaultValue={investment.institution ?? ""} placeholder="Instituição" />
            <Input name="amountBRL" type="number" step="0.01" defaultValue={Number(investment.amountBRL)} />
            <Input name="amountUSD" type="number" step="0.01" defaultValue={investment.amountUSD ? Number(investment.amountUSD) : ""} placeholder="USD" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Input name="quantity" type="number" step="0.0001" defaultValue={investment.quantity ? Number(investment.quantity) : ""} placeholder="Quantidade" />
            <Input name="referenceDate" type="date" defaultValue={defaultDate} />
            <Input name="notes" defaultValue={investment.notes ?? ""} placeholder="Observações" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="secondary">
              Salvar
            </Button>
          </div>
        </ActionForm>

        <ActionForm serverAction={deleteInvestment} className="mt-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={investment.id} />
          <Button type="submit" variant="ghost" className="px-0 text-rose-300 hover:text-rose-200">
            Excluir investimento
          </Button>
        </ActionForm>
      </div>
    </details>
  );
}

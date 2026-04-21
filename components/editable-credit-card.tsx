import type { CreditCard } from "@prisma/client";

import { deleteCreditCard, updateCreditCard } from "@/app/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditableCreditCard({ creditCard }: { creditCard: CreditCard }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-slate-950/20 p-4 open:bg-slate-950/35">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">{creditCard.name}</p>
            <p className="text-sm text-slate-300">{creditCard.brand ?? "Sem bandeira"}</p>
          </div>

          <div className="text-right text-sm text-slate-300">
            Fecha dia {creditCard.closingDay ?? "-"} • vence dia {creditCard.dueDay ?? "-"}
          </div>
        </div>
      </summary>

      <div className="mt-4 border-t border-white/10 pt-4">
        <ActionForm serverAction={updateCreditCard} className="grid gap-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={creditCard.id} />
          <Input name="name" defaultValue={creditCard.name} placeholder="Nome do cartao" />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="brand" defaultValue={creditCard.brand ?? ""} placeholder="Bandeira" />
            <Input name="closingDay" type="number" min="1" max="31" defaultValue={creditCard.closingDay ?? ""} placeholder="Dia de fechamento" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="dueDay" type="number" min="1" max="31" defaultValue={creditCard.dueDay ?? ""} placeholder="Dia de vencimento" />
            <Input name="note" defaultValue={creditCard.note ?? ""} placeholder="Observacao" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="secondary">
              Salvar
            </Button>
          </div>
        </ActionForm>

        <ActionForm serverAction={deleteCreditCard} className="mt-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={creditCard.id} />
          <Button type="submit" variant="ghost" className="px-0 text-rose-300 hover:text-rose-200">
            Excluir cartao
          </Button>
        </ActionForm>
      </div>
    </details>
  );
}

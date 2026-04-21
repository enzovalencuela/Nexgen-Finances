import type { CreditCard } from "@prisma/client";

import { deleteCreditCard, updateCreditCard } from "@/app/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditableCreditCard({ creditCard }: { creditCard: CreditCard }) {
  return (
    <details className="group rounded-xl border border-white/10 bg-[#20252d] p-3 open:bg-[#262c35]">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-white">{creditCard.name}</p>
            <p className="text-[12px] text-slate-400">{creditCard.brand ?? "Sem bandeira"}</p>
          </div>

          <div className="text-right text-[12px] text-slate-400">
            Fecha dia {creditCard.closingDay ?? "-"} • vence dia {creditCard.dueDay ?? "-"}
          </div>
        </div>
      </summary>

      <div className="mt-4 border-t border-white/10 pt-4">
        <ActionForm serverAction={updateCreditCard} className="grid gap-3" closeDetailsOnSuccess>
          <input type="hidden" name="id" value={creditCard.id} />
          <Input name="name" defaultValue={creditCard.name} placeholder="Nome do cartão" />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="brand" defaultValue={creditCard.brand ?? ""} placeholder="Bandeira" />
            <Input name="closingDay" type="number" min="1" max="31" defaultValue={creditCard.closingDay ?? ""} placeholder="Dia de fechamento" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="dueDay" type="number" min="1" max="31" defaultValue={creditCard.dueDay ?? ""} placeholder="Dia de vencimento" />
            <Input name="note" defaultValue={creditCard.note ?? ""} placeholder="Observação" />
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
            Excluir cartão
          </Button>
        </ActionForm>
      </div>
    </details>
  );
}

import { CalendarDays, CreditCard, LayoutGrid, NotebookTabs } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@prisma/client";

import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatMonthLabel } from "@/lib/utils";

type Props = {
  user: Pick<User, "name" | "email" | "image">;
  selectedMonth: string;
  currentPath: "/" | "/fechamento" | "/cartoes" | `/cartoes/${string}`;
  title: string;
  description: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/" as const, label: "Início", icon: LayoutGrid },
  { href: "/fechamento" as const, label: "Fechamento", icon: NotebookTabs },
  { href: "/cartoes" as const, label: "Cartões", icon: CreditCard }
];

export function AppShell({ user, selectedMonth, currentPath, title, description, children }: Props) {
  return (
    <main className="min-h-screen bg-[#101317] px-3 py-3 sm:px-4">
      <div className="mx-auto grid max-w-[1600px] gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-r border-white/10 pr-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#262c35]">
                <Image src="/favicon.ico" alt="Nexgen Finance" width={24} height={24} className="h-6 w-6 rounded-md" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Nexgen Finance</p>
                <p className="text-[12px] text-slate-500">Controle mensal</p>
              </div>
            </div>

            <nav className="grid gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={buildMonthHref(item.href, selectedMonth)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition",
                      isActive ? "bg-[#262c35] text-white" : "text-slate-300 hover:bg-[#20252d] hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Mês aberto</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#20252d] px-3 py-2 text-[13px] text-slate-200">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {formatMonthLabel(selectedMonth)}
            </div>

            <form action={currentPath} className="mt-3 grid gap-2">
              <Input type="month" name="month" defaultValue={selectedMonth} className="bg-[#20252d]" />
              <Button type="submit" variant="secondary" className="justify-center bg-[#20252d]">
                Abrir mês
              </Button>
            </form>
            </div>

            <div className="pt-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Conta</p>
            <div className="mt-2 rounded-xl bg-[#20252d] px-3 py-3">
              <p className="text-[13px] font-medium text-white">{user.name || "Usuário"}</p>
              <p className="mt-1 text-[12px] text-slate-400">{user.email}</p>
            </div>
            <div className="mt-3">
              <SignOutButton />
            </div>
            </div>
          </div>
        </aside>

        <section className="space-y-4 pl-0 lg:pl-4">
          <div className="border-b border-white/10 pb-4 pt-1">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Área atual</p>
            <h1 className="mt-2 text-[1.35rem] font-semibold text-white">{title}</h1>
            <p className="mt-1 text-[13px] leading-6 text-slate-400">{description}</p>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}

function buildMonthHref(path: string, selectedMonth: string) {
  return `${path}?month=${selectedMonth}`;
}

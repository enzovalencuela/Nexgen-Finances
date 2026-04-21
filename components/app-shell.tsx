import { CalendarDays, CreditCard, LayoutGrid, NotebookTabs } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@prisma/client";

import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitch } from "@/components/theme-switch";
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
    <main className="min-h-screen bg-[#f5f2ec] px-2 py-2 dark:bg-[#111318] sm:px-3">
      <div className="mx-auto grid max-w-[1750px] gap-0 rounded-[20px] border border-slate-300 bg-[#efebe4] dark:border-slate-800 dark:bg-[#171a20] lg:grid-cols-[260px_240px_minmax(0,1fr)]">
        <aside className="border-r border-slate-300 bg-[#ece7df] px-3 py-4 dark:border-slate-800 dark:bg-[#151922]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-transparent">
              <Image src="/favicon.ico" alt="Nexgen Finance" width={20} height={20} className="h-5 w-5 rounded-sm" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Nexgen Finance</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">Caderno financeiro</p>
            </div>
          </div>

          <nav className="mt-6 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={buildMonthHref(item.href, selectedMonth)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition",
                    isActive
                      ? "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100"
                      : "text-slate-700 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-slate-300 pt-4 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Tema</p>
            <div className="mt-2">
              <ThemeSwitch />
            </div>

            <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Conta</p>
            <div className="mt-2 rounded-lg bg-white/60 px-3 py-3 dark:bg-slate-900/70">
              <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{user.name || "Usuário"}</p>
              <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
            <div className="mt-3">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <aside className="border-r border-slate-300 bg-[#f2eee8] px-3 py-4 dark:border-slate-800 dark:bg-[#1a1e27]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Mês</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[13px] text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
            <CalendarDays className="h-4 w-4 text-violet-700 dark:text-violet-300" />
            {formatMonthLabel(selectedMonth)}
          </div>

          <form action={currentPath} className="mt-4 grid gap-2">
            <Input type="month" name="month" defaultValue={selectedMonth} />
            <Button type="submit" variant="secondary" className="justify-center">
              Abrir mês
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Página</p>
            <div className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{title}</p>
              <p className="mt-1 text-[12px] leading-5 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 bg-[#fbfaf7] px-4 py-5 dark:bg-[#10141b] sm:px-6">
          <div className="mx-auto max-w-[1100px]">{children}</div>
        </section>
      </div>
    </main>
  );
}

function buildMonthHref(path: string, selectedMonth: string) {
  return `${path}?month=${selectedMonth}`;
}

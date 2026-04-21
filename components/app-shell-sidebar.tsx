"use client";

import { CreditCard, LayoutGrid, Menu, NotebookTabs, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ThemeSwitch } from "@/components/theme-switch";
import { cn } from "@/lib/utils";

type Props = {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  accountActions: React.ReactNode;
  currentPath: "/" | "/fechamento" | "/cartoes" | `/cartoes/${string}`;
  selectedMonth: string;
};

const navItems = [
  { href: "/" as const, label: "Início", icon: LayoutGrid },
  { href: "/fechamento" as const, label: "Fechamento", icon: NotebookTabs },
  { href: "/cartoes" as const, label: "Cartões", icon: CreditCard }
];

export function AppShellSidebar({ user, accountActions, currentPath, selectedMonth }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mb-3 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Abrir menu lateral"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </div>

      <aside className="hidden border-r border-slate-300 bg-[#ece7df] px-3 py-4 dark:border-slate-800 dark:bg-[#151922] lg:block">
        <SidebarContent user={user} accountActions={accountActions} currentPath={currentPath} selectedMonth={selectedMonth} />
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Fechar menu lateral"
          />

          <aside className="relative z-10 h-full w-[min(320px,88vw)] border-r border-slate-300 bg-[#ece7df] px-3 py-4 shadow-2xl dark:border-slate-800 dark:bg-[#151922]">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SidebarContent user={user} accountActions={accountActions} currentPath={currentPath} selectedMonth={selectedMonth} onNavigate={() => setIsOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarContent({ user, accountActions, currentPath, selectedMonth, onNavigate }: Props & { onNavigate?: () => void }) {
  return (
    <>
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
              onClick={onNavigate}
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
          {accountActions}
        </div>
      </div>
    </>
  );
}

function buildMonthHref(path: string, selectedMonth: string) {
  return `${path}?month=${selectedMonth}`;
}

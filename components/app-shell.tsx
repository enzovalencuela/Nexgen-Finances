import { CalendarDays, CreditCard, LayoutGrid, NotebookTabs } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@prisma/client";

import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
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
  { href: "/" as const, label: "Inicio", icon: LayoutGrid },
  { href: "/fechamento" as const, label: "Fechamento", icon: NotebookTabs },
  { href: "/cartoes" as const, label: "Cartoes", icon: CreditCard }
];

export function AppShell({ user, selectedMonth, currentPath, title, description, children }: Props) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(7,16,30,0.98)_0%,rgba(10,25,48,0.96)_45%,rgba(7,16,30,0.98)_100%)] p-6 shadow-glow sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-accent/20 bg-accent/10">
                  <Image src="/favicon.ico" alt="Nexgen Finance" width={34} height={34} className="h-9 w-9 rounded-lg" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Nexgen Finance</p>
                  <p className="mt-1 text-sm text-slate-400">Fechamento mensal com espacos dedicados para cada tarefa</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {formatMonthLabel(selectedMonth)}
                </div>
                <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl xl:text-[3.05rem]">{title}</h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-[1.02rem]">{description}</p>
              </div>

              <nav className="flex flex-wrap gap-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={buildMonthHref(item.href, selectedMonth)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "border-accent/30 bg-accent/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="grid gap-4">
              <Panel className="rounded-[30px] border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Navegacao do mes</p>
                <div className="mt-4 space-y-4">
                  <form action={currentPath} className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <Input type="month" name="month" defaultValue={selectedMonth} className="min-w-40 bg-transparent" />
                    <Button type="submit" variant="secondary">
                      Abrir mes
                    </Button>
                  </form>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-sm font-medium text-white">{user.name || "Usuario"}</p>
                    <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                  </div>

                  <SignOutButton />
                </div>
              </Panel>
            </div>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}

function buildMonthHref(path: string, selectedMonth: string) {
  return `${path}?month=${selectedMonth}`;
}

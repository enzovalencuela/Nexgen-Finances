import Image from "next/image";
import Link from "next/link";

const publicLinks = [
  { href: "/controle-financeiro-pessoal", label: "Controle financeiro" },
  { href: "/fechamento-mensal", label: "Fechamento mensal" },
  { href: "/controle-de-cartoes", label: "Cartões" },
  { href: "/controle-de-investimentos", label: "Investimentos" }
];

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f5f2ec] text-slate-900 dark:bg-[#111318] dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-slate-300 bg-[#fffdf9] px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/favicon.ico" alt="Nexgen Finance" width={28} height={28} className="h-7 w-7 rounded-sm" />
              <div>
                <Link href="/" className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Nexgen Finance
                </Link>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">Controle financeiro pessoal com fechamento mensal</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2 text-[13px]">
              {publicLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap gap-2">
              <Link href="/login" className="rounded-lg bg-violet-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-violet-700">
                Entrar
              </Link>
              <Link href="/painel" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800">
                Painel
              </Link>
            </div>
          </div>
        </header>

        <div className="space-y-8 py-8">{children}</div>

        <footer className="rounded-2xl border border-slate-300 bg-[#fffdf9] px-4 py-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[13px] text-slate-600 dark:text-slate-400">
            Nexgen Finance é uma ferramenta de controle financeiro pessoal para organizar fechamento mensal, cartões, contas a pagar, valores a receber e investimentos.
          </p>
        </footer>
      </div>
    </main>
  );
}

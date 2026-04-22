import Link from "next/link";

import { PublicSiteShell } from "@/components/public-site-shell";

type Section = {
  title: string;
  paragraphs: string[];
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  sections: Section[];
};

export function PublicTopicPage({ eyebrow, title, description, highlights, sections }: Props) {
  return (
    <PublicSiteShell>
      <section className="rounded-2xl border border-slate-300 bg-[#fffdf9] p-6 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-[2rem] font-semibold leading-tight text-slate-900 dark:text-slate-100 sm:text-[2.5rem]">{title}</h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-400">{description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {highlights.map((highlight) => (
            <span key={highlight} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[12px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              {highlight}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-slate-300 bg-[#fffdf9] p-5 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-[1rem] font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
            <div className="mt-3 space-y-3 text-[14px] leading-7 text-slate-600 dark:text-slate-400">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-300 bg-cyan-50 p-6 dark:border-slate-700 dark:bg-cyan-950/20">
        <h2 className="text-[1rem] font-semibold text-slate-900 dark:text-slate-100">Quer usar isso no dia a dia?</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-600 dark:text-slate-400">
          Entre no Nexgen Finance para aplicar esse fluxo no seu painel financeiro e acompanhar mês a mês entradas, contas, cartões e investimentos.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-xl bg-violet-600 px-4 py-2.5 text-[14px] font-medium text-white hover:bg-violet-700">
            Entrar agora
          </Link>
          <Link href="/painel" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
            Abrir painel
          </Link>
        </div>
      </section>
    </PublicSiteShell>
  );
}

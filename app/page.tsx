import Link from "next/link";

import { PublicSiteShell } from "@/components/public-site-shell";
import { buildPublicMetadata } from "@/lib/site";

export const metadata = buildPublicMetadata({
  title: "Controle financeiro pessoal",
  description:
    "Controle financeiro pessoal com fechamento mensal, cartões, faturas, contas a pagar, valores a receber e investimentos em um fluxo simples.",
  path: "/"
});

const topicLinks = [
  {
    href: "/controle-financeiro-pessoal",
    title: "Controle financeiro pessoal",
    description: "Entenda como organizar entradas, gastos, contas e saldo mensal com uma rotina simples."
  },
  {
    href: "/fechamento-mensal",
    title: "Fechamento mensal",
    description: "Veja como estruturar um fechamento mensal claro, reaproveitando saldos e pendências do mês anterior."
  },
  {
    href: "/controle-de-cartoes",
    title: "Controle de cartões",
    description: "Acompanhe compras, parcelas, pagamentos de fatura e valores em atraso sem perder o histórico."
  },
  {
    href: "/controle-de-investimentos",
    title: "Controle de investimentos",
    description: "Consolide investimentos em reais e dólar dentro do mesmo fechamento financeiro."
  }
];

export default function MarketingHomePage() {
  return (
    <PublicSiteShell>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-300 bg-[#fffdf9] p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Controle financeiro pessoal</p>
          <h1 className="mt-3 max-w-3xl text-[2rem] font-semibold leading-tight text-slate-900 dark:text-slate-100 sm:text-[2.6rem]">
            Fechamento mensal, cartões, contas e investimentos em um fluxo direto.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600 dark:text-slate-400">
            O Nexgen Finance foi pensado para quem quer visualizar entradas, contas a pagar, valores a receber, cartões e investimentos sem depender de dashboard poluído.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-xl bg-violet-600 px-4 py-2.5 text-[14px] font-medium text-white hover:bg-violet-700">
              Entrar no Nexgen Finance
            </Link>
            <Link href="/painel" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
              Abrir painel
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-cyan-50 p-6 dark:border-slate-700 dark:bg-cyan-950/20">
          <h2 className="text-[1rem] font-bold uppercase text-slate-900 dark:text-slate-100">O que o app organiza</h2>
          <div className="mt-4 space-y-3 text-[14px] text-slate-700 dark:text-slate-300">
            <InfoLine label="Entradas" value="Salário, repasses e recebimentos" />
            <InfoLine label="A pagar" value="Contas pendentes e cobranças futuras" />
            <InfoLine label="Cartões" value="Compras, parcelas, faturas e atrasos" />
            <InfoLine label="A receber" value="Valores pendentes até receber" />
            <InfoLine label="Investimentos" value="Posição consolidada por mês" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Fechamento mensal claro"
          description="Separe o mês entre entradas, contas, pendências, cartões e sobra total em um formato fácil de revisar."
        />
        <FeatureCard
          title="Cartões sem bagunça"
          description="Compras parceladas aparecem nos meses seguintes, pagamentos abatem a fatura e atrasos continuam visíveis."
        />
        <FeatureCard
          title="Investimentos no mesmo fluxo"
          description="Acompanhe os valores investidos junto do restante do fechamento financeiro mensal."
        />
      </section>

      <section className="rounded-2xl border border-slate-300 bg-[#fffdf9] p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-[1.2rem] font-semibold text-slate-900 dark:text-slate-100">Páginas públicas para SEO</h2>
        <p className="mt-2 text-[14px] leading-6 text-slate-600 dark:text-slate-400">
          Além da landing principal, o site agora tem páginas públicas focadas em temas específicos de gestão financeira pessoal para melhorar relevância orgânica em buscas.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {topicLinks.map((topic) => (
            <Link
              key={topic.href}
              href={topic.href}
              className="rounded-xl border border-slate-300 bg-white p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{topic.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-slate-600 dark:text-slate-400">{topic.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicSiteShell>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-[#fffdf9] p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-[13px] leading-6 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 dark:border-slate-800">
      <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>
      <span className="text-right text-slate-600 dark:text-slate-400">{value}</span>
    </div>
  );
}

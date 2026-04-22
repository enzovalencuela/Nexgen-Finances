import { PublicTopicPage } from "@/components/public-topic-page";
import { buildPublicMetadata } from "@/lib/site";

export const metadata = buildPublicMetadata({
  title: "Fechamento mensal",
  description:
    "Fechamento mensal para revisar entradas, contas, cartões, pendências e investimentos com uma visão objetiva do mês.",
  path: "/fechamento-mensal"
});

export default function MonthlyClosingPage() {
  return (
    <PublicTopicPage
      eyebrow="Fechamento financeiro"
      title="Fechamento mensal para entender o mês sem perder tempo"
      description="O fechamento mensal é o momento de consolidar o que entrou, o que saiu, o que ficou pendente e qual foi a sobra real após contas, cartões e investimentos."
      highlights={["revisão mensal", "saldo", "pendências", "cartões", "investimentos"]}
      sections={[
        {
          title: "O fechamento mensal organiza o caos",
          paragraphs: [
            "Sem um fechamento mensal, as movimentações ficam espalhadas e o mês termina sem uma leitura clara do que aconteceu.",
            "Quando tudo é consolidado na mesma visão, a decisão financeira do próximo mês fica muito mais segura."
          ]
        },
        {
          title: "Pendências precisam atravessar o mês",
          paragraphs: [
            "Contas a pagar, valores a receber e faturas atrasadas não desaparecem quando o mês vira.",
            "Um bom fechamento mensal reaproveita essas pendências automaticamente para que a leitura continue fiel."
          ]
        },
        {
          title: "Cartões e investimentos entram no mesmo resumo",
          paragraphs: [
            "O fechamento não deve olhar apenas despesas diretas. Ele precisa incluir compras no cartão, pagamentos de fatura e posição de investimentos.",
            "Isso evita um resumo artificialmente bonito, mas desconectado da realidade."
          ]
        },
        {
          title: "A métrica mais importante é a sobra real",
          paragraphs: [
            "Ao final do fechamento mensal, o número que mais importa é a sobra efetiva depois de tudo que ainda pesa no orçamento.",
            "É essa sobra que orienta reserva, consumo, aporte e ajuste de gastos para o próximo ciclo."
          ]
        }
      ]}
    />
  );
}

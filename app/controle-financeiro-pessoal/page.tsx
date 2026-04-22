import { PublicTopicPage } from "@/components/public-topic-page";
import { buildPublicMetadata } from "@/lib/site";

export const metadata = buildPublicMetadata({
  title: "Controle financeiro pessoal",
  description:
    "Controle financeiro pessoal para organizar entradas, gastos, contas a pagar, valores a receber e sobra do mês com uma rotina simples.",
  path: "/controle-financeiro-pessoal"
});

export default function PersonalFinancePage() {
  return (
    <PublicTopicPage
      eyebrow="Organização financeira"
      title="Controle financeiro pessoal com visão clara do mês"
      description="Um bom controle financeiro pessoal depende de separar entradas, contas, pendências, cartões e investimentos em uma estrutura que faça sentido no dia a dia."
      highlights={["entradas", "gastos", "contas", "cartões", "investimentos"]}
      sections={[
        {
          title: "Comece pelo que entra e pelo que sai",
          paragraphs: [
            "O ponto mais importante do controle financeiro pessoal é registrar de forma simples as entradas recebidas e os gastos já pagos.",
            "Quando essa separação está clara, fica mais fácil enxergar o custo real do mês e a sobra disponível."
          ]
        },
        {
          title: "Não misture pendência com despesa paga",
          paragraphs: [
            "Contas a pagar e valores a receber precisam aparecer separados do que já foi concluído.",
            "Isso evita a falsa sensação de saldo livre e ajuda a priorizar o que realmente ainda está em aberto."
          ]
        },
        {
          title: "Cartões precisam de acompanhamento próprio",
          paragraphs: [
            "Compras no cartão, parcelas futuras, pagamentos de fatura e atrasos precisam continuar visíveis entre os meses.",
            "Sem isso, o controle financeiro pessoal perde precisão justamente onde muita gente mais se confunde."
          ]
        },
        {
          title: "Feche o mês olhando a sobra real",
          paragraphs: [
            "No fim do ciclo, o ideal é enxergar o que sobrou em dinheiro, no digital e o que foi direcionado para investimentos.",
            "Essa leitura transforma o acompanhamento mensal em uma rotina prática, e não em uma planilha esquecida."
          ]
        }
      ]}
    />
  );
}

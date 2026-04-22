import { PublicTopicPage } from "@/components/public-topic-page";
import { buildPublicMetadata } from "@/lib/site";

export const metadata = buildPublicMetadata({
  title: "Controle de investimentos",
  description:
    "Controle de investimentos para consolidar posição mensal, acompanhar valores aplicados e integrar aportes ao fechamento financeiro.",
  path: "/controle-de-investimentos"
});

export default function InvestmentsControlPage() {
  return (
    <PublicTopicPage
      eyebrow="Investimentos pessoais"
      title="Controle de investimentos integrado ao fechamento financeiro"
      description="Acompanhar investimentos junto do restante da vida financeira ajuda a entender quanto foi acumulado, quanto saiu da renda do mês e qual é a posição consolidada."
      highlights={["aportes", "posição mensal", "reais", "dólar", "fechamento"]}
      sections={[
        {
          title: "Investimento não deve ficar isolado da vida real",
          paragraphs: [
            "Quando o controle de investimentos fica separado do orçamento, perde-se a visão de quanto realmente foi destinado para acumulação.",
            "Integrar investimentos ao fechamento mensal torna a análise mais concreta."
          ]
        },
        {
          title: "Acompanhe posição e movimentação",
          paragraphs: [
            "Além do valor total investido, é útil manter o registro de instituição, tipo de ativo, quantidade e referência do mês.",
            "Isso cria uma trilha simples para revisar evolução da carteira ao longo do tempo."
          ]
        },
        {
          title: "Reinvestimento, retirada e saldo precisam conversar",
          paragraphs: [
            "Um bom controle de investimentos mostra tanto os aportes quanto retiradas feitas para cobrir despesas ou reorganizar caixa.",
            "Sem isso, o fechamento mensal perde parte importante da história financeira."
          ]
        },
        {
          title: "O objetivo é clareza, não complexidade",
          paragraphs: [
            "Para muita gente, o melhor sistema não é o mais sofisticado, e sim o que permite revisar posição e contexto do mês em poucos minutos.",
            "Essa clareza aumenta consistência e reduz abandono do controle ao longo do tempo."
          ]
        }
      ]}
    />
  );
}

import { PublicTopicPage } from "@/components/public-topic-page";
import { buildPublicMetadata } from "@/lib/site";

export const metadata = buildPublicMetadata({
  title: "Controle de cartões",
  description:
    "Controle de cartões para acompanhar compras, parcelas, faturas, pagamentos e atrasos sem perder o histórico entre os meses.",
  path: "/controle-de-cartoes"
});

export default function CreditCardsControlPage() {
  return (
    <PublicTopicPage
      eyebrow="Cartões e faturas"
      title="Controle de cartões com compras, parcelas e faturas organizadas"
      description="Controlar cartões exige acompanhar o que já foi comprado, o que ainda vai cair na fatura e o que continua em aberto depois do vencimento."
      highlights={["compras no cartão", "parcelas", "faturas", "pagamentos", "atrasos"]}
      sections={[
        {
          title: "Compra não é igual a pagamento de fatura",
          paragraphs: [
            "No controle de cartões, a compra cria a dívida e o pagamento de fatura reduz o total em aberto.",
            "Misturar essas duas coisas gera leitura errada do orçamento e dificulta saber o que ainda falta pagar."
          ]
        },
        {
          title: "Parcelas precisam aparecer nos meses futuros",
          paragraphs: [
            "Uma compra parcelada precisa continuar visível nos próximos meses até o fim do ciclo.",
            "Esse é um dos pontos centrais para um controle de cartões realmente confiável."
          ]
        },
        {
          title: "Atrasos e faturas pendentes não podem sumir",
          paragraphs: [
            "Se uma fatura não foi quitada, ela ainda pesa no mês seguinte e precisa continuar no radar.",
            "O acompanhamento correto evita que valores em atraso fiquem escondidos no histórico."
          ]
        },
        {
          title: "Cada cartão precisa ter sua própria leitura",
          paragraphs: [
            "Separar as faturas por cartão ajuda a localizar com rapidez onde está o maior peso do mês.",
            "Isso também facilita revisar hábito de compra, parcelamento e concentração de despesas."
          ]
        }
      ]}
    />
  );
}

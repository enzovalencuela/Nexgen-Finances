-- Limpa a importacao anterior de fevereiro/2026 e reinsere os dados
-- no formato mais fiel ao fechamento manual.
--
-- Usuario alvo: esilvavalencuela@gmail.com
-- Execute no Supabase SQL Editor.
--
-- Inconsistencias do texto original resolvidas assim:
-- 1. A PAGAR > OUTROS mostra 1880,00 na linha, 1800,00 no total, mas o total geral mostra 227,87 + 1880,00.
--    Foi usado 1880,00.
-- 2. TOTAL GASTO mostra 930,16, mas os itens e as classificacoes somam 934,16.
--    Foi usado 934,16, pois bate com a soma detalhada e com as classificacoes.

BEGIN;

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
DELETE FROM "Transaction"
WHERE "userId" IN (SELECT "id" FROM target_user)
  AND (
    "id" LIKE 'feb26-%'
    OR (
      "transactionDate" >= TIMESTAMP '2026-02-01 00:00:00'
      AND "transactionDate" < TIMESTAMP '2026-03-01 00:00:00'
      AND COALESCE("source", '') IN ('Entradas', 'Cartao', 'Contas Nicoli', 'Investimentos', 'Pai', 'Nicoli', 'Outros')
    )
  );

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
DELETE FROM "Investment"
WHERE "userId" IN (SELECT "id" FROM target_user)
  AND (
    "id" LIKE 'feb26-inv-%'
    OR (
      "referenceDate" >= TIMESTAMP '2026-02-01 00:00:00'
      AND "referenceDate" < TIMESTAMP '2026-03-01 00:00:00'
      AND COALESCE("name", '') IN (
        'CDB Liquidez Diaria',
        'CDB Mais Credito',
        'LCI PRE 180 DIAS',
        'INTER CONSERVADOR PLUS FIRF LP',
        'TD INTER 60 DIAS',
        'Mercado Bitcoin',
        'Binance'
      )
    )
  );

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
DELETE FROM "Summary"
WHERE "userId" IN (SELECT "id" FROM target_user)
  AND "monthReference" = DATE '2026-02-01';

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
DELETE FROM "CreditCard"
WHERE "userId" IN (SELECT "id" FROM target_user)
  AND "id" = 'manual-cc-feb-2026';

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
INSERT INTO "CreditCard" (
  "id", "userId", "name", "brand", "note", "createdAt", "updatedAt"
)
SELECT
  'manual-cc-feb-2026',
  target_user."id",
  'Cartao',
  NULL,
  'Cartao principal do fechamento manual de fevereiro/2026.',
  NOW(),
  NOW()
FROM target_user;

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
INSERT INTO "Transaction" (
  "id", "userId", "title", "description", "type", "category", "amount", "transactionDate", "status", "source", "isCreditCard", "installmentCurrent", "installmentTotal", "creditCardId", "createdAt", "updatedAt"
)
SELECT
  source_data."id",
  target_user."id",
  source_data."title",
  source_data."description",
  source_data."type"::"TransactionType",
  source_data."category"::"TransactionCategory",
  source_data."amount",
  source_data."transactionDate",
  source_data."status"::"TransactionStatus",
  source_data."source",
  source_data."isCreditCard",
  source_data."installmentCurrent",
  source_data."installmentTotal",
  source_data."creditCardId",
  source_data."createdAt",
  source_data."updatedAt"
FROM (
  VALUES
    ('feb26-entry-1', 'Saldo do mes passado', 'Entrada vinda do fechamento de janeiro.', 'INCOME', 'OTHER', 228.40, TIMESTAMP '2026-02-01 09:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-2', 'Nicoli', 'Entrada em 01/02.', 'INCOME', 'OTHER', 68.50, TIMESTAMP '2026-02-01 10:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-3', 'Mae', 'Entrada em 08/02.', 'INCOME', 'OTHER', 50.00, TIMESTAMP '2026-02-08 10:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-4', 'Tato', 'Entrada em 09/02.', 'INCOME', 'OTHER', 100.00, TIMESTAMP '2026-02-09 09:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-5', 'Salario', 'Salario em 09/02.', 'INCOME', 'OTHER', 200.00, TIMESTAMP '2026-02-09 09:30:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-6', 'Mae', 'Entrada em 12/02.', 'INCOME', 'OTHER', 30.00, TIMESTAMP '2026-02-12 12:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-7', 'Investimentos', 'Entrada em 14/02.', 'INCOME', 'OTHER', 30.00, TIMESTAMP '2026-02-14 12:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-8', 'Wilgner', 'Entrada em 14/02.', 'INCOME', 'OTHER', 10.00, TIMESTAMP '2026-02-14 14:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-9', 'Pietro', 'Entrada em 17/02.', 'INCOME', 'OTHER', 31.00, TIMESTAMP '2026-02-17 09:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-10', 'Thiago', 'Entrada em 17/02.', 'INCOME', 'OTHER', 45.00, TIMESTAMP '2026-02-17 09:30:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-11', 'Edvandro', 'Entrada em 17/02.', 'INCOME', 'OTHER', 17.00, TIMESTAMP '2026-02-17 10:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-12', 'Investimentos', 'Entrada em 17/02.', 'INCOME', 'OTHER', 50.00, TIMESTAMP '2026-02-17 11:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-13', 'Mae', 'Entrada em 17/02.', 'INCOME', 'OTHER', 30.00, TIMESTAMP '2026-02-17 12:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-14', 'Mae', 'Entrada em 24/02.', 'INCOME', 'OTHER', 50.00, TIMESTAMP '2026-02-24 10:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-15', 'Salario', 'Salario em 24/02.', 'INCOME', 'OTHER', 150.00, TIMESTAMP '2026-02-24 10:30:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-entry-16', 'Nicoli', 'Entrada em 28/02.', 'INCOME', 'OTHER', 194.15, TIMESTAMP '2026-02-28 18:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),

    ('feb26-pay-1', 'Canva', 'Referencia original: 10/03. Parcela 6/12.', 'BILL', 'UTILITIES', 24.16, TIMESTAMP '2026-02-10 09:00:00', 'PENDING', 'Cartao', TRUE, 6, 12, 'manual-cc-feb-2026', NOW(), NOW()),
    ('feb26-pay-2', 'FF', 'Lancamento pendente em 10/02.', 'BILL', 'LEISURE', 36.29, TIMESTAMP '2026-02-10 10:00:00', 'PENDING', 'Cartao', TRUE, NULL, NULL, 'manual-cc-feb-2026', NOW(), NOW()),
    ('feb26-pay-3', 'Contas Dezembro', 'Contas Nicoli.', 'BILL', 'NECESSARY', 105.01, TIMESTAMP '2026-02-01 10:30:00', 'PENDING', 'Contas Nicoli', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-pay-4', 'Contas Janeiro', 'Contas Nicoli.', 'BILL', 'NECESSARY', 62.41, TIMESTAMP '2026-02-28 10:00:00', 'PENDING', 'Contas Nicoli', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-pay-5', 'Investimentos', 'Valor planejado em aberto.', 'BILL', 'INVESTMENT', 1880.00, TIMESTAMP '2026-02-28 18:30:00', 'PENDING', 'Investimentos', FALSE, NULL, NULL, NULL, NOW(), NOW()),

    ('feb26-rec-1', 'Pai', 'Valor a receber no fechamento.', 'INCOME', 'OTHER', 39.90, TIMESTAMP '2026-02-28 19:00:00', 'PENDING', 'Pai', FALSE, NULL, NULL, NULL, NOW(), NOW()),

    ('feb26-exp-1', 'Cartao', 'Compra em 01/02.', 'EXPENSE', 'NECESSARY', 23.06, TIMESTAMP '2026-02-01 11:00:00', 'PAID', 'Cartao', TRUE, NULL, NULL, 'manual-cc-feb-2026', NOW(), NOW()),
    ('feb26-exp-2', 'Cartao', 'Compra em 08/02.', 'EXPENSE', 'NECESSARY', 10.00, TIMESTAMP '2026-02-08 11:00:00', 'PAID', 'Cartao', TRUE, NULL, NULL, 'manual-cc-feb-2026', NOW(), NOW()),
    ('feb26-exp-3', 'Cartao', 'Compra em 08/02.', 'EXPENSE', 'NECESSARY', 5.00, TIMESTAMP '2026-02-08 11:30:00', 'PAID', 'Cartao', TRUE, NULL, NULL, 'manual-cc-feb-2026', NOW(), NOW()),
    ('feb26-exp-4', 'Cartao', 'Compra em 10/02.', 'EXPENSE', 'NECESSARY', 38.52, TIMESTAMP '2026-02-10 11:00:00', 'PAID', 'Cartao', TRUE, NULL, NULL, 'manual-cc-feb-2026', NOW(), NOW()),
    ('feb26-exp-5', 'Contas', 'Contas Nicoli em 01/02.', 'EXPENSE', 'NECESSARY', 68.50, TIMESTAMP '2026-02-01 12:00:00', 'PAID', 'Contas Nicoli', FALSE, NULL, NULL, NULL, NOW(), NOW()),

    ('feb26-exp-6', 'FF', 'Compra em 01/02.', 'EXPENSE', 'LEISURE', 4.49, TIMESTAMP '2026-02-01 13:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-7', '99', 'Corrida em 02/02.', 'EXPENSE', 'NECESSARY', 80.00, TIMESTAMP '2026-02-02 08:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-8', 'Recarga', 'Recarga em 02/02.', 'EXPENSE', 'NECESSARY', 20.00, TIMESTAMP '2026-02-02 10:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-9', '99', 'Corrida em 03/02.', 'EXPENSE', 'NECESSARY', 15.50, TIMESTAMP '2026-02-03 08:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-10', 'Giftcard', 'Compra em 08/02.', 'EXPENSE', 'LEISURE', 20.99, TIMESTAMP '2026-02-08 13:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-11', 'Recarga', 'Recarga em 09/02.', 'EXPENSE', 'NECESSARY', 20.00, TIMESTAMP '2026-02-09 13:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-12', 'Mae', 'Valor pago em 09/02.', 'EXPENSE', 'NECESSARY', 100.00, TIMESTAMP '2026-02-09 14:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-13', 'Ifood', 'Compra em 09/02.', 'EXPENSE', 'LEISURE', 0.90, TIMESTAMP '2026-02-09 20:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-14', '99', 'Corrida em 10/02.', 'EXPENSE', 'NECESSARY', 50.00, TIMESTAMP '2026-02-10 08:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-15', 'Carregador', 'Compra em 10/02.', 'EXPENSE', 'OTHER', 125.00, TIMESTAMP '2026-02-10 14:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-16', 'FF', 'Compra em 10/02.', 'EXPENSE', 'LEISURE', 20.99, TIMESTAMP '2026-02-10 15:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-17', 'FF', 'Compra em 10/02.', 'EXPENSE', 'LEISURE', 4.49, TIMESTAMP '2026-02-10 15:30:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-18', 'Oleo 2T Tupi', 'Compra em 12/02.', 'EXPENSE', 'NECESSARY', 10.00, TIMESTAMP '2026-02-12 09:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-19', 'Gasolina Tupi', 'Compra em 12/02.', 'EXPENSE', 'NECESSARY', 12.91, TIMESTAMP '2026-02-12 09:30:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-20', 'Fio da Rocadeira', 'Compra em 12/02.', 'EXPENSE', 'NECESSARY', 7.00, TIMESTAMP '2026-02-12 10:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-21', 'Hotmart', 'Compra em 12/02.', 'EXPENSE', 'OTHER', 4.99, TIMESTAMP '2026-02-12 11:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-22', 'Wilgner Ajuda', 'Ajuda em 12/02.', 'EXPENSE', 'NECESSARY', 20.00, TIMESTAMP '2026-02-12 12:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-23', 'Bobeira', 'Compra em 12/02.', 'EXPENSE', 'LEISURE', 19.50, TIMESTAMP '2026-02-12 18:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-24', 'Bobeira', 'Compra em 14/02.', 'EXPENSE', 'LEISURE', 30.50, TIMESTAMP '2026-02-14 18:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-25', 'Pescaria', 'Compra em 17/02.', 'EXPENSE', 'LEISURE', 195.00, TIMESTAMP '2026-02-17 18:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('feb26-exp-26', 'Ifood', 'Compra em 27/02.', 'EXPENSE', 'LEISURE', 26.82, TIMESTAMP '2026-02-27 21:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW())
) AS source_data(
  "id", "title", "description", "type", "category", "amount", "transactionDate", "status", "source", "isCreditCard", "installmentCurrent", "installmentTotal", "creditCardId", "createdAt", "updatedAt"
)
CROSS JOIN target_user;

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
INSERT INTO "Investment" (
  "id", "userId", "name", "assetType", "institution", "amountBRL", "amountUSD", "referenceDate", "notes", "createdAt", "updatedAt"
)
SELECT
  source_data."id",
  target_user."id",
  source_data."name",
  source_data."assetType"::"AssetType",
  source_data."institution",
  source_data."amountBRL",
  source_data."amountUSD",
  source_data."referenceDate",
  source_data."notes",
  source_data."createdAt",
  source_data."updatedAt"
FROM (
  VALUES
    ('feb26-inv-1', 'CDB Liquidez Diaria', 'CDB', NULL, 0.00, NULL, TIMESTAMP '2026-02-28 20:00:00', NULL, NOW(), NOW()),
    ('feb26-inv-2', 'CDB Mais Credito', 'CDB', NULL, 10.00, NULL, TIMESTAMP '2026-02-28 20:00:00', NULL, NOW(), NOW()),
    ('feb26-inv-3', 'LCI PRE 180 DIAS', 'LCI', NULL, 50.00, NULL, TIMESTAMP '2026-02-28 20:00:00', NULL, NOW(), NOW()),
    ('feb26-inv-4', 'INTER CONSERVADOR PLUS FIRF LP', 'FUND', 'Banco Inter', 100.00, NULL, TIMESTAMP '2026-02-28 20:00:00', NULL, NOW(), NOW()),
    ('feb26-inv-5', 'TD INTER 60 DIAS', 'OTHER', 'Banco Inter', 0.00, 10.00, TIMESTAMP '2026-02-28 20:00:00', 'Posicao em USD.', NOW(), NOW()),
    ('feb26-inv-6', 'Mercado Bitcoin', 'CRYPTO', 'MB', 40.00, NULL, TIMESTAMP '2026-02-28 20:00:00', 'Valor aproximado.', NOW(), NOW()),
    ('feb26-inv-7', 'Binance', 'CRYPTO', 'Binance', 30.00, NULL, TIMESTAMP '2026-02-28 20:00:00', 'Valor aproximado.', NOW(), NOW())
) AS source_data(
  "id", "name", "assetType", "institution", "amountBRL", "amountUSD", "referenceDate", "notes", "createdAt", "updatedAt"
)
CROSS JOIN target_user;

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
INSERT INTO "Summary" (
  "id", "userId", "monthReference", "cashBalance", "digitalBalance", "note", "createdAt", "updatedAt"
)
SELECT
  'feb26-summary',
  target_user."id",
  DATE '2026-02-01',
  7.00,
  372.30,
  '{"salaryBase":500,"purchaseEstimate":0,"investmentWithdrawn":1880,"noteText":"Fechamento importado do documento manual de fevereiro/2026."}',
  NOW(),
  NOW()
FROM target_user;

COMMIT;

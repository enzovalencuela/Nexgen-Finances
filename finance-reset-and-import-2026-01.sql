-- Limpa a importacao anterior de janeiro/2026 e reinsere os dados
-- no formato mais fiel ao seu fechamento manual.
--
-- Usuario alvo: esilvavalencuela@gmail.com
-- Execute no Supabase SQL Editor.

BEGIN;

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
DELETE FROM "Transaction"
WHERE "userId" IN (SELECT "id" FROM target_user)
  AND (
    "id" LIKE 'txn-2026-01-%'
    OR "id" LIKE 'jan26-%'
    OR (
      "transactionDate" >= TIMESTAMP '2026-01-01 00:00:00'
      AND "transactionDate" < TIMESTAMP '2026-02-01 00:00:00'
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
    "id" LIKE 'jan26-inv-%'
    OR (
      "referenceDate" >= TIMESTAMP '2026-01-01 00:00:00'
      AND "referenceDate" < TIMESTAMP '2026-02-01 00:00:00'
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
  AND "monthReference" = DATE '2026-01-01';

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
)
DELETE FROM "CreditCard"
WHERE "userId" IN (SELECT "id" FROM target_user)
  AND "id" IN ('manual-cc-2026-01-principal', 'manual-cc-jan-2026');

WITH target_user AS (
  SELECT "id"
  FROM "User"
  WHERE "email" = 'esilvavalencuela@gmail.com'
), upsert_card AS (
  INSERT INTO "CreditCard" (
    "id", "userId", "name", "brand", "note", "createdAt", "updatedAt"
  )
  SELECT
    'manual-cc-jan-2026',
    target_user."id",
    'Cartao',
    NULL,
    'Cartao principal do fechamento manual de janeiro/2026.',
    NOW(),
    NOW()
  FROM target_user
  ON CONFLICT ("id") DO UPDATE
  SET
    "name" = EXCLUDED."name",
    "note" = EXCLUDED."note",
    "updatedAt" = NOW()
  RETURNING "id"
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
    ('jan26-entry-1', 'Saldo do mes passado', 'Entrada vinda do mes anterior.', 'INCOME', 'OTHER', 119.89, TIMESTAMP '2026-01-01 09:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-entry-2', 'Salario', 'Salario 12/01.', 'INCOME', 'OTHER', 250.00, TIMESTAMP '2026-01-12 09:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-entry-3', 'Mae', 'Entrada em 13/01.', 'INCOME', 'OTHER', 50.00, TIMESTAMP '2026-01-13 12:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-entry-4', 'Investimentos', 'Entrada em 13/01.', 'INCOME', 'OTHER', 100.00, TIMESTAMP '2026-01-13 14:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-entry-5', 'Salario', 'Salario 30/01.', 'INCOME', 'OTHER', 300.00, TIMESTAMP '2026-01-30 09:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-entry-6', 'Sushi', 'Valor recebido em 30/01.', 'INCOME', 'OTHER', 87.80, TIMESTAMP '2026-01-30 20:00:00', 'PAID', 'Entradas', FALSE, NULL, NULL, NULL, NOW(), NOW()),

    ('jan26-pay-1', 'Canva', 'Referencia original: 10/09. Parcela 5/12.', 'BILL', 'UTILITIES', 24.16, TIMESTAMP '2026-01-10 09:00:00', 'PENDING', 'Cartao', TRUE, 5, 12, 'manual-cc-jan-2026', NOW(), NOW()),
    ('jan26-pay-2', 'Com. Tech', 'Compra em 12/01.', 'BILL', 'OTHER', 4.99, TIMESTAMP '2026-01-12 10:00:00', 'PENDING', 'Cartao', TRUE, NULL, NULL, 'manual-cc-jan-2026', NOW(), NOW()),
    ('jan26-pay-3', 'Contas Dezembro', 'Contas Nicoli.', 'BILL', 'NECESSARY', 173.60, TIMESTAMP '2026-01-01 10:00:00', 'PENDING', 'Contas Nicoli', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-pay-4', 'Contas Janeiro', 'Contas Nicoli.', 'BILL', 'NECESSARY', 62.41, TIMESTAMP '2026-01-31 10:00:00', 'PENDING', 'Contas Nicoli', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-pay-5', 'Investimentos', 'Valor planejado em aberto.', 'BILL', 'INVESTMENT', 1800.00, TIMESTAMP '2026-01-31 18:00:00', 'PENDING', 'Investimentos', FALSE, NULL, NULL, NULL, NOW(), NOW()),

    ('jan26-rec-1', 'Pai', 'Valor a receber no fechamento.', 'INCOME', 'OTHER', 189.90, TIMESTAMP '2026-01-31 19:00:00', 'PENDING', 'Pai', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-rec-2', 'Mercado', 'Valor a receber da Nicoli em 30/01.', 'INCOME', 'OTHER', 68.50, TIMESTAMP '2026-01-30 19:00:00', 'PENDING', 'Nicoli', FALSE, NULL, NULL, NULL, NOW(), NOW()),

    ('jan26-exp-1', 'Cartao', 'Compra em 25/01.', 'EXPENSE', 'NECESSARY', 20.00, TIMESTAMP '2026-01-25 12:00:00', 'PAID', 'Cartao', TRUE, NULL, NULL, 'manual-cc-jan-2026', NOW(), NOW()),
    ('jan26-exp-2', 'Contas', 'Contas Nicoli em 12/01.', 'EXPENSE', 'NECESSARY', 100.00, TIMESTAMP '2026-01-12 11:00:00', 'PAID', 'Contas Nicoli', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-exp-3', 'Lanche Pos Pedal', 'Lanche em 08/01.', 'EXPENSE', 'NECESSARY', 26.00, TIMESTAMP '2026-01-08 19:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-exp-4', 'Recarga', 'Recarga em 13/01.', 'EXPENSE', 'NECESSARY', 20.00, TIMESTAMP '2026-01-13 09:30:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-exp-5', 'Chaveiro', 'Chaveiro em 13/01.', 'EXPENSE', 'NECESSARY', 250.00, TIMESTAMP '2026-01-13 10:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-exp-6', '99', 'Corrida em 13/01.', 'EXPENSE', 'LEISURE', 19.70, TIMESTAMP '2026-01-13 21:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-exp-7', '99', 'Corrida em 14/01.', 'EXPENSE', 'LEISURE', 18.30, TIMESTAMP '2026-01-14 09:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-exp-8', 'Mercado', 'Compra em 30/01.', 'EXPENSE', 'NECESSARY', 137.19, TIMESTAMP '2026-01-30 18:00:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    ('jan26-exp-9', 'Sushi', 'Compra em 30/01.', 'EXPENSE', 'LEISURE', 87.80, TIMESTAMP '2026-01-30 20:30:00', 'PAID', 'Outros', FALSE, NULL, NULL, NULL, NOW(), NOW())
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
    ('jan26-inv-1', 'CDB Liquidez Diaria', 'CDB', NULL, 30.00, NULL, TIMESTAMP '2026-01-31 20:00:00', NULL, NOW(), NOW()),
    ('jan26-inv-2', 'CDB Mais Credito', 'CDB', NULL, 60.00, NULL, TIMESTAMP '2026-01-31 20:00:00', NULL, NOW(), NOW()),
    ('jan26-inv-3', 'LCI PRE 180 DIAS', 'LCI', NULL, 50.00, NULL, TIMESTAMP '2026-01-31 20:00:00', NULL, NOW(), NOW()),
    ('jan26-inv-4', 'INTER CONSERVADOR PLUS FIRF LP', 'FUND', 'Banco Inter', 100.00, NULL, TIMESTAMP '2026-01-31 20:00:00', NULL, NOW(), NOW()),
    ('jan26-inv-5', 'TD INTER 60 DIAS', 'OTHER', 'Banco Inter', 0.00, 10.00, TIMESTAMP '2026-01-31 20:00:00', 'Posicao em USD.', NOW(), NOW()),
    ('jan26-inv-6', 'Mercado Bitcoin', 'CRYPTO', 'MB', 40.00, NULL, TIMESTAMP '2026-01-31 20:00:00', 'Valor aproximado.', NOW(), NOW()),
    ('jan26-inv-7', 'Binance', 'CRYPTO', 'Binance', 30.00, NULL, TIMESTAMP '2026-01-31 20:00:00', 'Valor aproximado.', NOW(), NOW())
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
  'jan26-summary',
  target_user."id",
  DATE '2026-01-01',
  57.00,
  171.40,
  '{"salaryBase":500,"purchaseEstimate":0,"investmentWithdrawn":1550,"noteText":"Fechamento importado do documento manual de janeiro/2026."}',
  NOW(),
  NOW()
FROM target_user;

COMMIT;

export type SummaryMeta = {
  salaryBase: number;
  purchaseEstimate: number;
  investmentWithdrawn: number;
  noteText: string;
};

export const defaultSummaryMeta: SummaryMeta = {
  salaryBase: 0,
  purchaseEstimate: 0,
  investmentWithdrawn: 0,
  noteText: ""
};

export function parseSummaryMeta(note?: string | null): SummaryMeta {
  if (!note) {
    return defaultSummaryMeta;
  }

  try {
    const parsed = JSON.parse(note) as Partial<SummaryMeta>;

    return {
      salaryBase: Number(parsed.salaryBase ?? 0),
      purchaseEstimate: Number(parsed.purchaseEstimate ?? 0),
      investmentWithdrawn: Number(parsed.investmentWithdrawn ?? 0),
      noteText: typeof parsed.noteText === "string" ? parsed.noteText : ""
    };
  } catch {
    return {
      ...defaultSummaryMeta,
      noteText: note
    };
  }
}

export function stringifySummaryMeta(meta: Partial<SummaryMeta>) {
  const normalized: SummaryMeta = {
    salaryBase: Number(meta.salaryBase ?? 0),
    purchaseEstimate: Number(meta.purchaseEstimate ?? 0),
    investmentWithdrawn: Number(meta.investmentWithdrawn ?? 0),
    noteText: meta.noteText?.trim() ?? ""
  };

  const hasContent =
    normalized.salaryBase !== 0 ||
    normalized.purchaseEstimate !== 0 ||
    normalized.investmentWithdrawn !== 0 ||
    normalized.noteText.length > 0;

  return hasContent ? JSON.stringify(normalized) : null;
}

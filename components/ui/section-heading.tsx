type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.28em] text-violet-700">{eyebrow}</p>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-[13px] leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

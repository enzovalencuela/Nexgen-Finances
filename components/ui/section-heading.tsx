type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent/80">{eyebrow}</p>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-[13px] leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}

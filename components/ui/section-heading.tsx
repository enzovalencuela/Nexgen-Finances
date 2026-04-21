type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-accent/80">{eyebrow}</p>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  summaryRight?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export function CollapsibleBox({ title, summaryRight, className, contentClassName, children }: Props) {
  return (
    <details className={cn("group", className)}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <h2 className="text-[1rem] font-bold uppercase text-slate-900 dark:text-slate-100">{title}:</h2>
          {summaryRight ? <div className="mt-1">{summaryRight}</div> : null}
        </div>
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition group-open:rotate-180 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>

      <div className={cn("mt-3", contentClassName)}>{children}</div>
    </details>
  );
}

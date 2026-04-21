import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-300/70 bg-[#fffdf9] p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950",
        className
      )}
      {...props}
    />
  );
}

import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white",
        className
      )}
      {...props}
    />
  );
}

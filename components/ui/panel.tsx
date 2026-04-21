import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#171b21] p-4 shadow-none",
        className
      )}
      {...props}
    />
  );
}

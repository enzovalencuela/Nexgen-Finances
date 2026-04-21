import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-panel/85 p-5 shadow-glow backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}

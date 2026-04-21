import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder:text-muted",
        className
      )}
      {...props}
    />
  );
}

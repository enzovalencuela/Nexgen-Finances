import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-violet-600 text-white hover:bg-violet-700",
        variant === "secondary" && "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
        variant === "ghost" && "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
        className
      )}
      {...props}
    />
  );
}

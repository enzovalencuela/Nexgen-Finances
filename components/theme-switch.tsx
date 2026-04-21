"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeSwitch() {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[13px] transition",
        "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      )}
      aria-label="Alternar tema claro e escuro"
      aria-pressed={isDark}
      disabled={!mounted}
    >
      <span className="inline-flex items-center gap-2">
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {mounted ? (isDark ? "Modo escuro" : "Modo claro") : "Tema"}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition",
          isDark ? "bg-violet-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
            isDark ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

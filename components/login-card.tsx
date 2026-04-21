import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export function LoginCard() {
  return (
    <Panel className="w-full max-w-md p-8">
      <div className="space-y-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Nexgen Finance</p>
          <h1 className="text-3xl font-semibold text-white">Controle financeiro com acesso seguro</h1>
          <p className="text-sm leading-6 text-muted">
            Login com Google via NextAuth, sessao persistida e dados separados por usuario.
          </p>
        </div>

        <Link
          href="/api/auth/signin/google?callbackUrl=/"
          className={cn(
            "inline-flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-accent/90"
          )}
        >
          Entrar com Google
        </Link>
      </div>
    </Panel>
  );
}

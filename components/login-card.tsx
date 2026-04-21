import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { signIn } from "@/lib/auth";

export function LoginCard() {
  return (
    <Panel className="w-full max-w-md p-7">
      <div className="space-y-6">
        <div className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-accent/20 bg-accent/10 text-accent">
          <Image src="/favicon.ico" alt="Nexgen Finance" width={36} height={36} className="h-9 w-9 rounded-lg" />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Nexgen Finance</p>
          <h1 className="text-[1.75rem] font-semibold text-white">Controle financeiro com acesso seguro</h1>
          <p className="text-[13px] leading-6 text-muted">
            Login com Google via NextAuth, sessão persistida e dados separados por usuário.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <Button type="submit" className="w-full">
            Entrar com Google
          </Button>
        </form>
      </div>
    </Panel>
  );
}

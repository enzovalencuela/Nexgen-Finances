import { redirect } from "next/navigation";

import { LoginCard } from "@/components/login-card";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <LoginCard />
    </main>
  );
}

import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  const prisma = getPrisma();

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.upsert({
    where: {
      email: session.user.email
    },
    update: {
      name: session.user.name,
      image: session.user.image
    },
    create: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    }
  });
}

export async function getRequiredCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return user;
}

import { cookies } from "next/headers";

import { prisma } from "@/infrastructure/db/prisma";

export type SessionUser = {
  email: string;
  name: string | null;
  role: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const email = (await cookies()).get("pmwa_email")?.value;
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, name: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) return null;
  return { email: user.email, name: user.name, role: user.role };
}

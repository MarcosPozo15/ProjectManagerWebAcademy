import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      role: email === "marcospoxo15@gmail.com" ? "ADMIN" : "USER",
    },
    select: { id: true },
  });

  const cookieStore = await cookies();
  cookieStore.set("pmwa_email", email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

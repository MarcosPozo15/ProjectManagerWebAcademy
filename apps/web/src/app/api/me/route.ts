import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";

export async function GET() {
  const email = (await cookies()).get("pmwa_email")?.value;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, name: true, role: true, timezone: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user });
}

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  timezone: z.string().min(2).optional(),
});

export async function PATCH(req: Request) {
  const email = (await cookies()).get("pmwa_email")?.value;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const user = await prisma.user.update({
    where: { email },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.timezone ? { timezone: parsed.data.timezone } : {}),
    },
    select: { email: true, name: true, role: true, timezone: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

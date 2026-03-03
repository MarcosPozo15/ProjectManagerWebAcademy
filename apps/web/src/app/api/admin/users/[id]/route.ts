import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/infrastructure/auth/require-role";
import { hashPassword } from "@/infrastructure/auth/password";
import { Prisma } from "@prisma/client";

const patchSchema = z.object({
  name: z.string().min(2).nullable().optional(),
  role: z.enum(["USER", "PROFESSOR", "ADMIN", "EDITOR"]).optional(),
  isActive: z.boolean().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data: Prisma.UserUpdateInput = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
  if (parsed.data.bio !== undefined) data.bio = parsed.data.bio;
  if (parsed.data.avatarUrl !== undefined) data.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.password !== undefined) data.passwordHash = hashPassword(parsed.data.password);

  await prisma.user.update({ where: { id }, data, select: { id: true } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  await prisma.user.update({ where: { id }, data: { isActive: false }, select: { id: true } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/infrastructure/auth/require-role";
import { hashPassword } from "@/infrastructure/auth/password";
import { Prisma } from "@prisma/client";

const querySchema = z.object({
  q: z.string().optional(),
  role: z.string().optional(),
  isActive: z.string().optional(),
  take: z.string().optional(),
  skip: z.string().optional(),
});

const roleSchema = z.enum(["USER", "PROFESSOR", "ADMIN", "EDITOR"]);

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const take = Math.min(Math.max(Number(parsed.data.take ?? 50) || 50, 1), 200);
  const skip = Math.max(Number(parsed.data.skip ?? 0) || 0, 0);

  const q = parsed.data.q?.trim();
  const role = parsed.data.role?.trim();
  const isActiveRaw = parsed.data.isActive?.trim();

  const where: Prisma.UserWhereInput = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }
  if (role && role !== "ALL") {
    const r = roleSchema.safeParse(role);
    if (r.success) where.role = r.data;
  }
  if (isActiveRaw === "true") where.isActive = true;
  if (isActiveRaw === "false") where.isActive = false;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            projectSubmissions: true,
            quizAttempts: true,
            progress: true,
          },
        },
        studentAssignments: {
          select: { teacher: { select: { id: true, email: true, name: true } } },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const users = items.map((u) => ({
    ...u,
    assignedTeacher: u.studentAssignments[0]?.teacher ?? null,
    studentAssignments: undefined,
  }));

  return NextResponse.json({ users, total });
}

const createSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["USER", "PROFESSOR", "ADMIN", "EDITOR"]).default("USER"),
  isActive: z.boolean().default(true),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      role: parsed.data.role,
      isActive: parsed.data.isActive,
      passwordHash: hashPassword(parsed.data.password),
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
}

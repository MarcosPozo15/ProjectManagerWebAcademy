import { NextResponse } from "next/server";

import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export async function POST(_req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId } = await ctx.params;

  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true, isActive: true } });
  if (!user || !user.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, moduleId: true } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const moduleRow = await prisma.module.findUnique({ where: { id: lesson.moduleId }, select: { id: true, learningPathId: true } });

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { completedAt: new Date() },
    create: {
      userId: user.id,
      lessonId,
      moduleId: moduleRow?.id,
      learningPathId: moduleRow?.learningPathId,
      completedAt: new Date(),
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId } = await ctx.params;

  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true, isActive: true } });
  if (!user || !user.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { completedAt: null },
    create: { userId: user.id, lessonId, completedAt: null },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}

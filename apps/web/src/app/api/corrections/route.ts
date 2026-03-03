import { NextResponse } from "next/server";

import { prisma } from "@/infrastructure/db/prisma";
import { requireProfessorOrAdmin } from "@/infrastructure/auth/require-role";

export async function GET() {
  const auth = await requireProfessorOrAdmin();
  if (auth.response) return auth.response;

  const me = await prisma.user.findUnique({
    where: { email: auth.user!.email },
    select: { id: true, role: true },
  });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = me.role === "ADMIN" ? {} : { teacherId: me.id };

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      submittedAt: true,
      comment: true,
      student: { select: { id: true, email: true, name: true } },
      exercise: {
        select: {
          id: true,
          title: true,
          lesson: { select: { slug: true, title: true, module: { select: { slug: true, learningPath: { select: { slug: true } } } } } },
        },
      },
      files: { select: { id: true, originalName: true, path: true, size: true, mimeType: true } },
      feedback: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { comment: true, score: true, createdAt: true, teacher: { select: { email: true, name: true } } },
      },
    },
  });

  return NextResponse.json({ submissions });
}

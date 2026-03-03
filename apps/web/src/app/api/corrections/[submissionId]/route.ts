import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";
import { requireProfessorOrAdmin } from "@/infrastructure/auth/require-role";

const schema = z.object({
  status: z.enum(["IN_REVIEW", "APPROVED", "NEEDS_CHANGES"]),
  comment: z.string().min(2),
  score: z.number().int().min(0).max(100).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ submissionId: string }> }) {
  const auth = await requireProfessorOrAdmin();
  if (auth.response) return auth.response;

  const { submissionId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const me = await prisma.user.findUnique({ where: { email: auth.user!.email }, select: { id: true, role: true } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, teacherId: true },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (me.role !== "ADMIN" && submission.teacherId !== me.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: parsed.data.status },
    select: { id: true },
  });

  await prisma.submissionFeedback.create({
    data: {
      submissionId,
      teacherId: me.id,
      comment: parsed.data.comment,
      score: parsed.data.score,
    },
    select: { id: true },
  });

  const student = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { studentId: true },
  });

  await prisma.event.create({
    data: {
      userId: me.id,
      name: "feedback_given",
      properties: { submissionId, status: parsed.data.status, score: parsed.data.score ?? null },
    },
    select: { id: true },
  });

  if (student) {
    await prisma.event.create({
      data: {
        userId: student.studentId,
        name: "feedback_received",
        properties: { submissionId, status: parsed.data.status, score: parsed.data.score ?? null },
      },
      select: { id: true },
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

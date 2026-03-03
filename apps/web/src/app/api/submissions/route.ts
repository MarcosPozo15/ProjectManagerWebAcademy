import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";
import { storeSubmissionFile } from "@/infrastructure/storage/local-submissions";

const createSchema = z.object({
  exerciseId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const form = await req.formData();
  const exerciseId = String(form.get("exerciseId") ?? "");
  const comment = (form.get("comment") ? String(form.get("comment")) : undefined) ?? undefined;

  const parsed = createSchema.safeParse({ exerciseId });
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "USER") {
    return NextResponse.json({ error: "Only USER can submit exercises" }, { status: 403 });
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true, lessonId: true },
  });
  if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

  const assignment = await prisma.teacherStudentAssignment.findFirst({
    where: { studentId: user.id },
    select: { teacherId: true },
  });

  const files = form.getAll("files").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Attach at least one file" }, { status: 400 });
  }

  const submission = await prisma.submission.upsert({
    where: { exerciseId_studentId: { exerciseId: exercise.id, studentId: user.id } },
    update: {
      comment,
      status: "SUBMITTED",
      teacherId: assignment?.teacherId ?? null,
      submittedAt: new Date(),
    },
    create: {
      exerciseId: exercise.id,
      studentId: user.id,
      teacherId: assignment?.teacherId ?? null,
      status: "SUBMITTED",
      comment,
    },
    select: { id: true },
  });

  await prisma.submissionFile.deleteMany({ where: { submissionId: submission.id } });

  for (const f of files) {
    const stored = await storeSubmissionFile({ submissionId: submission.id, file: f });
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        originalName: stored.originalName,
        storedName: stored.storedName,
        mimeType: stored.mimeType,
        size: stored.size,
        path: stored.relativePath,
      },
      select: { id: true },
    });
  }

  return NextResponse.json({ ok: true, submissionId: submission.id }, { status: 201 });
}

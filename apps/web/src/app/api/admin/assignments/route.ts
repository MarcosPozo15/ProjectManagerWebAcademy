import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/infrastructure/auth/require-role";

const schema = z.object({
  teacherId: z.string().min(1),
  studentId: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const teacher = await prisma.user.findUnique({
    where: { id: parsed.data.teacherId },
    select: { id: true, role: true, isActive: true },
  });
  const student = await prisma.user.findUnique({
    where: { id: parsed.data.studentId },
    select: { id: true, role: true, isActive: true },
  });

  if (!teacher || !teacher.isActive || teacher.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Teacher must be an active PROFESSOR" }, { status: 400 });
  }
  if (!student || !student.isActive || student.role !== "USER") {
    return NextResponse.json({ error: "Student must be an active USER" }, { status: 400 });
  }

  await prisma.teacherStudentAssignment.upsert({
    where: { teacherId_studentId: { teacherId: teacher.id, studentId: student.id } },
    update: {},
    create: { teacherId: teacher.id, studentId: student.id },
    select: { id: true },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const teacherId = url.searchParams.get("teacherId");
  const studentId = url.searchParams.get("studentId");
  if (!teacherId || !studentId) {
    return NextResponse.json({ error: "Missing teacherId/studentId" }, { status: 400 });
  }

  await prisma.teacherStudentAssignment.deleteMany({ where: { teacherId, studentId } });
  return NextResponse.json({ ok: true });
}

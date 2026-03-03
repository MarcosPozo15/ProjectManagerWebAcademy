import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export async function GET(_req: Request, ctx: { params: Promise<{ fileId: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await ctx.params;

  const me = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true, role: true } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = await prisma.submissionFile.findUnique({
    where: { id: fileId },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      path: true,
      submission: { select: { studentId: true, teacherId: true } },
    },
  });

  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed =
    me.role === "ADMIN" ||
    (me.role === "PROFESSOR" && file.submission.teacherId === me.id) ||
    (me.role === "USER" && file.submission.studentId === me.id);

  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const absolute = path.join(process.cwd(), file.path);
  const s = await stat(absolute).catch(() => null);
  if (!s) return NextResponse.json({ error: "File missing on disk" }, { status: 404 });

  const stream = createReadStream(absolute);

  return new NextResponse(stream as any, {
    headers: {
      "content-type": file.mimeType || "application/octet-stream",
      "content-disposition": `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    },
  });
}

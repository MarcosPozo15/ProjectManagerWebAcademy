import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

const schema = z.object({
  projectId: z.string().min(1),
  deliverableUrl: z.string().url().nullable().optional(),
  deliverableText: z.string().max(10000).nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true, isActive: true } });
  if (!user || !user.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId }, select: { id: true } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  await prisma.projectSubmission.upsert({
    where: { userId_projectId: { userId: user.id, projectId: project.id } },
    update: {
      deliverableUrl: parsed.data.deliverableUrl ?? null,
      deliverableText: parsed.data.deliverableText ?? null,
    },
    create: {
      userId: user.id,
      projectId: project.id,
      deliverableUrl: parsed.data.deliverableUrl ?? null,
      deliverableText: parsed.data.deliverableText ?? null,
    },
    select: { id: true },
  });

  await prisma.event.create({
    data: {
      userId: user.id,
      name: "project_submitted",
      properties: { projectId: project.id },
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

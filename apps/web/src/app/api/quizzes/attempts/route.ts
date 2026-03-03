import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

const schema = z.object({
  quizId: z.string().min(1),
  answers: z.record(z.string(), z.string()),
});

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true, isActive: true } });
  if (!user || !user.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId },
    select: {
      id: true,
      questions: { select: { id: true, answer: true, explanation: true } },
    },
  });

  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  let score = 0;
  const maxScore = quiz.questions.length;

  const perQuestion = quiz.questions.map((q) => {
    const given = (parsed.data.answers[q.id] ?? "").trim();
    const correct = (q.answer ?? "").trim();
    const ok = given.localeCompare(correct, undefined, { sensitivity: "accent" }) === 0;
    if (ok) score += 1;
    return { id: q.id, ok, correct, explanation: q.explanation };
  });

  await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId: quiz.id,
      answers: parsed.data.answers,
      score,
      maxScore,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, result: { score, maxScore, perQuestion } }, { status: 201 });
}

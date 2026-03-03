import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { QuizRunner } from "@/components/quizzes/quiz-runner";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ pathSlug: string; moduleSlug: string; quizSlug: string }>;
}) {
  const { pathSlug, moduleSlug, quizSlug } = await params;

  const path = await prisma.learningPath.findUnique({ where: { slug: pathSlug }, select: { id: true, slug: true, title: true } });
  if (!path) notFound();

  const module = await prisma.module.findFirst({
    where: { learningPathId: path.id, slug: moduleSlug },
    select: { id: true, slug: true, title: true },
  });
  if (!module) notFound();

  const quiz = await prisma.quiz.findFirst({
    where: { moduleId: module.id, slug: quizSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      questions: { orderBy: { order: "asc" }, select: { id: true, prompt: true, options: true, type: true } },
    },
  });

  if (!quiz) notFound();

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <Link className="underline underline-offset-4 hover:text-foreground" href="/quizzes">
          Quizzes
        </Link>
        {" / "}
        <span>{path.title}</span>
        {" / "}
        <span>{module.title}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizRunner quizId={quiz.id} questions={quiz.questions} />
        </CardContent>
      </Card>
    </div>
  );
}

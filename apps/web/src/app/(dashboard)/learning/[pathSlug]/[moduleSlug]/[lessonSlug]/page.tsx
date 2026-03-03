import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseSubmission } from "@/components/learning/exercise-submission";
import { LessonProgressToggle } from "@/components/learning/lesson-progress-toggle";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ pathSlug: string; moduleSlug: string; lessonSlug: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "USER") redirect("/dashboard");

  const { pathSlug, moduleSlug, lessonSlug } = await params;

  const path = await prisma.learningPath.findUnique({
    where: { slug: pathSlug },
    select: { id: true, slug: true, title: true },
  });

  if (!path) notFound();

  const moduleRow = await prisma.module.findFirst({
    where: { learningPathId: path.id, slug: moduleSlug },
    select: { id: true, slug: true, title: true },
  });

  if (!moduleRow) notFound();

  const lesson = await prisma.lesson.findFirst({
    where: { moduleId: moduleRow.id, slug: lessonSlug },
    select: {
      id: true,
      title: true,
      mdxContent: true,
      durationMin: true,
      difficulty: true,
      exercises: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          objective: true,
          instructions: true,
          rubric: true,
          requiredFiles: true,
          submissions: {
            where: { student: { email: session.email } },
            orderBy: { submittedAt: "desc" },
            take: 1,
            select: {
              id: true,
              status: true,
              submittedAt: true,
              comment: true,
              feedback: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { id: true, comment: true, score: true, createdAt: true, teacher: { select: { email: true, name: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) notFound();

  const me = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
  const progress = me
    ? await prisma.progress.findUnique({
        where: { userId_lessonId: { userId: me.id, lessonId: lesson.id } },
        select: { completedAt: true },
      })
    : null;
  const isCompleted = Boolean(progress?.completedAt);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <Link className="underline underline-offset-4 hover:text-foreground" href="/learning">
            Learning
          </Link>
          {" / "}
          <Link
            className="underline underline-offset-4 hover:text-foreground"
            href={`/learning/${path.slug}/${moduleRow.slug}`}
          >
            {moduleRow.title}
          </Link>
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground">
          {lesson.durationMin} min · {lesson.difficulty}
        </p>
        <div>
          <LessonProgressToggle lessonId={lesson.id} initialCompleted={isCompleted} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap">{lesson.mdxContent}</div>
          </div>
        </CardContent>
      </Card>

      {lesson.exercises.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ejercicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {lesson.exercises.map((ex) => (
              <div key={ex.id} className="space-y-3 rounded-md border p-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{ex.title}</div>
                    {ex.submissions[0]?.status ? <Badge variant="outline">{ex.submissions[0].status}</Badge> : null}
                    {ex.submissions[0]?.feedback?.[0]?.score != null ? (
                      <Badge variant="secondary">Nota: {ex.submissions[0].feedback[0].score}</Badge>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">Objetivo: {ex.objective}</div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{ex.instructions}</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">Rúbrica: {ex.rubric}</div>

                {ex.submissions[0]?.feedback?.[0] ? (
                  <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">Feedback del profesor</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ex.submissions[0].feedback[0].createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ex.submissions[0].feedback[0].teacher.name ?? ex.submissions[0].feedback[0].teacher.email}
                    </div>
                    <div className="whitespace-pre-wrap">{ex.submissions[0].feedback[0].comment}</div>
                  </div>
                ) : null}

                <ExerciseSubmission exerciseId={ex.id} requiredFiles={ex.requiredFiles} />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ pathSlug: string; moduleSlug: string }>;
}) {
  const { pathSlug, moduleSlug } = await params;

  const path = await prisma.learningPath.findUnique({
    where: { slug: pathSlug },
    select: { id: true, slug: true, title: true },
  });

  if (!path) notFound();

  const module = await prisma.module.findFirst({
    where: { learningPathId: path.id, slug: moduleSlug },
    include: {
      lessons: { orderBy: { orderBy: { order: "asc" } } as any },
      quizzes: { select: { slug: true, title: true } },
      projects: { select: { slug: true, title: true } },
    },
  });

  if (!module) notFound();

  const session = await getSessionUser();
  const me = session ? await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } }) : null;
  const progress = me
    ? await prisma.progress.findMany({
        where: { userId: me.id, completedAt: { not: null }, lesson: { moduleId: module.id } },
        select: { lessonId: true },
      })
    : [];
  const completedSet = new Set(progress.map((p) => p.lessonId));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <Link className="underline underline-offset-4 hover:text-foreground" href="/learning">
            Learning
          </Link>
          {" / "}
          <span>{path.title}</span>
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">{module.title}</h1>
        <p className="text-pretty text-muted-foreground">{module.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lecciones</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {module.lessons.map((l) => (
            <Link
              key={l.slug}
              href={`/learning/${path.slug}/${module.slug}/${l.slug}`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {l.order}. {l.title}
              {completedSet.has(l.id) ? (
                <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">OK</span>
              ) : null}
            </Link>
          ))}
        </CardContent>
      </Card>

      {module.quizzes.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {module.quizzes.map((q) => (
              <Link
                key={q.slug}
                href={`/quizzes/${path.slug}/${module.slug}/${q.slug}`}
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                {q.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/learning">Volver</Link>
        </Button>
      </div>
    </div>
  );
}

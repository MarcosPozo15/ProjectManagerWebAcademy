import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ pathSlug: string; moduleSlug: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "USER") redirect("/dashboard");

  const { pathSlug, moduleSlug } = await params;

  const path = await prisma.learningPath.findUnique({
    where: { slug: pathSlug },
    select: { id: true, slug: true, title: true },
  });

  if (!path) notFound();

  const moduleRow = await prisma.module.findFirst({
    where: { learningPathId: path.id, slug: moduleSlug },
    include: {
      lessons: { orderBy: { order: "asc" } },
      quizzes: { select: { slug: true, title: true } },
      projects: { select: { slug: true, title: true } },
    },
  });

  if (!moduleRow) notFound();

  const me = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
  const progress = me
    ? await prisma.progress.findMany({
        where: { userId: me.id, completedAt: { not: null }, lesson: { moduleId: moduleRow.id } },
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
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">{moduleRow.title}</h1>
        <p className="text-pretty text-muted-foreground">{moduleRow.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lecciones</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {moduleRow.lessons.map((l) => (
            <Link
              key={l.slug}
              href={`/learning/${path.slug}/${moduleRow.slug}/${l.slug}`}
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

      {moduleRow.quizzes.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {moduleRow.quizzes.map((q) => (
              <Link
                key={q.slug}
                href={`/quizzes/${path.slug}/${moduleRow.slug}/${q.slug}`}
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

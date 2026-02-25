import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ pathSlug: string; moduleSlug: string; lessonSlug: string }>;
}) {
  const { pathSlug, moduleSlug, lessonSlug } = await params;

  const path = await prisma.learningPath.findUnique({
    where: { slug: pathSlug },
    select: { id: true, slug: true, title: true },
  });

  if (!path) notFound();

  const module = await prisma.module.findFirst({
    where: { learningPathId: path.id, slug: moduleSlug },
    select: { id: true, slug: true, title: true },
  });

  if (!module) notFound();

  const lesson = await prisma.lesson.findFirst({
    where: { moduleId: module.id, slug: lessonSlug },
    select: { title: true, mdxContent: true, durationMin: true, difficulty: true },
  });

  if (!lesson) notFound();

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
            href={`/learning/${path.slug}/${module.slug}`}
          >
            {module.title}
          </Link>
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground">
          {lesson.durationMin} min · {lesson.difficulty}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap">{lesson.mdxContent}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

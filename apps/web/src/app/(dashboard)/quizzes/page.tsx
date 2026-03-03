import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export default async function QuizzesIndexPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "USER") redirect("/dashboard");

  const modules = await prisma.module.findMany({
    orderBy: [{ learningPath: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      learningPath: { select: { slug: true, title: true } },
      quizzes: { select: { slug: true, title: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Quizzes</h1>
        <p className="mt-2 text-pretty text-muted-foreground">Quizzes por módulo. Guarda intentos y score.</p>
      </div>

      <div className="grid gap-6">
        {modules
          .filter((m) => m.quizzes.length)
          .map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-base">{m.learningPath.title} · {m.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                {m.quizzes.map((q) => (
                  <Link
                    key={q.slug}
                    href={`/quizzes/${m.learningPath.slug}/${m.slug}/${q.slug}`}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                  >
                    {q.title}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

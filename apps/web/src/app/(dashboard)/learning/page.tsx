import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";
import { redirect } from "next/navigation";

export default async function LearningIndexPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "USER") redirect("/dashboard");
  const me = session ? await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } }) : null;
  const completed = me
    ? await prisma.progress.findMany({
        where: { userId: me.id, completedAt: { not: null } },
        select: { lessonId: true },
      })
    : [];
  const completedSet = new Set(completed.map((p) => p.lessonId));

  const paths = await prisma.learningPath.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, slug: true, title: true, order: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Learning</h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Rutas de aprendizaje (seed) desde Postgres/Prisma.
        </p>
      </div>

      <div className="grid gap-6">
        {paths.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-base">{p.title}</CardTitle>
              <div className="text-sm text-muted-foreground">{p.description}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              {p.modules.map((m) => (
                <div key={m.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">
                      <Link
                        className="underline underline-offset-4 hover:text-foreground"
                        href={`/learning/${p.slug}/${m.slug}`}
                      >
                        {m.order}. {m.title}
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground">{m.description}</div>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {m.lessons.map((l) => (
                      <Link
                        key={l.slug}
                        href={`/learning/${p.slug}/${m.slug}/${l.slug}`}
                        className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                      >
                        {l.order}. {l.title}{" "}
                        {completedSet.has(l.id) ? (
                          <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">OK</span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

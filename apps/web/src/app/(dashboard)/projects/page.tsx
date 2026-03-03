import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export default async function ProjectsIndexPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "USER") redirect("/dashboard");

  const me = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
  if (!me) return null;

  const modules = await prisma.module.findMany({
    orderBy: [{ learningPath: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      learningPath: { select: { slug: true, title: true } },
      projects: { select: { id: true, slug: true, title: true } },
    },
  });

  const mySubs = await prisma.projectSubmission.findMany({
    where: { userId: me.id },
    select: { projectId: true },
  });

  const submitted = new Set(mySubs.map((s) => s.projectId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Mini proyectos</h1>
        <p className="mt-2 text-pretty text-muted-foreground">Entregables por módulo (persistentes).</p>
      </div>

      <div className="grid gap-6">
        {modules
          .filter((m) => m.projects.length)
          .map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-base">{m.learningPath.title} · {m.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                {m.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${m.learningPath.slug}/${m.slug}/${p.slug}`}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                  >
                    {p.title} {submitted.has(p.id) ? "(enviado)" : ""}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export default async function DashboardHome() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true, role: true, name: true },
  });
  if (!me) redirect("/login");

  const [
    totalLessons,
    completedLessons,
    quizAttempts,
    submissions,
    projectSubs,
    corrections,
    recent,
  ] = await Promise.all([
    prisma.lesson.count(),
    prisma.progress.count({ where: { userId: me.id, completedAt: { not: null } } }),
    prisma.quizAttempt.count({ where: { userId: me.id } }),
    prisma.submission.count({ where: { studentId: me.id } }),
    prisma.projectSubmission.count({ where: { userId: me.id } }),
    me.role === "PROFESSOR" ? prisma.submissionFeedback.count({ where: { teacherId: me.id } }) : Promise.resolve(0),
    prisma.event.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, createdAt: true, properties: true },
    }),
  ]);

  const completionPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const nextAction = await (async () => {
    if (me.role === "ADMIN") {
      return { title: "Gestionar usuarios", description: "Crear y asignar profesores y alumnos.", href: "/admin/users" };
    }
    if (me.role === "PROFESSOR") {
      const pending = await prisma.submission.count({ where: { teacherId: me.id, status: { in: ["SUBMITTED", "IN_REVIEW"] } } });
      return pending > 0
        ? { title: "Corregir entregas", description: `Tienes ${pending} entregas pendientes.`, href: "/corrections" }
        : { title: "Revisar tu progreso", description: "Resumen de correcciones y actividad reciente.", href: "/progress" };
    }

    const completed = await prisma.progress.findMany({ where: { userId: me.id, completedAt: { not: null } }, select: { lessonId: true } });
    const completedSet = new Set(completed.map((p) => p.lessonId));
    const nextLesson = await prisma.lesson.findFirst({
      where: { id: { notIn: Array.from(completedSet) } },
      orderBy: [{ module: { learningPath: { order: "asc" } } }, { module: { order: "asc" } }, { order: "asc" }],
      select: { slug: true, title: true, module: { select: { slug: true, learningPath: { select: { slug: true } } } } },
    });

    if (nextLesson) {
      return {
        title: "Continuar learning",
        description: `Siguiente lección: ${nextLesson.title}`,
        href: `/learning/${nextLesson.module.learningPath.slug}/${nextLesson.module.slug}/${nextLesson.slug}`,
      };
    }

    return { title: "Hacer un quiz", description: "Refuerza conceptos con un quiz del módulo.", href: "/quizzes" };
  })();

  const badgeItems: Array<{ label: string; value: string }> = [];
  if (me.role === "USER") {
    badgeItems.push({ label: "Learning", value: `${completionPct}%` });
    badgeItems.push({ label: "Quizzes", value: `${quizAttempts} intentos` });
    badgeItems.push({ label: "Entregas", value: `${submissions}` });
    badgeItems.push({ label: "Proyectos", value: `${projectSubs}` });
  }
  if (me.role === "PROFESSOR") {
    badgeItems.push({ label: "Correcciones", value: `${corrections}` });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Dashboard</Badge>
          <Badge variant="outline">{me.role}</Badge>
          {me.role === "USER" ? <Badge variant="outline">{completionPct}% learning</Badge> : null}
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Hola{me.name ? `, ${me.name}` : ""}
        </h1>
        <p className="text-pretty text-muted-foreground">
          Actividad reciente, badges y siguiente paso.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Continuar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{nextAction.title}</div>
            <div>{nextAction.description}</div>
            <Button asChild size="sm">
              <Link href={nextAction.href}>Ir</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {recent.length ? (
              recent.map((e) => (
                <div key={e.id} className="rounded-md border px-3 py-2">
                  <div className="font-medium text-foreground">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div>No hay actividad todavía.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {badgeItems.length ? (
              badgeItems.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span>{b.label}</span>
                  <span className="text-xs text-muted-foreground">{b.value}</span>
                </div>
              ))
            ) : (
              <div>Sin badges para este rol.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium">Siguiente paso</div>
            <div className="text-sm text-muted-foreground">
              {nextAction.description}
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={nextAction.href}>Abrir</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

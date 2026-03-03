import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true, name: true, role: true },
  });

  if (!user) return null;
  if (user.role === "ADMIN") redirect("/dashboard");

  const [
    totalLessons,
    completedLessons,
    attempts,
    submissionsTotal,
    submissionsByStatus,
    feedbackReceived,
    correctionsDone,
    correctionsLatest,
    recent,
  ] = await Promise.all([
    prisma.lesson.count(),
    prisma.progress.count({ where: { userId: user.id, completedAt: { not: null } } }),
    prisma.quizAttempt.count({ where: { userId: user.id } }),
    prisma.submission.count({ where: { studentId: user.id } }),
    prisma.submission.groupBy({
      by: ["status"],
      where: { studentId: user.id },
      _count: { _all: true },
    }),
    prisma.submissionFeedback.count({
      where: { submission: { studentId: user.id } },
    }),
    user.role === "PROFESSOR"
      ? prisma.submissionFeedback.count({ where: { teacherId: user.id } })
      : Promise.resolve(0),
    user.role === "PROFESSOR"
      ? prisma.submissionFeedback.findMany({
          where: { teacherId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            createdAt: true,
            score: true,
            comment: true,
            submission: {
              select: {
                id: true,
                status: true,
                student: { select: { email: true, name: true } },
                exercise: { select: { title: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
    prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  const statusCounts = submissionsByStatus.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  const completionPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Tu progreso</Badge>
          <Badge variant="outline">Lecciones</Badge>
          <Badge variant="outline">Quizzes</Badge>
          <Badge variant="outline">Entregas</Badge>
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Progreso de {user.name ?? "tu cuenta"}
        </h1>
        <p className="text-pretty text-muted-foreground">
          Aquí verás tu avance real: lecciones completadas, intentos de quiz y entregas.
        </p>
      </div>

      {user.role === "USER" ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lecciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>
                Completadas: {completedLessons} / {totalLessons}
              </div>
              <div>Avance: {completionPct}%</div>
              <Button asChild size="sm" className="mt-2">
                <Link href="/learning">Continuar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quizzes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>Intentos: {attempts}</div>
              <Button asChild size="sm" className="mt-2" variant="outline">
                <Link href="/quizzes">Ir a Quizzes</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Entregas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>Total: {submissionsTotal}</div>
              <div>SUBMITTED: {statusCounts.SUBMITTED ?? 0}</div>
              <div>IN_REVIEW: {statusCounts.IN_REVIEW ?? 0}</div>
              <div>APPROVED: {statusCounts.APPROVED ?? 0}</div>
              <div>NEEDS_CHANGES: {statusCounts.NEEDS_CHANGES ?? 0}</div>
              <div>Feedback recibido: {feedbackReceived}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {user.role === "PROFESSOR" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como profesor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <div>Correcciones realizadas: {correctionsDone}</div>
              <Button asChild size="sm" className="mt-2">
                <Link href="/corrections">Ir a Correcciones</Link>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Histórico (últimas 20)</div>
              {correctionsLatest.length ? (
                <div className="space-y-2">
                  {correctionsLatest.map((f) => (
                    <div key={f.id} className="rounded-md border px-3 py-2">
                      <div className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</div>
                      <div className="font-medium text-foreground">{f.submission.exercise.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Alumno: {f.submission.student.name ?? f.submission.student.email} · Estado: {f.submission.status}
                      </div>
                      {f.score != null ? <div className="text-xs text-muted-foreground">Score: {f.score}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div>No has corregido todavía.</div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
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
            <div>No hay eventos todavía.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

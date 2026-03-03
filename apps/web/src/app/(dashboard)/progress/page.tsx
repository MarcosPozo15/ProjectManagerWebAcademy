import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import { getSessionUser } from "@/infrastructure/auth/session";

export default async function ProgressPage() {
  const session = await getSessionUser();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true, name: true, role: true },
  });

  if (!user) return null;

  const [
    totalLessons,
    completedLessons,
    attempts,
    submissionsTotal,
    submissionsByStatus,
    feedbackReceived,
    correctionsDone,
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lecciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Completadas: {completedLessons} / {totalLessons}</div>
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
            <div>Próximo: (se habilita en la Fase de Quizzes)</div>
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

      {user.role === "PROFESSOR" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como profesor</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div>Correcciones realizadas: {correctionsDone}</div>
            <Button asChild size="sm" className="mt-2">
              <Link href="/corrections">Ir a Correcciones</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Próximamente: últimos eventos (lesson_completed, quiz_submitted, submission_sent, feedback_received).
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">MVP</Badge>
          <Badge variant="outline">Progreso</Badge>
          <Badge variant="outline">Quizzes</Badge>
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Tu progreso
        </h1>
        <p className="text-pretty text-muted-foreground">
          Aquí verás % completado por path/módulo, continuar donde lo dejaste, recomendaciones y badges.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Continuar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>Lección siguiente: Introducción a HTTP</div>
            <Button asChild size="sm">
              <Link href="/learning">Ir a learning</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Próximamente: timeline de eventos (lesson_viewed, quiz_completed, etc.).
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Badges</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Próximamente: logros por streak, completado y proyectos.
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium">Siguiente paso</div>
            <div className="text-sm text-muted-foreground">
              Configurar Postgres + Prisma + seeds para mostrar paths/módulos reales.
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Ver landing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

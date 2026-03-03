import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/infrastructure/db/prisma";
import Link from "next/link";

export default async function AdminPage() {
  const email = (await cookies()).get("pmwa_email")?.value;
  if (!email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Admin</Badge>
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Panel Admin
        </h1>
        <p className="text-pretty text-muted-foreground">
          Aquí irá el CRUD completo de Paths/Módulos/Lecciones/Quizzes/Projects/Glossary/Users y un
          dashboard de métricas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contenido</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Editor MDX + CRUD de quizzes/preguntas.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>Gestión de roles, estado y asignación profesor-alumno.</div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/users">Abrir</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métricas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Eventos/día, completados, score promedio.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

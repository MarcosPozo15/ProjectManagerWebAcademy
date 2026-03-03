import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/infrastructure/auth/session";
import { CorrectionsInbox } from "@/components/professor/corrections-inbox";

export default async function CorrectionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "PROFESSOR" && user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Correcciones</Badge>
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Entregas</h1>
        <p className="text-pretty text-muted-foreground">Lista de entregas pendientes y revisadas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <CorrectionsInbox />
        </CardContent>
      </Card>
    </div>
  );
}

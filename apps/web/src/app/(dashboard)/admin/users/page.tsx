import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/infrastructure/auth/session";
import { UsersAdminTable } from "@/components/admin/users-admin-table";

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Admin</Badge>
          <Badge variant="outline">Usuarios</Badge>
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Usuarios</h1>
        <p className="text-pretty text-muted-foreground">
          Gestión de usuarios, roles, estado y asignación de alumnos a profesores.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersAdminTable />
        </CardContent>
      </Card>
    </div>
  );
}

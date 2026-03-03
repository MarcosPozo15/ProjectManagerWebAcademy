"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type Role = "USER" | "PROFESSOR" | "ADMIN" | "EDITOR";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  assignedTeacher: { id: string; email: string; name: string | null } | null;
  _count: {
    projectSubmissions: number;
    quizAttempts: number;
    progress: number;
  };
};

type ListResponse = { users: UserRow[]; total: number };

export function UsersAdminTable() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("ALL");
  const [isActive, setIsActive] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [professors, setProfessors] = useState<Array<{ id: string; email: string; name: string | null }>>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Record<string, string>>({});

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (role !== "ALL") params.set("role", role);
    if (isActive !== "ALL") params.set("isActive", isActive);
    return params.toString();
  }, [q, role, isActive]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?${queryString}`);
      const data = (await res.json().catch(() => null)) as ListResponse | { error?: string } | null;
      if (!res.ok) {
        toast.error((data as any)?.error ?? "No se pudieron cargar usuarios");
        return;
      }
      setRows((data as ListResponse).users);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessors = async () => {
    const res = await fetch(`/api/admin/users?role=PROFESSOR&take=200`);
    const data = (await res.json().catch(() => null)) as ListResponse | { error?: string } | null;
    if (!res.ok) {
      toast.error((data as any)?.error ?? "No se pudieron cargar profesores");
      return;
    }
    const list = (data as ListResponse).users.map((u) => ({ id: u.id, email: u.email, name: u.name }));
    setProfessors(list);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  useEffect(() => {
    void loadProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchUser = async (id: string, payload: any) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(data?.error ?? "No se pudo actualizar");
      return;
    }

    toast.success("Actualizado");
    void load();
  };

  const assignTeacher = async (studentId: string, teacherId: string) => {
    const res = await fetch(`/api/admin/assignments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ studentId, teacherId }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(data?.error ?? "No se pudo asignar profesor");
      return;
    }

    toast.success("Profesor asignado");
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por email o nombre" />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="ALL">Rol: todos</option>
          <option value="USER">USER</option>
          <option value="PROFESSOR">PROFESSOR</option>
          <option value="ADMIN">ADMIN</option>
          <option value="EDITOR">EDITOR</option>
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
        >
          <option value="ALL">Estado: todos</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Cargando..." : "Refrescar"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Profesor</TableHead>
            <TableHead>Actividad</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.name ?? "—"}</TableCell>
              <TableCell>
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  value={u.role}
                  onChange={(e) => patchUser(u.id, { role: e.target.value })}
                >
                  <option value="USER">USER</option>
                  <option value="PROFESSOR">PROFESSOR</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="EDITOR">EDITOR</option>
                </select>
              </TableCell>
              <TableCell>{u.isActive ? "Activo" : "Inactivo"}</TableCell>
              <TableCell>
                {u.role === "USER" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{u.assignedTeacher?.email ?? "—"}</span>
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={selectedTeacher[u.id] ?? ""}
                      onChange={(e) =>
                        setSelectedTeacher((s) => ({
                          ...s,
                          [u.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Elegir profesor</option>
                      {professors.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.email}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!selectedTeacher[u.id]}
                      onClick={() => void assignTeacher(u.id, selectedTeacher[u.id]!)}
                    >
                      Guardar
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  P:{u._count.progress} Q:{u._count.quizAttempts} E:{u._count.projectSubmissions}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patchUser(u.id, { isActive: !u.isActive })}
                  >
                    {u.isActive ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-sm text-muted-foreground">
        Asignación profesor-alumno disponible para usuarios con rol USER.
      </div>
    </div>
  );
}

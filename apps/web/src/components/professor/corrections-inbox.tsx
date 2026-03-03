"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type CorrectionRow = {
  id: string;
  status: string;
  submittedAt: string;
  comment: string | null;
  student: { id: string; email: string; name: string | null };
  exercise: {
    id: string;
    title: string;
    lesson: { slug: string; title: string; module: { slug: string; learningPath: { slug: string } } };
  };
  files: Array<{ id: string; originalName: string; path: string; size: number; mimeType: string }>;
  feedback: Array<{ comment: string; score: number | null; createdAt: string; teacher: { email: string; name: string | null } }>;
};

type ListResponse = { submissions: CorrectionRow[] };

export function CorrectionsInbox() {
  const router = useRouter();
  const [rows, setRows] = useState<CorrectionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("IN_REVIEW");
  const [score, setScore] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/corrections");
      const data = (await res.json().catch(() => null)) as ListResponse | { error?: string } | null;
      if (!res.ok) {
        toast.error((data && "error" in data ? data.error : null) ?? "No se pudieron cargar correcciones");
        return;
      }
      const list = (data as ListResponse).submissions;
      setRows(list);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status === "SUBMITTED" ? "IN_REVIEW" : selected.status);
    setComment("");
    setScore("");
  }, [selected]);

  const submitFeedback = async () => {
    if (!selected) return;
    if (comment.trim().length < 2) {
      toast.error("Escribe un comentario de corrección");
      return;
    }

    const payload: { status: string; comment: string; score?: number } = { status, comment: comment.trim() };
    if (score.trim()) payload.score = Number(score);

    const res = await fetch(`/api/corrections/${selected.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      toast.error(data?.error ?? "No se pudo guardar la corrección");
      return;
    }

    toast.success("Corrección guardada");
    void load();
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Entregas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full" onClick={load} disabled={loading}>
            {loading ? "Cargando..." : "Refrescar"}
          </Button>
          <div className="max-h-[60dvh] space-y-2 overflow-auto">
            {rows.map((r) => (
              <button
                key={r.id}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted ${
                  selectedId === r.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedId(r.id)}
              >
                <div className="font-medium">{r.exercise.title}</div>
                <div className="text-xs text-muted-foreground">{r.student.email}</div>
                <div className="text-xs text-muted-foreground">Estado: {r.status}</div>
                {r.feedback[0]?.score != null ? (
                  <div className="text-xs text-muted-foreground">Nota: {r.feedback[0].score}</div>
                ) : null}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Detalle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selected ? (
            <div className="text-sm text-muted-foreground">Selecciona una entrega.</div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Alumno</div>
                <div className="font-medium">{selected.student.name ?? selected.student.email}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Ejercicio</div>
                <div className="font-medium">{selected.exercise.title}</div>
                <div className="text-sm text-muted-foreground">Estado actual: {selected.status}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Comentario del alumno</div>
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  {selected.comment || "(sin comentario)"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Archivos</div>
                <div className="space-y-2">
                  {selected.files.map((f) => (
                    <a
                      key={f.id}
                      className="block rounded-md border px-3 py-2 text-sm hover:bg-muted"
                      href={`/api/submissions/files/${f.id}`}
                    >
                      {f.originalName}
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Nueva corrección</div>
                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="NEEDS_CHANGES">NEEDS_CHANGES</option>
                  </select>
                  <input
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    placeholder="Score (0-100)"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                  <Button onClick={submitFeedback}>Guardar</Button>
                </div>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Feedback para el alumno" />
              </div>

              {selected.feedback.length ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Último feedback</div>
                  <div className="rounded-md border p-3 text-sm">
                    <div className="text-xs text-muted-foreground">
                      {selected.feedback[0].teacher.email} · {new Date(selected.feedback[0].createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2 whitespace-pre-wrap">{selected.feedback[0].comment}</div>
                    {selected.feedback[0].score != null ? (
                      <div className="mt-2 text-xs text-muted-foreground">Score: {selected.feedback[0].score}</div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

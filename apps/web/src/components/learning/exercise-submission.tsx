"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ExerciseSubmission(props: { exerciseId: string; requiredFiles: string[] }) {
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const required = useMemo(() => props.requiredFiles.join(", ") || "(no especificado)", [props.requiredFiles]);

  const onSubmit = async () => {
    if (!files || files.length === 0) {
      toast.error("Adjunta al menos un archivo");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.set("exerciseId", props.exerciseId);
      if (comment.trim()) form.set("comment", comment.trim());
      for (const f of Array.from(files)) form.append("files", f);

      const res = await fetch("/api/submissions", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { error?: string } | { ok: true } | null;
      if (!res.ok) {
        toast.error((data as any)?.error ?? "No se pudo enviar la entrega");
        return;
      }
      toast.success("Entrega enviada");
      setComment("");
      setFiles(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">Archivos requeridos: {required}</div>
      <Input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comentario opcional para el profesor" />
      <Button onClick={onSubmit} disabled={loading}>
        {loading ? "Enviando..." : "Enviar entrega"}
      </Button>
    </div>
  );
}

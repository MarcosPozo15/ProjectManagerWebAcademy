"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LessonProgressToggle(props: { lessonId: string; initialCompleted: boolean }) {
  const [completed, setCompleted] = useState(props.initialCompleted);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/progress/lessons/${props.lessonId}`, {
        method: completed ? "DELETE" : "POST",
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo actualizar el progreso");
        return;
      }

      setCompleted((v) => !v);
      toast.success(completed ? "Marcada como pendiente" : "Lección completada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={completed ? "secondary" : "default"} onClick={toggle} disabled={loading}>
      {loading ? "Guardando..." : completed ? "Completada" : "Marcar como completada"}
    </Button>
  );
}

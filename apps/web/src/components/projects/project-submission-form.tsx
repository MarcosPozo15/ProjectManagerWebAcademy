"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ProjectSubmissionForm(props: {
  projectId: string;
  initialUrl: string;
  initialText: string;
}) {
  const [deliverableUrl, setDeliverableUrl] = useState(props.initialUrl);
  const [deliverableText, setDeliverableText] = useState(props.initialText);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!deliverableUrl.trim() && !deliverableText.trim()) {
      toast.error("Añade una URL o una descripción del entregable");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId: props.projectId,
          deliverableUrl: deliverableUrl.trim() || null,
          deliverableText: deliverableText.trim() || null,
        }),
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo guardar el proyecto");
        return;
      }

      toast.success("Proyecto enviado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Tu entrega</div>
      <Input value={deliverableUrl} onChange={(e) => setDeliverableUrl(e.target.value)} placeholder="URL (GitHub/Notion/Figma/etc.)" />
      <Textarea value={deliverableText} onChange={(e) => setDeliverableText(e.target.value)} placeholder="Descripción / PRD / notas" />
      <Button onClick={submit} disabled={loading}>
        {loading ? "Guardando..." : "Guardar entrega"}
      </Button>
    </div>
  );
}

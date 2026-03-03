"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  type: string;
};

export function QuizRunner(props: { quizId: string; questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number; perQuestion: Array<{ id: string; ok: boolean; correct: string; explanation: string }> } | null>(null);

  const maxScore = props.questions.length;

  const canSubmit = useMemo(() => {
    return props.questions.every((q) => {
      const a = answers[q.id];
      return typeof a === "string" && a.trim().length > 0;
    });
  }, [answers, props.questions]);

  const submit = async () => {
    if (!canSubmit) {
      toast.error("Responde todas las preguntas");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/quizzes/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quizId: props.quizId, answers }),
      });

      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo enviar el intento");
        return;
      }

      setResult(data.result);
      toast.success("Quiz enviado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Preguntas: {props.questions.length}</div>

      {props.questions.map((q, idx) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {idx + 1}. {q.prompt}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" ? (
              <div className="grid gap-2">
                {q.options.map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm hover:bg-muted">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <Input
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder="Tu respuesta"
              />
            )}

            {result ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                {(() => {
                  const r = result.perQuestion.find((x) => x.id === q.id);
                  if (!r) return null;
                  return (
                    <div className="space-y-1">
                      <div className="font-medium">{r.ok ? "Correcto" : "Incorrecto"}</div>
                      {!r.ok ? <div>Correcta: {r.correct}</div> : null}
                      <div className="text-muted-foreground">{r.explanation}</div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}

      <Button onClick={submit} disabled={submitting || !canSubmit}>
        {submitting ? "Enviando..." : "Enviar"}
      </Button>

      {result ? (
        <div className="rounded-md border p-4 text-sm">
          Score: {result.score} / {result.maxScore}
          <div className="mt-2 text-muted-foreground">
            {result.score < Math.ceil(result.maxScore * 0.6)
              ? "Recomendación: repasa el módulo y reintenta mañana."
              : "Bien: puedes continuar con el siguiente módulo."}
          </div>
        </div>
      ) : null}

      <div className="text-xs text-muted-foreground">Max score: {maxScore}</div>
    </div>
  );
}

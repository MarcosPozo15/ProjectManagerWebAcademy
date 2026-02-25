import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Cómo funciona
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Aprende arquitectura web y toma mejores decisiones de producto con rutas guiadas, quizzes,
          mini-proyectos y métricas.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>1) Aprende por rutas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Paths orientados a PM con módulos y lecciones cortas, conectadas a tradeoffs reales.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2) Practica con quizzes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Refuerza conceptos y entiende por qué una respuesta es correcta. Recomendaciones si fallas.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3) Aplica en mini-proyectos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Diseña una API, modela una DB, define endpoints y valida decisiones como PM.
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/signup">Empieza gratis</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Volver a la landing</Link>
        </Button>
      </div>
    </div>
  );
}

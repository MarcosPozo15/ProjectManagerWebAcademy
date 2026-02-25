import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const roadmap = [
  {
    title: "Arquitectura web & APIs",
    description: "Entiende monolitos vs microservicios, REST, versionado y tradeoffs.",
  },
  {
    title: "DB, Auth & Seguridad",
    description: "SQL, modelado, sesiones/JWT, OWASP y decisiones de riesgo/scope.",
  },
  {
    title: "Performance, UX & Analytics",
    description: "Core Web Vitals, instrumentación de eventos y métricas accionables.",
  },
];

const testimonials = [
  {
    quote:
      "Por fin un curso que conecta arquitectura y APIs con decisiones de producto y métricas.",
    name: "María, PM",
  },
  {
    quote: "Me ayudó a conversar con ingeniería con más precisión y menos suposiciones.",
    name: "Javier, Growth PM",
  },
  {
    quote: "Los mini-proyectos hacen tangible el impacto de elegir una arquitectura u otra.",
    name: "Lucía, PM Platform",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">PM-friendly</Badge>
            <Badge variant="outline">Full-stack</Badge>
            <Badge variant="outline">Mobile-first</Badge>
          </div>

          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Aprende desarrollo web para tomar mejores decisiones de producto.
          </h1>

          <p className="mt-4 text-pretty text-muted-foreground">
            PM Web Academy te enseña arquitectura web, APIs, bases de datos, autenticación,
            performance, UX, analytics, despliegue, seguridad y testing — con foco en tradeoffs,
            métricas y colaboración con ingeniería.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/signup">Empieza gratis</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/how-it-works">Ver cómo funciona</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Ya tienes cuenta?{" "}
            <Link className="underline underline-offset-4 hover:text-foreground" href="/login">
              Entra aquí
            </Link>
            .
          </p>
        </div>

        <Card className="md:ml-auto">
          <CardHeader>
            <CardTitle>Qué vas a poder hacer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Rutas de aprendizaje</div>
              <div>Paths → módulos → lecciones con progreso y recomendaciones.</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Quizzes y feedback</div>
              <div>Explicaciones, intentos, score y refuerzos por tópicos.</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Mini-proyectos guiados</div>
              <div>PRD mini-template, user stories y checklist de decisiones como PM.</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-16">
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Roadmap de módulos
        </h2>
        <p className="mt-2 text-pretty text-muted-foreground">
          Diseñado para darte contexto técnico suficiente y traducirlo a decisiones de producto.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {roadmap.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Lo que dicen (mock)
            </h2>
            <p className="mt-2 text-pretty text-muted-foreground">
              Testimonios de ejemplo para el MVP.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">“{t.quote}”</p>
                <p className="mt-4 text-sm font-medium">{t.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-lg border bg-card p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight">
              Empieza hoy y mide tu progreso
            </h2>
            <p className="mt-2 text-pretty text-muted-foreground">
              Completa lecciones, haz quizzes y construye mini-proyectos con una lente de PM.
            </p>
          </div>
          <Button asChild className="md:shrink-0">
            <Link href="/signup">Crear cuenta</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

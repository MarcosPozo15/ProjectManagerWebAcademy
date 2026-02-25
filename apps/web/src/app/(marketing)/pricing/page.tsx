import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">Pricing</h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          MVP con planes simulados. La app funcionará completa en modo Free para desarrollo.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free
              <Badge variant="secondary">MVP</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Acceso a rutas iniciales, progreso, quizzes y mini-proyectos.
            </p>
            <Button asChild className="w-full">
              <Link href="/signup">Crear cuenta</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pro
              <Badge>Próximamente</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Más rutas, analytics avanzados, proyectos evaluados y contenido extra para equipos.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/signup">Únete a la lista</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

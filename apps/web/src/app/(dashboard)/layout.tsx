import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { getSessionUser } from "@/infrastructure/auth/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";
  const isProfessor = user.role === "PROFESSOR";
  const isUser = user.role === "USER";

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Dashboard
          </Link>
          <nav className="flex items-center gap-2">
            {isUser ? (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/learning">Learning</Link>
                </Button>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/quizzes">Quizzes</Link>
                </Button>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/projects">Mini proyectos</Link>
                </Button>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/progress">Tu progreso</Link>
                </Button>
              </>
            ) : null}

            {isProfessor ? (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/corrections">Correcciones</Link>
                </Button>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/progress">Tu progreso</Link>
                </Button>
              </>
            ) : null}

            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/profile">Perfil</Link>
            </Button>
            {isAdmin ? (
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/admin">Admin</Link>
              </Button>
            ) : null}
            <Button variant="ghost" asChild>
              <Link href="/">Landing</Link>
            </Button>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

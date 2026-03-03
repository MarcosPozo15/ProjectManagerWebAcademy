import Link from "next/link";
import { ReactNode } from "react";
import { cookies } from "next/headers";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const email = (await cookies()).get("pmwa_email")?.value;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-semibold tracking-tight">
            PM Web Academy
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/how-it-works" className="hover:text-foreground">
              Cómo funciona
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {email ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/profile">Perfil</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link href="/signup">Empieza gratis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PM Web Academy
          </div>
          <div className="text-sm text-muted-foreground">
            Construido para PMs que colaboran con ingeniería.
          </div>
        </div>
      </footer>
    </div>
  );
}

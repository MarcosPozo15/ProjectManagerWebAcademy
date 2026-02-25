import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 text-center text-sm font-medium">
          ← Volver
        </Link>
        {children}
      </div>
    </div>
  );
}

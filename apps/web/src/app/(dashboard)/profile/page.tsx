"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2),
  timezone: z.string().min(2),
  avatarUrl: z.string().url().or(z.literal("")).optional(),
  bio: z.string().max(2000).optional(),
});

type Values = z.infer<typeof schema>;

type MeResponse = {
  user: {
    email: string;
    name: string | null;
    role: string;
    timezone: string | null;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: string;
  };
};

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", avatarUrl: "", bio: "", timezone: "" },
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = (await res.json()) as MeResponse;
      setEmail(data.user.email);
      setRole(data.user.role);
      form.reset({
        name: data.user.name ?? "",
        timezone: data.user.timezone ?? "",
        avatarUrl: data.user.avatarUrl ?? "",
        bio: data.user.bio ?? "",
      });
    };
    void load();
  }, [form]);

  const onSubmit = async (values: Values) => {
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...values,
        avatarUrl: values.avatarUrl?.trim() ? values.avatarUrl.trim() : null,
        bio: values.bio?.trim() ? values.bio.trim() : null,
      }),
    });

    if (!res.ok) {
      toast.error("No se pudo actualizar el perfil");
      return;
    }

    toast.success("Perfil actualizado");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Perfil</h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Edita tus datos básicos. El RBAC se controla por rol en la base de datos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            <div>Email: {email ?? "—"}</div>
            <div>Rol: {role ?? "—"}</div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona horaria</FormLabel>
                    <FormControl>
                      <Input placeholder="Europe/Madrid" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input placeholder="Sobre ti..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Guardar</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

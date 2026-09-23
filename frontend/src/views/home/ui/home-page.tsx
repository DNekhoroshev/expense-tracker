"use client";

import { Loader2Icon } from "lucide-react";
import Link from "next/link";

import { useSession } from "@/entities/session";
import { LogoutButton } from "@/features/auth/logout";
import { ROUTES } from "@/shared/config";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";

export function HomePage() {
  const { session, status } = useSession();

  if (status === "loading") {
    return <Loader2Icon className="text-muted-foreground size-6 animate-spin" />;
  }

  if (session === null) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Expense Tracker</CardTitle>
          <CardDescription>Войдите или создайте аккаунт, чтобы начать.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link href={ROUTES.login}>Войти</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.register}>Зарегистрироваться</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Привет, {session.user.name}!</CardTitle>
        <CardDescription>{session.user.email}</CardDescription>
      </CardHeader>

      <CardContent>
        <LogoutButton />
      </CardContent>
    </Card>
  );
}

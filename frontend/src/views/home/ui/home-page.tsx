"use client";

import { Loader2Icon } from "lucide-react";
import Link from "next/link";

import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { AppHeader } from "@/widgets/app-header";
import { RecentTransactions } from "@/widgets/recent-transactions";

export function HomePage() {
  const { session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
      </main>
    );
  }

  if (session === null) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
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
      </main>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <h1 className="text-2xl font-semibold">Привет, {session.user.name}!</h1>
        <RecentTransactions />
      </main>
    </>
  );
}

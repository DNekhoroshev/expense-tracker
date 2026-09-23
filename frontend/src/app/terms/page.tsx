import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/shared/config";

export const metadata: Metadata = {
  title: "Пользовательское соглашение — Expense Tracker",
};

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Пользовательское соглашение</h1>
      <p className="text-muted-foreground mt-4 text-sm">
        Текст пользовательского соглашения будет опубликован здесь.
      </p>
      <Link href={ROUTES.login} className="mt-6 inline-block text-sm underline underline-offset-4">
        Назад ко входу
      </Link>
    </main>
  );
}

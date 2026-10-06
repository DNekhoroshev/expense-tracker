import { Loader2Icon } from "lucide-react";

/** Full-screen spinner for pages waiting on the client-side session. */
export function PageLoader() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Loader2Icon className="text-muted-foreground size-6 animate-spin" aria-label="Загрузка" />
    </main>
  );
}

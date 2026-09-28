"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config";

/**
 * Members-only shell: an anonymous visitor (or one whose session has just
 * expired) is sent to the login page instead of seeing the app.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(ROUTES.login);
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
      </main>
    );
  }

  return children;
}

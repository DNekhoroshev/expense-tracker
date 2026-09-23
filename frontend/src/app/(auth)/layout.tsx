"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config";

/**
 * Guest-only shell for the auth pages: an already authenticated visitor is
 * bounced to the home page instead of seeing the login/register forms.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(ROUTES.home);
    }
  }, [status, router]);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      {status === "anonymous" ? (
        children
      ) : (
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
      )}
    </main>
  );
}

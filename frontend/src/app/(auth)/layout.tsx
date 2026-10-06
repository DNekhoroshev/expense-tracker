"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config";
import { PageLoader } from "@/shared/ui";

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

  if (status !== "anonymous") {
    return <PageLoader />;
  }

  return <main className="flex min-h-svh items-center justify-center p-6">{children}</main>;
}

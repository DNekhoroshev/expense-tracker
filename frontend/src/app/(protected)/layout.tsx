"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config";
import { PageLoader } from "@/shared/ui";

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

  return status === "authenticated" ? children : <PageLoader />;
}

"use client";

import { SessionProvider } from "@/entities/session";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

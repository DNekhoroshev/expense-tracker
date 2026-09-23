import type { Metadata } from "next";

import { LoginPage } from "@/views/login";

export const metadata: Metadata = {
  title: "Вход — Expense Tracker",
};

export default function Page() {
  return <LoginPage />;
}

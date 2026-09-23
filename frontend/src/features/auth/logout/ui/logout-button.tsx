"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config";
import { Button } from "@/shared/ui";

export function LogoutButton() {
  const router = useRouter();
  const { signOut } = useSession();

  function handleClick() {
    signOut();
    router.replace(ROUTES.login);
  }

  return (
    <Button variant="outline" onClick={handleClick}>
      <LogOutIcon />
      Выйти
    </Button>
  );
}

"use client";

import { FolderIcon, HomeIcon, ReceiptTextIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSession } from "@/entities/session";
import { UserProfile } from "@/entities/user";
import { LogoutButton } from "@/features/auth/logout";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui";

const NAV_ITEMS = [
  { href: ROUTES.home, label: "Главная", icon: HomeIcon },
  { href: ROUTES.transactions, label: "Транзакции", icon: ReceiptTextIcon },
  { href: ROUTES.categories, label: "Категории", icon: FolderIcon },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { session } = useSession();

  return (
    <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href={ROUTES.home} className="flex items-center gap-2 font-semibold">
          <WalletIcon className="size-5" />
          <span className="hidden sm:inline">Expense Tracker</span>
        </Link>

        <nav aria-label="Основное меню" className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== ROUTES.home && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }))}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {session ? <UserProfile user={session.user} /> : null}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

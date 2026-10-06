import { Avatar, AvatarFallback } from "@/shared/ui";

import type { User } from "../model/types";

export function UserProfile({ user }: { user: User }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar>
        <AvatarFallback className="text-xs font-medium">{toInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="hidden min-w-0 leading-tight sm:block">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-muted-foreground hidden truncate text-xs lg:block">{user.email}</p>
      </div>
    </div>
  );
}

function toInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

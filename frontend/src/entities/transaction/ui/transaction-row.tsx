import { cn, formatAmount, formatDate } from "@/shared/lib";

import type { Transaction } from "../model/types";

type TransactionRowProps = {
  transaction: Transaction;
  categoryName?: string;
  categoryColor?: string;
};

export function TransactionRow({ transaction, categoryName, categoryColor }: TransactionRowProps) {
  const isIncome = transaction.type === "income";

  return (
    <li className="flex items-center gap-3 py-3">
      <span
        aria-hidden
        className="bg-muted size-2.5 shrink-0 rounded-full"
        style={categoryColor ? { backgroundColor: categoryColor } : undefined}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {transaction.description ?? <span className="text-muted-foreground">Без описания</span>}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {formatDate(transaction.date)}
          {categoryName ? ` · ${categoryName}` : null}
        </p>
      </div>

      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
        )}
      >
        {isIncome ? "+" : "−"}
        {formatAmount(transaction.amount)}
      </span>
    </li>
  );
}

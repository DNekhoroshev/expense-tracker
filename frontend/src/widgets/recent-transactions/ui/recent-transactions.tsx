"use client";

import { ChevronLeftIcon, ChevronRightIcon, RotateCwIcon } from "lucide-react";

import { TransactionRow } from "@/entities/transaction";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/ui";

import { RECENT_TRANSACTIONS_PAGE_SIZE, useRecentTransactions } from "../model/use-recent-transactions";

export function RecentTransactions() {
  const { page, setPage, state, categoriesById, retry } = useRecentTransactions();
  const data = state.data;
  const totalPages = data?.totalPages ?? 0;
  const isLoading = state.status === "loading";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние транзакции</CardTitle>
        <CardDescription>
          {data ? `Всего: ${data.totalElements}` : "Доходы и расходы, новые сверху"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {state.status === "error" ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              {state.error}
              <Button size="sm" variant="outline" onClick={retry}>
                <RotateCwIcon />
                Повторить
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading && data === null ? (
          <TransactionListSkeleton />
        ) : data && data.items.length > 0 ? (
          <ul className={isLoading ? "divide-y opacity-60 transition-opacity" : "divide-y"} aria-busy={isLoading}>
            {data.items.map((transaction) => {
              const category = categoriesById.get(transaction.categoryId);
              return (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  categoryName={category?.name}
                  categoryColor={category?.color ?? undefined}
                />
              );
            })}
          </ul>
        ) : data ? (
          <p className="text-muted-foreground py-8 text-center text-sm">Пока нет транзакций</p>
        ) : null}
      </CardContent>

      {totalPages > 1 ? (
        <CardFooter className="justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon />
            Назад
          </Button>
          <span className="text-muted-foreground text-sm tabular-nums">
            Страница {page + 1} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Вперёд
            <ChevronRightIcon />
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function TransactionListSkeleton() {
  return (
    <ul className="divide-y" aria-busy>
      {Array.from({ length: RECENT_TRANSACTIONS_PAGE_SIZE }, (_, index) => (
        <li key={index} className="flex items-center gap-3 py-3">
          <Skeleton className="size-2.5 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-16" />
        </li>
      ))}
    </ul>
  );
}

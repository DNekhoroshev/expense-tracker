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
  const { page, setPage, status, data, categoriesById, retry } = useRecentTransactions();
  const totalPages = data?.totalPages ?? 0;
  const isLoading = status.status === "loading";
  // Rows are only ever shown under their own page number; while another page
  // loads, the skeleton stands in rather than the previous page's rows.
  const current = data?.page === page ? data : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние транзакции</CardTitle>
        <CardDescription>
          {data ? `Всего: ${data.totalElements}` : "Доходы и расходы, новые сверху"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {status.status === "error" ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              {status.error}
              <Button size="sm" variant="outline" onClick={retry}>
                <RotateCwIcon />
                Повторить
              </Button>
            </AlertDescription>
          </Alert>
        ) : isLoading && current === null ? (
          <TransactionListSkeleton />
        ) : current && current.items.length > 0 ? (
          <ul className={isLoading ? "divide-y opacity-60 transition-opacity" : "divide-y"} aria-busy={isLoading}>
            {current.items.map((transaction) => {
              const category = categoriesById.get(transaction.categoryId);
              return (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  categoryName={category?.name}
                  categoryColor={category?.color}
                />
              );
            })}
          </ul>
        ) : current ? (
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

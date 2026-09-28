"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getCategories, type Category } from "@/entities/category";
import { useSession } from "@/entities/session";
import { getRecentTransactions, type TransactionPage } from "@/entities/transaction";
import { isApiError } from "@/shared/api";

export const RECENT_TRANSACTIONS_PAGE_SIZE = 10;

type Status = { status: "loading" } | { status: "success" } | { status: "error"; error: string };

/**
 * Loads the user's transactions page by page, newest first, together with
 * their categories so rows can show category names.
 *
 * `data` is the last page that loaded successfully. While `page` is loading it
 * still holds the previous page; after an error on `page` it must not be shown
 * as rows, only used for the totals (`totalPages`, `totalElements`).
 */
export function useRecentTransactions() {
  const { session, signOut } = useSession();
  const token = session?.accessToken;

  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>({ status: "loading" });
  const [data, setData] = useState<TransactionPage | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();
    setStatus({ status: "loading" });

    getRecentTransactions({ page, size: RECENT_TRANSACTIONS_PAGE_SIZE }, token, controller.signal)
      .then((next) => {
        // The last item on the last page was deleted elsewhere: step back.
        if (next.items.length === 0 && next.page > 0) {
          setPage(Math.max(next.totalPages - 1, 0));
          return;
        }
        setData(next);
        setStatus({ status: "success" });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (isApiError(error) && error.status === 401) {
          signOut();
          return;
        }
        setStatus({
          status: "error",
          error: isApiError(error) ? error.message : "Не удалось загрузить транзакции.",
        });
      });

    return () => controller.abort();
  }, [token, page, attempt, signOut]);

  // Category names are cosmetic: if they fail to load, rows just go without them.
  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();
    getCategories(token, controller.signal)
      .then(setCategories)
      .catch(() => {});

    return () => controller.abort();
  }, [token]);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { page, setPage, status, data, categoriesById, retry };
}

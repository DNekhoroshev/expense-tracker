"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getCategories, type Category } from "@/entities/category";
import { useSession } from "@/entities/session";
import { getRecentTransactions, type TransactionPage } from "@/entities/transaction";
import { isApiError } from "@/shared/api";

export const RECENT_TRANSACTIONS_PAGE_SIZE = 10;

type State =
  | { status: "loading"; data: TransactionPage | null }
  | { status: "success"; data: TransactionPage }
  | { status: "error"; data: TransactionPage | null; error: string };

/**
 * Loads the user's transactions page by page, newest first, together with
 * their categories so rows can show category names.
 */
export function useRecentTransactions() {
  const { session, signOut } = useSession();
  const token = session?.accessToken;

  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ status: "loading", data: null });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();
    setState((previous) => ({ status: "loading", data: previous.data }));

    getRecentTransactions({ page, size: RECENT_TRANSACTIONS_PAGE_SIZE }, token, controller.signal)
      .then((data) => {
        // The last item on the last page was deleted elsewhere: step back.
        if (data.items.length === 0 && data.page > 0) {
          setPage(Math.max(data.totalPages - 1, 0));
          return;
        }
        setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (isApiError(error) && error.status === 401) {
          signOut();
          return;
        }
        setState((previous) => ({
          status: "error",
          data: previous.data,
          error: isApiError(error) ? error.message : "Не удалось загрузить транзакции.",
        }));
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

  return { page, setPage, state, categoriesById, retry };
}

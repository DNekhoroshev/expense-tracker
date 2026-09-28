import { apiRequest } from "@/shared/api";

import type { TransactionPage } from "../model/types";

export type RecentTransactionsParams = {
  /** Zero-based page number. */
  page: number;
  size: number;
};

/** All of the user's transactions, newest first, one page at a time. */
export function getRecentTransactions(
  { page, size }: RecentTransactionsParams,
  token: string,
  signal?: AbortSignal,
): Promise<TransactionPage> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return apiRequest<TransactionPage>(`/api/transactions/recent?${query}`, { token, signal });
}

/** Mirrors `com.expensetracker.backend.transaction.TransactionType`. */
export type TransactionType = "income" | "expense";

/** Mirrors `com.expensetracker.backend.transaction.TransactionResponse`. */
export type Transaction = {
  id: number;
  amount: number;
  type: TransactionType;
  description: string | null;
  /** `YYYY-MM-DD`. */
  date: string;
  categoryId: number;
};

/** Mirrors `com.expensetracker.backend.transaction.TransactionPageResponse`. */
export type TransactionPage = {
  items: Transaction[];
  /** Zero-based. */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

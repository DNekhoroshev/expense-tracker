/** Mirrors `com.expensetracker.backend.category.CategoryResponse`. */
export type Category = {
  id: number;
  name: string;
  /** Hex color such as `#4f46e5`. */
  color: string;
  icon: string;
};

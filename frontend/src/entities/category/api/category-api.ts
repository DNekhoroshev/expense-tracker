import { apiRequest } from "@/shared/api";

import type { Category } from "../model/types";

export function getCategories(token: string, signal?: AbortSignal): Promise<Category[]> {
  return apiRequest<Category[]>("/api/categories", { token, signal });
}

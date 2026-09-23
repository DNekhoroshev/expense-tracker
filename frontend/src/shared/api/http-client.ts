import { API_BASE_URL } from "@/shared/config";

import { ApiError, NETWORK_ERROR_STATUS, type ProblemDetail } from "./api-error";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Bearer token for protected endpoints. */
  token?: string;
  signal?: AbortSignal;
};

/**
 * Thin `fetch` wrapper around the backend API: serialises JSON bodies and
 * turns every failure — transport or HTTP — into an `ApiError`.
 */
export async function apiRequest<TResponse>(
  path: string,
  { method = "GET", body, token, signal }: RequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers({ Accept: "application/json" });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause;
    }
    throw new ApiError(
      NETWORK_ERROR_STATUS,
      "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.",
    );
  }

  if (!response.ok) {
    const problem = await readProblemDetail(response);
    throw new ApiError(response.status, problem?.detail ?? problem?.title ?? response.statusText, problem);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

async function readProblemDetail(response: Response): Promise<ProblemDetail | undefined> {
  try {
    return (await response.json()) as ProblemDetail;
  } catch {
    return undefined;
  }
}

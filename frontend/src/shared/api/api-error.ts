/**
 * RFC 7807 payload returned by the backend
 * (`spring.mvc.problemdetails.enabled: true`).
 */
export type ProblemDetail = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
};

/** Status used when the request never reached the backend. */
export const NETWORK_ERROR_STATUS = 0;

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetail;

  constructor(status: number, message: string, problem?: ProblemDetail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }

  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

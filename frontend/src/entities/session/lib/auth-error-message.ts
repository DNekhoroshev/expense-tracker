import { isApiError } from "@/shared/api";

/**
 * Maps a failed auth request to a message for the user. The backend replies
 * with RFC 7807 problem details whose `detail` is English and, for validation
 * errors, too generic to show as-is — so statuses are translated explicitly.
 */
export function toAuthErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "Не удалось выполнить запрос. Попробуйте ещё раз.";
  }

  if (error.isNetworkError) {
    return error.message;
  }

  switch (error.status) {
    case 400:
      return "Проверьте правильность заполнения формы.";
    case 401:
      return "Неверный email или пароль.";
    case 409:
      return "Пользователь с таким email уже зарегистрирован.";
    default:
      return error.status >= 500
        ? "Сервер временно недоступен. Попробуйте позже."
        : "Не удалось выполнить запрос. Попробуйте ещё раз.";
  }
}

import type { User } from "@/entities/user";

/** Mirrors `com.expensetracker.backend.auth.AuthResponse`. */
export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  /** Token lifetime in seconds. */
  expiresIn: number;
  user: User;
};

/** Authenticated session as it is kept on the client. */
export type Session = {
  accessToken: string;
  tokenType: string;
  /** Absolute expiry, epoch milliseconds. */
  expiresAt: number;
  user: User;
};

export function toSession(response: AuthResponse): Session {
  return {
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresAt: Date.now() + response.expiresIn * 1000,
    user: response.user,
  };
}

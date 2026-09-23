import { apiRequest } from "@/shared/api";

import type { AuthResponse } from "../model/types";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export function login(credentials: LoginCredentials, signal?: AbortSignal): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: credentials,
    signal,
  });
}

export function register(payload: RegisterPayload, signal?: AbortSignal): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
    signal,
  });
}

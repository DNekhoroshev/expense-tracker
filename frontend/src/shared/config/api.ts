/** Base URL of the Spring Boot backend. Inlined at build time by Next.js. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "http://localhost:8080";

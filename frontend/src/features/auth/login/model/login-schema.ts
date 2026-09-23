import { z } from "zod";

/** Mirrors `com.expensetracker.backend.auth.LoginRequest`. */
export const loginSchema = z.object({
  email: z.email({ message: "Введите корректный email." }).trim(),
  password: z.string().min(1, { message: "Введите пароль." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginDefaultValues: LoginFormValues = {
  email: "",
  password: "",
};

import { z } from "zod";

/** BCrypt only considers the first 72 bytes of a password. */
const PASSWORD_MAX_BYTES = 72;

/**
 * Mirrors `com.expensetracker.backend.auth.RegisterRequest`, plus a
 * client-only consent checkbox — the backend has no such field and never
 * sees it.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Введите имя." })
      .max(100, { message: "Имя не должно быть длиннее 100 символов." }),
    email: z.email({ message: "Введите корректный email." }).trim(),
    password: z
      .string()
      .min(8, { message: "Пароль должен содержать минимум 8 символов." })
      .refine((value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES, {
        message: "Пароль слишком длинный.",
      }),
    passwordConfirmation: z.string().min(1, { message: "Повторите пароль." }),
    agreedToTerms: z.boolean().refine((value) => value, {
      message: "Необходимо согласие с пользовательским соглашением и политикой обработки данных.",
    }),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Пароли не совпадают.",
    path: ["passwordConfirmation"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const registerDefaultValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  agreedToTerms: false,
};

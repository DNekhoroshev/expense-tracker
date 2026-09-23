import Link from "next/link";

import { LoginForm } from "@/features/auth/login";
import { ROUTES } from "@/shared/config";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui";

export function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Вход</CardTitle>
        <CardDescription>Введите email и пароль, чтобы войти в Expense Tracker.</CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          Нет аккаунта?{" "}
          <Link href={ROUTES.register} className="text-foreground font-medium underline underline-offset-4">
            Зарегистрируйтесь
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

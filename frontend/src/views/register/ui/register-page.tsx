import Link from "next/link";

import { RegisterForm } from "@/features/auth/register";
import { ROUTES } from "@/shared/config";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui";

export function RegisterPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт, чтобы вести учёт расходов.</CardDescription>
      </CardHeader>

      <CardContent>
        <RegisterForm />
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          Уже есть аккаунт?{" "}
          <Link href={ROUTES.login} className="text-foreground font-medium underline underline-offset-4">
            Войдите
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

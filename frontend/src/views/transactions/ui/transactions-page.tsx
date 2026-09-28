import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { AppHeader } from "@/widgets/app-header";

export function TransactionsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Транзакции</CardTitle>
            <CardDescription>Раздел в разработке.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={ROUTES.home}>На главную</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

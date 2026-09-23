# Expense Tracker

Монорепозиторий трекера расходов.

## Структура

- [`frontend/`](frontend) — Next.js (TypeScript, App Router), пакетный менеджер pnpm.
- [`backend/`](backend) — Spring Boot 4.1.1 (Java 21, Maven), Spring Data JPA, PostgreSQL.

## База данных

PostgreSQL поднимается через Docker Compose:

```bash
docker compose up -d
```

Настройки подключения по умолчанию — в `.env.example` (скопируйте в `.env` и при необходимости измените).

## Фронтенд

Архитектура — [Feature-Sliced Design](https://feature-sliced.design), UI-компоненты — [shadcn/ui](https://ui.shadcn.com) поверх Tailwind CSS v4.
Слои лежат в `frontend/src/`: `app` (роуты Next.js и глобальная настройка), `views` (слой FSD *pages*), `widgets`, `features`, `entities`, `shared`.

Реализованы страницы `/login` и `/register`, работающие с `POST /api/auth/login` и `POST /api/auth/register`.

```bash
cd frontend
pnpm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL — адрес бэкенда
pnpm dev                     # http://localhost:3000
```

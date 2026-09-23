# Новая функциональность - модуль транзакций

## Контекст (что уже есть)
- NestJS + Spring Boot + PostgreSQL + JPA
- Авторизация (JWT), модуль категорий

## Задача
Центральный модуль учёта доходов и расходов.

## Модель данных
Транзакция: id, amount, type (income/expense), description, date, categoryId, userId

## Контроллер
POST /transactions, GET /transactions (агрегация по month/year),
GET /transactions/:id, PATCH /transactions/:id, DELETE /transactions/:id

## Паттерн
- Следуй структуре модуля из backend/src/main/java/com/expensetracker/backend/category

## Ограничения
- Не добавлять зависимости без указания
- После реализации запустить сборку
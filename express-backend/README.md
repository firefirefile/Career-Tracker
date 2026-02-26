# Career Tracker - Backend

Express.js REST API для приложения отслеживания вакансий.

## Технологии

- Express.js
- Node.js
- CORS включен

## API Endpoints

- `GET /api/jobs` - получить все вакансии
- `POST /api/jobs` - создать вакансию
- `GET /api/jobs/:id` - получить вакансию по ID
- `PUT /api/jobs/:id` - обновить вакансию
- `PATCH /api/jobs/:id` - обновить статус
- `DELETE /api/jobs/:id` - удалить вакансию
- `GET /api/jobs/stats` - статистика
- `GET /api/jobs/search` - поиск
- `POST /api/parser/hh-simple` - парсинг вакансии с HH.ru

## Скрипты

```bash
npm start        # Запуск в продакшене
npm run dev      # Запуск с nodemon (dev)
```

Сервер запускается на порту 3000.

# Hockey Social

Веб-приложение для хоккейного сообщества (React + Vite, mock API через MSW).

## Запуск через Docker

Требуется [Docker](https://docs.docker.com/get-docker/) и Docker Compose.

```bash
docker compose up --build
```

Приложение будет доступно по адресу [http://localhost:8080/login](http://localhost:8080/login).

Остановка:

```bash
docker compose down
```

### Сборка образа вручную

```bash
docker build -t hockeynights .
docker run --rm -p 8080:80 hockeynights
```

### Переменные сборки

Переменные `VITE_*` задаются на этапе сборки образа. Для dev/qa стендов по умолчанию - `mock`:

```bash
docker build \
  --build-arg VITE_API_MODE=mock \
  --build-arg VITE_BACKEND_URL=/api/v1 \
  -t hockeynights .
```

Для переключения на backend (Phase 2) измените `VITE_API_MODE` в `docker-compose.yml` и пересоберите образ.

## Локальная разработка

Требуется **Node.js 22+** (`.nvmrc`).

```bash
cd frontend
npm ci          # не npm install - используем lockfile
npm run dev
```

Перед push обязательно прогоните проверки качества - см. раздел **Workflow разработчика** в [frontend/README.md](frontend/README.md).

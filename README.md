# Hockey Social

Веб-приложение для хоккейного сообщества (React + Vite, mock API через MSW).

## Запуск через Docker

Требуется [Docker](https://docs.docker.com/get-docker/) и Docker Compose.

Образ собирается из единственного `frontend/Dockerfile` (контекст `./frontend`). CI/CD и локальная dev-сборка используют один и тот же файл.

### Dev/QA стенды

`docker-compose.yml` **не собирает** приложение из исходников - подтягивает готовый образ из GHCR (или локальный тег через переменную `IMAGE`). Так же работает деплой на Proxmox через GitHub Actions.

```bash
docker compose up
```

Приложение будет доступно по адресу [http://localhost:8081/login](http://localhost:8081/login).

Остановка: `docker compose down`

### Локально без Node.js

`docker-compose.dev.yml` собирает frontend из исходников текущей ветки — для разработчиков, у которых не установлен или не настроен Node.js:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Приложение будет доступно по адресу [http://localhost:8080/login](http://localhost:8080/login).

Остановка: `docker compose -f docker-compose.dev.yml down`

### Сборка образа вручную

```bash
docker build -t hockeynights ./frontend
docker run --rm -p 8081:80 hockeynights
```

### Переменные сборки

Переменные `VITE_*` задаются на этапе сборки образа. Для dev/qa стендов по умолчанию — `mock`:

```bash
docker build \
  --build-arg VITE_API_MODE=mock \
  --build-arg VITE_BACKEND_URL=/api/v1 \
  -t hockeynights ./frontend
```

Для переключения на backend (Phase 2) задайте `VITE_API_MODE=backend` в GitHub environment vars (dev/qa деплой) или в `build.args` файла `docker-compose.dev.yml` (локальная сборка).

## Локальная разработка

Требуется **Node.js 22+** (`.nvmrc`).

```bash
cd frontend
npm ci          # не npm install - используем lockfile
npm run dev
```

Перед push обязательно прогоните проверки качества - см. раздел **Workflow разработчика** в [frontend/README.md](frontend/README.md).

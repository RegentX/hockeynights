# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./

ARG VITE_API_MODE=mock
ARG VITE_BACKEND_URL=/api/v1
ENV VITE_API_MODE=$VITE_API_MODE
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

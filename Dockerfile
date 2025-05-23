# Этап 1: Сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
# Стало:
RUN npm install --omit=dev --legacy-peer-deps

# Копируем остальной проект и собираем
COPY . .
RUN npm run build

# Этап 2: Запуск (только production, без dev-зависимостей)
FROM node:20-alpine AS runner

WORKDIR /app

# Установка только production-зависимостей
COPY package*.json ./
RUN npm install --omit=dev

# Копируем собранное приложение с предыдущего этапа
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/package.json .
COPY --from=builder /app/tsconfig.json .
COPY --from=builder /app/.env .env

# Открываем порт
EXPOSE 3000

# Запуск
CMD ["npm", "start"]

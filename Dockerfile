# Этап 1: Сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и конфиги до установки зависимостей
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./
#COPY .env ./

# Устанавливаем зависимости без dev
RUN npm install --omit=dev --legacy-peer-deps

# Копируем весь остальной проект
COPY . .

# Собираем проект
RUN npm run build

# Этап 2: Запуск
FROM node:20-alpine AS runner

WORKDIR /app

# Копируем зависимости и сборку из builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/next.config.mjs ./
#COPY --from=builder /app/.env ./

# Открываем порт
EXPOSE 3000

# Запуск
CMD ["npm", "start"]

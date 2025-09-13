# Используем официальный Node.js образ как базовый
FROM node:20-alpine AS base

# Установка pnpm
RUN npm install -g pnpm

# Базовые настройки
WORKDIR /app

# Этап установки зависимостей
FROM base AS deps
# Копируем файлы конфигурации пакетов
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Этап сборки приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Создаем production сборку (пропускаем линтинг в Docker для более быстрой сборки)
ENV NEXT_LINT=false
RUN pnpm build

# Production этап
FROM base AS runner
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/public ./public

# Копируем built файлы с правильными разрешениями
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Открываем порт
EXPOSE 3000

# Переменные среды
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Запускаем приложение
CMD ["node", "server.js"]
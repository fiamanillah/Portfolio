# Stage 1: Build the application
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm i -g pnpm && pnpm install

COPY . .
RUN pnpm run build

# Stage 2: Run the application
FROM node:lts-alpine

WORKDIR /app

RUN npm i -g pnpm

ENV NODE_ENV production

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3010

CMD ["pnpm", "start"]
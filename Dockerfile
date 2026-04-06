# Stage 1: Build React client
FROM node:20-alpine AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --production
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server/index.js"]

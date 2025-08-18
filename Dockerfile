# --- Stage 1: Build the React Frontend ---
FROM node:18-alpine AS build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- Stage 2: Setup the Node.js Backend ---
FROM node:18-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=build /app/client/build ./public

# --- Final Configuration ---
EXPOSE 8080
CMD ["node", "server.js"]
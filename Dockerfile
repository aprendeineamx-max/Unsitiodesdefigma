# syntax=docker/dockerfile:1

# --- BUILD STAGE (Client) ---
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY scripts/lab_dashboard/client/package*.json ./
RUN npm install --legacy-peer-deps
COPY scripts/lab_dashboard/client ./
RUN npm run build

# --- BACKEND (Node.js API) ---
FROM node:20-alpine AS backend-runner
WORKDIR /app
# Copy only backend files
COPY scripts/lab_dashboard/server/package*.json ./server/
RUN cd server && npm install --legacy-peer-deps --production

COPY scripts/lab_dashboard/server ./server/
# We don't copy client files here in prod mode, as Nginx serves them.
# But server might check for them, so we can mock or ignore.
# Assuming server in API mode works fine without dist folder.

WORKDIR /app/server
EXPOSE 3000
CMD ["node", "server.js"]

# --- FRONTEND (Nginx) ---
FROM nginx:alpine AS frontend-nginx
COPY nginx.conf /etc/nginx/nginx.conf
# Copy built static files from client-builder stage
COPY --from=client-builder /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

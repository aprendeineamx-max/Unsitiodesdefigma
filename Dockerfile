# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY scripts/lab_dashboard/server/package*.json ./server/
RUN cd server && npm install --legacy-peer-deps

# Copy client files  
COPY scripts/lab_dashboard/client/package*.json ./client/
RUN cd client && npm install --legacy-peer-deps

# Copy all source code
COPY scripts/lab_dashboard/server ./server/
COPY scripts/lab_dashboard/client ./client/

# Build client for production
RUN cd client && npm run build

# Expose ports
EXPOSE 3001 5175

# Start server
WORKDIR /app/server
CMD ["npm", "start"]

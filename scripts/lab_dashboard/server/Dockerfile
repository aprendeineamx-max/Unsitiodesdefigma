FROM node:18-bullseye

# Install System Dependencies (Rclone + Fuse)
RUN apt-get update && apt-get install -y \
    rclone \
    fuse \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Configure Fuse for Docker
# (Note: Container must run with --privileged or --device /dev/fuse --cap-add SYS_ADMIN)
RUN echo "user_allow_other" >> /etc/fuse.conf

WORKDIR /app

# Install App Dependencies
COPY package*.json ./
RUN npm install --production

# Copy App Code
COPY . .

# Create Mount Point
RUN mkdir -p /mnt/cloud

EXPOSE 3000

CMD ["node", "server.js"]

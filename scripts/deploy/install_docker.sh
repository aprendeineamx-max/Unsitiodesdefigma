#!/bin/bash
set -e

echo "🐳 Installing Docker & Dependencies..."

# 1. Update & Install Deps
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# 2. Add Docker Key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 3. Add Repo
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose

# 5. Start & Enable
sudo systemctl start docker
sudo systemctl enable docker

# 6. Setup Directory
sudo mkdir -p /app
sudo chown -R $USER:$USER /app

echo "✅ Docker Installed Successfully!"
docker --version
docker-compose --version

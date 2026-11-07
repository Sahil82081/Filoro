#!/usr/bin/env bash
# ==============================================================================
# Fileora - Automated AWS EC2 One-Click Setup & Deployment Script
# Tested on: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS
# ==============================================================================

set -euo pipefail

echo "=================================================="
echo " Starting Fileora AWS EC2 Deployment Setup"
echo "=================================================="

# 1. Update and upgrade system packages
echo "==> [1/6] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw ca-certificates gnupg lsb-release

# 2. Configure Swap Memory (Critical for EC2 t3.small/t3.medium during OCR & LibreOffice tasks)
if [ ! -f /swapfile ]; then
    echo "==> [2/6] Configuring 2GB Swap space..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap space enabled successfully."
else
    echo "==> [2/6] Swap space already configured."
fi

# 3. Install official Docker Engine and Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo "==> [3/6] Installing Docker Engine..."
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Enable and start Docker service
    sudo systemctl enable docker
    sudo systemctl start docker

    # Add current user to docker group
    sudo usermod -aG docker "$USER"
    echo "Docker installed successfully."
else
    echo "==> [3/6] Docker is already installed."
fi

# 4. Configure UFW Firewall
echo "==> [4/6] Configuring firewall rules (SSH:22, HTTP:80, HTTPS:443)..."
sudo ufw allow OpenSSH || sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable || true

# 5. Prepare Environment file if missing
echo "==> [5/6] Checking configuration..."
if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env from .env.example"
fi

# 6. Build and launch Docker containers
echo "==> [6/6] Building and starting Fileora containers..."
sudo docker compose down --remove-orphans || true
sudo docker compose build --no-cache
sudo docker compose up -d

echo ""
echo "=================================================="
echo " Fileora Deployment Complete!"
echo "=================================================="
echo "Containers status:"
sudo docker compose ps
echo ""
echo "Public URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me || echo '<Your-EC2-Public-IP>')"
echo "To view backend logs:  sudo docker compose logs -f backend"
echo "To view frontend logs: sudo docker compose logs -f frontend"
echo "=================================================="

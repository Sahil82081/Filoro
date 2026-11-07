# AWS EC2 Deployment Guide for Fileora

Complete step-by-step production deployment guide for running the **Fileora** full-stack application (React 18 + Vite SPA frontend, Node.js + Express backend, QPDF, Poppler pdftoppm, Ghostscript, Tesseract OCR, and LibreOffice) on **Amazon Web Services (AWS) EC2** using Docker and Docker Compose.

---

## Architecture Overview

```
                        [ Internet Traffic ]
                                 │
                         (Port 80 / Port 443)
                                 ▼
                     ┌───────────────────────┐
                     │   fileora-frontend    │
                     │    (Nginx:Alpine)     │
                     └───────────┬───────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
   Static SPA Assets                            Proxy Pass /api/*
 (React 18 + Vite Dist)                     (Streaming & File Uploads)
           │                                           │
           │                                           ▼
           │                                ┌───────────────────────┐
           │                                │    fileora-backend    │
           │                                │ (Node 20 Bookworm)    │
           │                                └───────────┬───────────┘
           │                                            │
           │                      ┌─────────────────────┼─────────────────────┐
           │                      ▼                     ▼                     ▼
           │                    QPDF                 Poppler             LibreOffice
           │                (Linearize/FLATE)      (pdftoppm)          (Headless Docs)
           │                      │                     │                     │
           │                      ▼                     ▼                     ▼
           │                 Ghostscript            Tesseract            Sharp/Images
           │               (Optimizations)        (OCR Engine)         (Transformations)
           │                      │                     │                     │
           └──────────────────────┴─────────────────────┴─────────────────────┘
                                                        │
                                            ┌───────────┴───────────┐
                                            │ Named Docker Volumes  │
                                            │ (fileora_uploads &    │
                                            │  fileora_outputs)     │
                                            └───────────────────────┘
```

---

## 1. Recommended EC2 Instance Requirements

Because Fileora runs native image processing (`Sharp`), PDF rendering (`pdftoppm`), headless office document conversion (`LibreOffice`), and OCR (`Tesseract`), choose an instance with adequate RAM:

| Instance Type | vCPU | RAM | Recommendation | Notes |
|---|---|---|---|---|
| **t3.medium** | 2 | 4 GiB | **Recommended for Production** | Smooth performance across all PDF, Office, and OCR operations. |
| **t3.small** | 2 | 2 GiB | Good for budget / staging | Requires configuring 2GB swap space (automated by our script). |
| **t3.micro** | 2 | 1 GiB | Not recommended | Risk of OOM during LibreOffice conversions unless heavy swap is used. |

- **Storage:** 20 GB to 30 GB `gp3` EBS volume (for Docker images, Linux tool packages, and temporary staging).
- **Operating System:** Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (64-bit x86 / amd64).

---

## 2. Launching the EC2 Instance

1. Log into your **AWS Management Console** and navigate to **EC2** > **Launch Instances**.
2. **Name:** `fileora-app` (or any preferred name).
3. **Application and OS Images:** Select **Ubuntu** (Ubuntu Server 24.04 LTS or 22.04 LTS, 64-bit x86).
4. **Instance Type:** Select `t3.medium` (or `t3.small`).
5. **Key Pair:** Select an existing key pair or create a new `.pem` key (e.g. `fileora-key.pem`).
6. **Network Settings / Security Group:**
   Create a Security Group with the following inbound rules:

   | Type | Protocol | Port Range | Source | Purpose |
   |---|---|---|---|---|
   | **SSH** | TCP | `22` | Your IP (or `0.0.0.0/0`) | SSH Remote Access |
   | **HTTP** | TCP | `80` | `0.0.0.0/0` (Anywhere) | Public Web Access |
   | **HTTPS** | TCP | `443` | `0.0.0.0/0` (Anywhere) | SSL / Secure Web Access |
   | **Custom TCP** | TCP | `5000` | Optional (Your IP) | Optional direct API testing |

7. **Configure Storage:** Change `8 GiB` to **`25 GiB` gp3**.
8. Click **Launch Instance**.

---

## 3. Connecting to your EC2 Instance

Once the instance state is **Running**, find its **Public IPv4 Address** (e.g. `54.210.12.34`).

On your local machine (Terminal or PowerShell):

```bash
# Set key file permissions (macOS / Linux)
chmod 400 fileora-key.pem

# Connect to EC2
ssh -i fileora-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

---

## 4. Deploying the Application

### Option A: Automated One-Click Setup (Recommended)

1. Clone or transfer your repository to the EC2 instance:

   ```bash
   git clone <YOUR-REPOSITORY-URL> fileora
   cd fileora
   ```

2. Make the deployment script executable and run it:

   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```

   **What `deploy-ec2.sh` does automatically:**
   - Updates all Ubuntu packages.
   - Allocates and configures a **2GB swap file** to guarantee no memory crashes during heavy conversions.
   - Installs the latest official Docker Engine and Docker Compose plugin.
   - Configures the UFW firewall for ports 22, 80, and 443.
   - Creates `.env` from `.env.example`.
   - Builds both containers and launches them in detached mode (`docker compose up -d`).

---

### Option B: Manual Setup Step-by-Step

If you prefer to run each step manually:

#### 1. Setup 2GB Swap Memory:
```bash
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### 2. Install Docker & Docker Compose:
```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
```

*Note: If you run `docker` commands without sudo, logout and log back in for group membership to take effect.*

#### 3. Prepare Environment & Launch:
```bash
cp .env.example .env
sudo docker compose up -d --build
```

---

## 5. Verifying Deployment

Run the following commands on your EC2 instance:

```bash
# Check container status (both should be Healthy)
sudo docker compose ps

# View backend logs
sudo docker compose logs -f backend

# View frontend / Nginx logs
sudo docker compose logs -f frontend

# Test backend health locally
curl http://localhost:5000/api/health
```

Expected health check response:
```json
{"status":"ok","timestamp":"2026-11-06T14:50:00.000Z"}
```

Open your browser and navigate to:
```
http://<YOUR-EC2-PUBLIC-IP>
```

Your Fileora website will load with full functionality: PDF tools, Image conversion, Document optimization, OCR extraction, and Batch processing.

---

## 6. Configuring a Custom Domain & Free SSL (HTTPS)

To serve your application securely over `https://yourdomain.com`:

### Option A: Using AWS Application Load Balancer (ALB) + ACM (Easiest)
1. In AWS EC2 console, create an **Application Load Balancer**.
2. Request a free SSL certificate in **AWS Certificate Manager (ACM)** for `yourdomain.com`.
3. Add a listener on Port 443 forwarding to Port 80 on your EC2 instance target group.
4. Point your domain's DNS A/CNAME record to the ALB DNS name.

---

### Option B: Using Certbot (Let's Encrypt) directly on EC2

1. Point your domain's DNS `A` record (e.g. `tools.yourdomain.com`) to your EC2 Public IP address.
2. Install Certbot on the EC2 host:
   ```bash
   sudo apt-get install -y certbot
   ```
3. Temporarily stop the frontend container:
   ```bash
   sudo docker compose stop frontend
   ```
4. Obtain the SSL certificate:
   ```bash
   sudo certbot certonly --standalone -d tools.yourdomain.com
   ```
5. Update `docker-compose.yml` to mount the certificates:
   ```yaml
   frontend:
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - /etc/letsencrypt:/etc/letsencrypt:ro
   ```
6. Add the SSL server block in `frontend/nginx.conf`:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name tools.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/tools.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/tools.yourdomain.com/privkey.pem;

       # ... remaining configuration as in default.conf
   }
   ```
7. Rebuild and launch:
   ```bash
   sudo docker compose up -d --build frontend
   ```

---

## 7. Useful Operational Commands

| Action | Command |
|---|---|
| **View real-time logs** | `sudo docker compose logs -f` |
| **Restart services** | `sudo docker compose restart` |
| **Stop services** | `sudo docker compose down` |
| **Rebuild after Git pull** | `git pull && sudo docker compose up -d --build` |
| **Inspect disk space** | `sudo docker system df` |
| **Clean dangling images** | `sudo docker image prune -f` |
| **Inspect memory & swap** | `free -h` |

---

## 8. Summary of Included Docker Files

- **`backend/Dockerfile`**: Debian Bookworm-based multi-stage container with `qpdf`, `poppler-utils`, `ghostscript`, `tesseract-ocr`, `libreoffice`, and non-root execution.
- **`frontend/Dockerfile`**: Multi-stage build with Vite compiling React SPA, served by production-tuned `nginx:alpine`.
- **`frontend/nginx.conf`**: Configures gzip compression, SPA history fallback routing, 60MB max body size, and reverse proxy for `/api/`.
- **`docker-compose.yml`**: Root orchestration orchestrating frontend and backend services, internal networking, healthchecks, and staging volumes.
- **`deploy-ec2.sh`**: Automated provisioning script for Ubuntu EC2 instances.

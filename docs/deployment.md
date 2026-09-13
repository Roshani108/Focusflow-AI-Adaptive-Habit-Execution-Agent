# FocusFlow AI - Linux & Cloud Deployment Guide

This guide details deploying FocusFlow AI to a Linux Ubuntu 22.04+ server using Docker Compose or native services.

---

## 1. Quick Production Deployment with Docker Compose

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/your-username/focusflow-ai.git
cd focusflow-ai
cp .env.example .env
nano .env  # Update JWT_SECRET and database passwords
```

### Step 2: Launch All Containers
```bash
docker compose up -d --build
```

### Step 3: Seed Initial Demo Data (Optional)
```bash
docker compose exec api python seed.py
```

### Step 4: Verify Running Services
```bash
docker compose ps
```
Ports exposed:
- Web App: `http://<SERVER_IP>:3000`
- FastAPI Backend: `http://<SERVER_IP>:8000`
- Notification Service: `http://<SERVER_IP>:4000`

---

## 2. Linux Systemd Native Setup (Alternative to Docker)

If deploying natively without Docker:

### 1. PostgreSQL & Redis
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib redis-server python3-pip nodejs npm
```

### 2. FastAPI Systemd Service (`/etc/systemd/system/focusflow-api.service`)
```ini
[Unit]
Description=FocusFlow AI FastAPI Application
After=network.target postgresql.service redis-server.service

[Service]
User=ubuntu
WorkingDirectory=/var/www/focusflow-ai/services/api
EnvironmentFile=/var/www/focusflow-ai/.env
ExecStart=/home/ubuntu/.local/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

### 3. Notification Worker Systemd Service (`/etc/systemd/system/focusflow-worker.service`)
```ini
[Unit]
Description=FocusFlow Notification Worker
After=network.target focusflow-api.service

[Service]
User=ubuntu
WorkingDirectory=/var/www/focusflow-ai/services/notification-service
EnvironmentFile=/var/www/focusflow-ai/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now focusflow-api focusflow-worker
```

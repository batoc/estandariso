#!/bin/bash
set -e

# ============================================
# EstandarISO - Server Setup Script
# Run this ONCE on a fresh Hetzner CPX11 server
# Usage: ssh root@178.156.250.64 'bash -s' < deploy/setup-server.sh
# ============================================

echo "=== EstandarISO Server Setup ==="

# 1. Update system
apt-get update && apt-get upgrade -y

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Install PM2 for process management
npm install -g pm2

# 4. Install Caddy (reverse proxy with auto HTTPS)
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# 5. Install unzip (for PocketBase)
apt-get install -y unzip git

# 6. Create app directory and clone repo
mkdir -p /opt/estandariso
cd /opt/estandariso

if [ ! -d ".git" ]; then
  git clone https://github.com/batoc/estandariso.git .
fi

# 7. Setup PocketBase
cd /opt/estandariso/back
if [ ! -f "pocketbase" ]; then
  curl -L -o pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v0.25.9/pocketbase_0.25.9_linux_amd64.zip"
  unzip pocketbase.zip
  rm pocketbase.zip
  chmod +x pocketbase
fi

# 8. Create PocketBase systemd service
cat > /etc/systemd/system/pocketbase.service << 'EOF'
[Unit]
Description=PocketBase - EstandarISO Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/estandariso/back
ExecStart=/opt/estandariso/back/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable pocketbase
systemctl start pocketbase

# 9. Setup Frontend
cd /opt/estandariso/front

# Create production .env
cat > .env.local << 'EOF'
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
EOF

npm ci
npm run build

# 10. Start frontend with PM2
pm2 start npm --name "estandariso-front" -- start -- -p 3000
pm2 save
pm2 startup systemd -u root --hp /root

# 11. Configure Caddy reverse proxy
cat > /etc/caddy/Caddyfile << 'EOF'
:80 {
    # Frontend
    handle /* {
        reverse_proxy localhost:3000
    }

    # PocketBase API
    handle /api/* {
        reverse_proxy localhost:8090
    }

    # PocketBase Admin UI
    handle /_/* {
        reverse_proxy localhost:8090
    }
}
EOF

systemctl restart caddy

# 12. Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "=== Setup Complete ==="
echo "Frontend: http://178.156.250.64"
echo "PocketBase Admin: http://178.156.250.64/_/"
echo ""
echo "IMPORTANT: First visit PocketBase Admin to create admin account!"
echo ""

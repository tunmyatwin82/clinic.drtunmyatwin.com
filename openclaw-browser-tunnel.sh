#!/bin/bash
# OpenClaw Browser Control - SSH Tunnel Setup
# This script creates SSH tunnels to access OpenClaw browser control

SERVER_IP="157.245.194.75"
SSH_KEY="$HOME/DigitalOcean-OpenClaw/ssh/id_ed25519"
USER="root"

# Ports to forward
GATEWAY_PORT=18789
BROWSER_PORT=18792

echo "🦞 OpenClaw Browser Control - SSH Tunnel Setup"
echo "==============================================="
echo ""
echo "Creating SSH tunnels to access OpenClaw browser control..."
echo ""

# Kill any existing tunnels on these ports
pkill -f "ssh.*18789:127.0.0.1:18789" 2>/dev/null
pkill -f "ssh.*18792:127.0.0.1:18792" 2>/dev/null

# Create SSH tunnels in background
echo "Starting SSH tunnels..."
echo "  - Gateway:    http://localhost:$GATEWAY_PORT"
echo "  - Browser:    http://localhost:$BROWSER_PORT"
echo ""

# Combined tunnel command
ssh -i "$SSH_KEY" -f -N \
    -L $GATEWAY_PORT:127.0.0.1:$GATEWAY_PORT \
    -L $BROWSER_PORT:127.0.0.1:$BROWSER_PORT \
    $USER@$SERVER_IP

if [ $? -eq 0 ]; then
    echo "✅ SSH tunnels created successfully!"
    echo ""
    echo "📋 Access URLs:"
    echo "   OpenClaw Gateway:  http://localhost:$GATEWAY_PORT/?token=MySecureToken2026"
    echo "   Browser DevTools:  http://localhost:$BROWSER_PORT"
    echo "   DevTools WebSocket: ws://localhost:$BROWSER_PORT/devtools/browser/..."
    echo ""
    echo "🔐 Authentication Token: MySecureToken2026"
    echo ""
    echo "💡 To use with OpenClaw CLI:"
    echo "   export OPENCLAW_GATEWAY_URL=http://localhost:$GATEWAY_PORT"
    echo "   export OPENCLAW_GATEWAY_TOKEN=MySecureToken2026"
    echo ""
    echo "🛑 To stop tunnels: pkill -f 'ssh.*18789:127.0.0.1:18789'"
else
    echo "❌ Failed to create SSH tunnels"
    exit 1
fi

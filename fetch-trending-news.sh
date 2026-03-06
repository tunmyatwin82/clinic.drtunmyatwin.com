#!/bin/bash
# OpenClaw - Fetch Trending News Script
# This script uses OpenClaw browser control to fetch trending news from the internet

GATEWAY_URL="http://localhost:18789"
GATEWAY_TOKEN="MySecureToken2026"
BROWSER_PORT="18792"

# WebSocket debugger URL
WS_URL="ws://localhost:$BROWSER_PORT/devtools/browser/99530e41-c7ba-494e-bfdf-0e125192a13c"

echo "📰 OpenClaw - Trending News Fetcher"
echo "===================================="
echo ""

# Function to send CDP command via WebSocket
send_cdp_command() {
    local method="$1"
    local params="$2"
    local request_id="$3"
    
    echo "{\"id\":$request_id,\"method\":\"$method\",\"params\":$params}"
}

# Check if browser is accessible
echo "🔍 Checking browser connection..."
BROWSER_STATUS=$(curl -s http://localhost:$BROWSER_PORT/json/version)
if [ -z "$BROWSER_STATUS" ]; then
    echo "❌ Browser not accessible. Make sure SSH tunnel is running."
    exit 1
fi
echo "✅ Browser connected: $(echo $BROWSER_STATUS | grep -o '"Browser":"[^"]*"')"

# Get current pages
echo ""
echo "📋 Current browser pages:"
curl -s http://localhost:$BROWSER_PORT/json/list | grep -o '"title":"[^"]*","type":"page"' | head -5

echo ""
echo "🌐 To fetch trending news, you can:"
echo "   1. Use the OpenClaw Control UI: http://localhost:$GATEWAY_URL/?token=$GATEWAY_TOKEN"
echo "   2. Navigate to news sites like:"
echo "      - https://t.me/s/elevenmyanmar (Eleven Myanmar Telegram)"
echo "      - https://t.me/s/mrtvnews (MRTV News Telegram)"
echo "      - https://news.google.com (Google News)"
echo "      - https://www.bbc.com/news (BBC News)"
echo ""
echo "💡 Example using CDP to navigate to a Telegram channel:"
echo "   OpenClaw can navigate to https://t.me/s/CHANNEL_NAME to view public channel content"

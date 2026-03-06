# OpenClaw Browser Control Setup

## Server Information

- **Server IP**: 157.245.194.75
- **Provider**: Digital Ocean
- **OpenClaw Version**: 2026.1.29
- **OS**: Ubuntu 24.04.3 LTS

## Services Running

| Service | Port | Description |
|---------|------|-------------|
| OpenClaw Gateway | 18789 | Main control interface |
| Chromium Browser | 18792 | Headless browser with DevTools |
| SSH | 22 | Server access |

## Quick Start

### 1. Start SSH Tunnel

Run the tunnel script to access browser control locally:

```bash
./openclaw-browser-tunnel.sh
```

Or manually:

```bash
ssh -i ~/DigitalOcean-OpenClaw/ssh/id_ed25519 -f -N \
    -L 18789:127.0.0.1:18789 \
    -L 18792:127.0.0.1:18792 \
    root@157.245.194.75
```

### 2. Access OpenClaw Control UI

Open your browser and navigate to:
- **Control UI (with token)**: http://localhost:18789/?token=MySecureToken2026
- **Browser DevTools**: http://localhost:18792

> **Note**: The token parameter is required for WebSocket authentication. You can also open http://localhost:18789 and paste the token in Settings.

### 3. Authentication

- **Token**: `MySecureToken2026`

## Configuration

### OpenClaw Config Location

```
~/.openclaw/openclaw.json
```

### Current Configuration

```json
{
  "browser": {
    "enabled": true,
    "executablePath": "/snap/bin/chromium",
    "headless": true,
    "defaultProfile": "cdp",
    "profiles": {
      "cdp": {
        "cdpUrl": "http://127.0.0.1:18792",
        "color": "#0066CC"
      }
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "MySecureToken2026"
    }
  }
}
```

## Server Management

### SSH Access

```bash
ssh -i ~/DigitalOcean-OpenClaw/ssh/id_ed25519 root@157.245.194.75
```

### Start Services

```bash
# Start Chromium browser
nohup /snap/bin/chromium --headless=new --disable-gpu \
    --remote-debugging-port=18792 --no-sandbox \
    --disable-dev-shm-usage --noerrdialogs --no-first-run \
    > /tmp/chromium.log 2>&1 &

# Start OpenClaw Gateway
nohup openclaw gateway > /tmp/openclaw.log 2>&1 &
```

### Check Service Status

```bash
# Check ports
ss -tlnp | grep -E '18789|18792'

# Check processes
ps aux | grep -E 'chromium|openclaw'
```

### Stop Services

```bash
# Stop gateway
pkill -f 'openclaw.*gateway'

# Stop chromium
pkill -f chromium
```

## Browser Control API

### Get Browser Version

```bash
curl http://localhost:18792/json/version
```

### List Open Pages

```bash
curl http://localhost:18792/json/list
```

### WebSocket Connection

Connect to the browser via WebSocket:
```
ws://localhost:18792/devtools/browser/<session-id>
```

## Troubleshooting

### Port Already in Use

If ports are already bound, kill existing processes:

```bash
pkill -f 'ssh.*18789:127.0.0.1:18789'
pkill -f 'ssh.*18792:127.0.0.1:18792'
```

### Chromium Not Starting

Check the log file:
```bash
cat /tmp/chromium.log
```

### Gateway Not Starting

Check the log file:
```bash
cat /tmp/openclaw.log
```

## Security Notes

1. The gateway is bound to `loopback` (127.0.0.1) for security
2. External access requires SSH tunnel
3. Authentication token is required for API access
4. Keep the SSH key secure at `~/DigitalOcean-OpenClaw/ssh/id_ed25519`

## Files Created

- `openclaw-browser-tunnel.sh` - SSH tunnel setup script
- `OPENCLAW_BROWSER_CONTROL.md` - This documentation file

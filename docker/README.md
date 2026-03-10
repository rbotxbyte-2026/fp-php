# FP Spoof Docker

Dynamic fingerprint spoofing for Android using Docker + Redroid.

## Overview

This setup runs a real Android environment in Docker and applies fingerprint spoofing from `original.json`:

1. **ADB Properties** - Device-level spoofing (undetectable)
2. **Redroid Config** - Screen/hardware configuration
3. **CDP Injection** - JavaScript-level spoofing for remaining parameters

## Quick Start

```bash
# From the docker directory
cd docker

# Start with your profile
docker-compose up -d

# Or specify a custom profile
PROFILE_PATH=/path/to/profile.json docker-compose up -d
```

## Directory Structure

```
docker/
├── docker-compose.yml    # Docker services definition
├── Dockerfile            # Controller container
├── package.json          # Node.js dependencies
├── entrypoint.sh         # Main entry point
├── setup-device.js       # ADB property configuration
├── cdp-inject.js         # CDP fingerprint injection
├── inject-script.js      # Template injection script
├── utils.js              # Helper functions
└── profiles/             # Profile storage (mounted)
    └── original.json     # Your fingerprint profile
```

## How It Works

### Layer 1: ADB Properties (Undetectable)

Sets Android system properties that Chrome reads natively:

| Property | Source in original.json |
|----------|------------------------|
| `ro.product.model` | `architecture.uaDataModel` |
| `ro.product.brand` | Derived from model |
| `ro.build.version.release` | Parsed from userAgent |
| `persist.sys.timezone` | `locale.timezone` |
| `persist.sys.locale` | `navigator.language` |

### Layer 2: Redroid Config (Undetectable)

Boot parameters for Android emulator:

| Parameter | Source in original.json |
|-----------|------------------------|
| `redroid_width` | `screen.width × devicePixelRatio` |
| `redroid_height` | `screen.height × devicePixelRatio` |
| `redroid_dpi` | `devicePixelRatio × 160` |

### Layer 3: CDP Injection (Low Detection)

JavaScript-level spoofing for values ADB can't set:

| API | Source in original.json |
|-----|------------------------|
| `navigator.hardwareConcurrency` | `navigator.hardwareConcurrency` |
| `navigator.deviceMemory` | `navigator.deviceMemory` |
| `WebGL.getParameter()` | `webgl.unmaskedVendor/Renderer` |
| `navigator.getBattery()` | `battery.*` |
| RTCPeerConnection | `webrtc.ips` (blocked if empty) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROFILE_PATH` | `/app/profiles/original.json` | Path to fingerprint profile |
| `REDROID_HOST` | `redroid` | Redroid container hostname |
| `REDROID_ADB_PORT` | `5555` | ADB port |
| `CHROME_DEBUG_PORT` | `9222` | Chrome DevTools port |
| `TARGET_URL` | `https://botxbyte.com/fp.php` | URL to navigate to |
| `KEEP_ALIVE` | `false` | Keep container running |

## Manual Usage

### Connect to Android

```bash
# Connect ADB
adb connect localhost:5555

# Open shell
adb shell

# Check properties
adb shell getprop ro.product.model
```

### Run Setup Separately

```bash
# Set device properties only
node setup-device.js

# Run CDP injection only
node cdp-inject.js
```

### Install Chrome APK

```bash
# Download Chrome ARM64 APK from apkmirror.com
# Then install:
adb install chrome-arm64-v145.apk
```

## Detection Coverage

| Category | Method | Detectable? |
|----------|--------|-------------|
| Device Model | ADB | ✅ Undetectable |
| OS Version | ADB | ✅ Undetectable |
| Timezone | ADB | ✅ Undetectable |
| Locale | ADB | ✅ Undetectable |
| Screen Size | Redroid | ✅ Undetectable |
| DPI | Redroid | ✅ Undetectable |
| hardwareConcurrency | CDP | ⚠️ Low risk |
| deviceMemory | CDP | ⚠️ Low risk |
| WebGL Vendor | CDP | ⚠️ Low risk |
| Battery | CDP | ⚠️ Low risk |
| WebRTC IPs | CDP | ⚠️ Low risk |
| Canvas Hash | — | ❌ Cannot spoof |
| Audio Hash | — | ❌ Cannot spoof |

## Troubleshooting

### ADB Connection Fails

```bash
# Kill ADB server and reconnect
adb kill-server
adb connect localhost:5555
```

### Chrome Not Starting

```bash
# Check if Chrome is installed
adb shell pm list packages | grep chrome

# Start Chrome manually
adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main
```

### CDP Connection Fails

```bash
# Check port forwarding
adb forward tcp:9222 localabstract:chrome_devtools_remote

# Verify Chrome DevTools
curl http://localhost:9222/json
```

## License

MIT

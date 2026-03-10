#!/bin/bash
# entrypoint.sh
# Main entry point for the FP Spoof Docker controller

set -e

echo "========================================"
echo "  FP Spoof Docker Controller"
echo "========================================"
echo ""

PROFILE_PATH=${PROFILE_PATH:-/app/profiles/original.json}
REDROID_HOST=${REDROID_HOST:-localhost}
REDROID_ADB_PORT=${REDROID_ADB_PORT:-5555}
CHROME_DEBUG_PORT=${CHROME_DEBUG_PORT:-9222}
TARGET_URL=${TARGET_URL:-https://botxbyte.com/fp.php}

echo "Configuration:"
echo "  Profile:     $PROFILE_PATH"
echo "  Redroid:     $REDROID_HOST:$REDROID_ADB_PORT"
echo "  Chrome Port: $CHROME_DEBUG_PORT"
echo "  Target URL:  $TARGET_URL"
echo ""

# Wait for Redroid to be ready
echo "Waiting for Redroid to start..."
sleep 10

# Connect to ADB
echo "Connecting to ADB..."
max_retries=30
retry=0
while [ $retry -lt $max_retries ]; do
    if adb connect $REDROID_HOST:$REDROID_ADB_PORT 2>/dev/null | grep -q "connected"; then
        echo "ADB connected successfully"
        break
    fi
    echo "Waiting for ADB... ($((retry+1))/$max_retries)"
    sleep 2
    retry=$((retry+1))
done

if [ $retry -eq $max_retries ]; then
    echo "Failed to connect to ADB"
    exit 1
fi

# Wait for device to boot
echo "Waiting for device to boot..."
retry=0
while [ $retry -lt 60 ]; do
    boot_completed=$(adb -s $REDROID_HOST:$REDROID_ADB_PORT shell getprop sys.boot_completed 2>/dev/null || echo "")
    if [ "$boot_completed" = "1" ]; then
        echo "Device booted successfully"
        break
    fi
    echo "Waiting for boot... ($((retry+1))/60)"
    sleep 2
    retry=$((retry+1))
done

# Get root access
echo "Getting root access..."
adb -s $REDROID_HOST:$REDROID_ADB_PORT root 2>/dev/null || true
sleep 3

# Reconnect after root (connection drops when adbd restarts)
echo "Reconnecting to ADB after root..."
adb disconnect $REDROID_HOST:$REDROID_ADB_PORT 2>/dev/null || true
sleep 2
retry=0
while [ $retry -lt 30 ]; do
    if adb connect $REDROID_HOST:$REDROID_ADB_PORT 2>/dev/null | grep -q "connected"; then
        echo "ADB reconnected successfully"
        break
    fi
    echo "Reconnecting... ($((retry+1))/30)"
    sleep 2
    retry=$((retry+1))
done

# Run device setup (ADB properties)
echo ""
echo "Running device setup..."
node /app/setup-device.js

# Check for browser installation
echo ""
echo "Checking browser installation..."
packages=$(adb -s $REDROID_HOST:$REDROID_ADB_PORT shell pm list packages)
browser_found=false

for pkg in "org.chromium.chrome" "com.android.chrome" "org.chromium.webview_shell" "org.mozilla.fennec_fdroid"; do
    if echo "$packages" | grep -q "$pkg"; then
        echo "Found browser: $pkg"
        browser_found=true
        break
    fi
done

if [ "$browser_found" = "false" ]; then
    echo "WARNING: No supported browser found!"
    echo "The fingerprint test may fail."
    echo ""
    echo "Installed packages:"
    echo "$packages" | head -20
else
    echo "Browser is installed"
fi

# Forward Chrome debug port
echo ""
echo "Forwarding Chrome debug port..."
adb -s $REDROID_HOST:$REDROID_ADB_PORT forward tcp:$CHROME_DEBUG_PORT localabstract:chrome_devtools_remote 2>/dev/null || true

# Run CDP injection
echo ""
echo "Running CDP injection..."
node /app/cdp-inject.js

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Chrome is running with spoofed fingerprint at: $TARGET_URL"
echo ""
echo "To access Android:"
echo "  adb connect $REDROID_HOST:$REDROID_ADB_PORT"
echo "  adb shell"
echo ""
echo "To view Chrome DevTools:"
echo "  Open http://localhost:$CHROME_DEBUG_PORT in your browser"
echo ""

# Keep container running
if [ "$KEEP_ALIVE" = "true" ]; then
    echo "Keeping container alive..."
    tail -f /dev/null
fi

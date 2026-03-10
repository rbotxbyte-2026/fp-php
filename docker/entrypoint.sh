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
sleep 2

# Run device setup (ADB properties)
echo ""
echo "Running device setup..."
node /app/setup-device.js

# Install Chrome if not installed
echo ""
echo "Checking Chrome installation..."
chrome_installed=$(adb -s $REDROID_HOST:$REDROID_ADB_PORT shell pm list packages | grep -c "com.android.chrome" || echo "0")
if [ "$chrome_installed" = "0" ]; then
    echo "Chrome not installed. Please install Chrome APK manually."
    echo "You can download from: https://www.apkmirror.com/apk/google-inc/chrome/"
    echo ""
    echo "To install:"
    echo "  adb install chrome-arm64.apk"
else
    echo "Chrome is installed"
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

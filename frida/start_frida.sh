#!/bin/bash
# Start frida-server on Android device

echo "Starting server..."

# Check device
DEVICE=$(adb devices | grep -v "List" | grep "device" | head -1 | awk '{print $1}')
if [ -z "$DEVICE" ]; then
    echo "❌ No device connected!"
    exit 1
fi

# Find server binary (check renamed first, then original)
if adb shell "[ -f /data/local/tmp/srv64 ]" 2>/dev/null; then
    SERVER="srv64"
elif adb shell "[ -f /data/local/tmp/frida-server ]" 2>/dev/null; then
    SERVER="frida-server"
else
    echo "❌ Server not found. Run: ./setup.sh"
    exit 1
fi

# Kill existing
adb shell su -c "pkill -f $SERVER" 2>/dev/null || true
adb shell su -c "pkill -f frida-server" 2>/dev/null || true
sleep 1

# Start server
adb shell su -c "/data/local/tmp/$SERVER &"
sleep 2

# Verify
if adb shell su -c "pidof $SERVER" 2>/dev/null; then
    echo "✓ Server running ($SERVER)"
else
    echo "❌ Failed to start. Check root access."
    exit 1
fi

# Test connection from Mac
echo ""
echo "Testing Frida connection..."
if frida-ps -U &>/dev/null; then
    echo "✓ Frida connected successfully!"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "   READY!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "Now run:"
    echo "  ./hook_chrome.sh"
    echo ""
    echo "Or:"
    echo "  frida -U -f com.android.chrome -l combined.js --no-pause"
    echo ""
else
    echo "❌ Cannot connect to Frida"
    echo ""
    echo "Try:"
    echo "1. Check USB connection"
    echo "2. Restart adb: adb kill-server && adb start-server"
fi

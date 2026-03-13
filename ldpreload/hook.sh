#!/bin/bash
# Enable/disable LD_PRELOAD hook for Android apps
# Usage: ./hook.sh <package.name> <32|64|unhook>

PKG="$1"
ARCH="$2"

if [ -z "$PKG" ] || [ -z "$ARCH" ]; then
    echo "Usage: $0 <package.name> <32|64|unhook>"
    echo ""
    echo "Examples:"
    echo "  $0 com.android.chrome 64        # Hook Chrome 64-bit"
    echo "  $0 com.android.chrome 32        # Hook Chrome 32-bit"
    echo "  $0 com.android.chrome unhook    # Remove hook"
    echo ""
    echo "Common packages:"
    echo "  com.android.chrome              - Chrome"
    echo "  com.chrome.beta                 - Chrome Beta"
    echo "  com.chrome.dev                  - Chrome Dev"
    echo "  com.brave.browser               - Brave"
    echo "  org.mozilla.firefox             - Firefox"
    exit 1
fi

LIB_PATH="/data/local/tmp/libfpspoof.so"

# Check if library exists on device
echo "Checking for library on device..."
adb shell "[ -f $LIB_PATH ]" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Library not found on device. Pushing..."
    
    if [ "$ARCH" = "64" ]; then
        adb push libs/arm64-v8a/libfpspoof.so "$LIB_PATH"
    elif [ "$ARCH" = "32" ]; then
        adb push libs/armeabi-v7a/libfpspoof.so "$LIB_PATH"
    fi
    
    adb shell chmod 755 "$LIB_PATH"
fi

if [ "$ARCH" = "unhook" ]; then
    echo "Removing hook for $PKG..."
    adb shell su -c "
        # Clear wrap property
        setprop wrap.$PKG ''
        
        # Force stop app
        am force-stop $PKG
    "
    echo "Hook removed. Restart $PKG normally."
    exit 0
fi

echo "Setting SELinux to permissive (required for LD_PRELOAD)..."
adb shell su -c "setenforce 0" 2>/dev/null || echo "Warning: Could not set SELinux mode"

echo "Enabling hook for $PKG ($ARCH-bit)..."
adb shell su -c "
    # Force stop the app first
    am force-stop $PKG
    
    # Set wrap property for LD_PRELOAD
    setprop wrap.$PKG 'LD_PRELOAD=$LIB_PATH'
    
    # Verify
    echo 'wrap.$PKG = '
    getprop wrap.$PKG
"

echo ""
echo "Hook enabled! Starting $PKG..."

# Try to start the app
adb shell su -c "
    # Try common activity names
    am start -n $PKG/.MainActivity 2>/dev/null || \
    am start -n $PKG/.Main 2>/dev/null || \
    am start -n $PKG/com.google.android.apps.chrome.Main 2>/dev/null || \
    monkey -p $PKG -c android.intent.category.LAUNCHER 1 2>/dev/null
"

echo ""
echo "Done! Check logcat for FPSpoof messages:"
echo "  adb logcat -s FPSpoof:V"

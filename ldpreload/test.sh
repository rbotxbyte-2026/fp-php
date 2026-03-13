#!/bin/bash
# Test the LD_PRELOAD hook locally first

cd "$(dirname "$0")"

echo "=== LD_PRELOAD Fingerprint Spoofer ==="
echo ""

# Check if NDK is available
if [ -z "$ANDROID_NDK" ]; then
    # Try to find it
    for path in \
        "$HOME/Library/Android/sdk/ndk"/* \
        "$HOME/Android/Sdk/ndk"/* \
        "/opt/android-ndk"*; do
        if [ -d "$path/toolchains" ]; then
            export ANDROID_NDK="$path"
            break
        fi
    done
fi

if [ -z "$ANDROID_NDK" ]; then
    echo "Android NDK not found!"
    echo ""
    echo "Install options:"
    echo ""
    echo "1. Via Android Studio:"
    echo "   SDK Manager → SDK Tools → NDK"
    echo ""
    echo "2. Via Homebrew (macOS):"
    echo "   brew install --cask android-ndk"
    echo ""
    echo "3. Direct download:"
    echo "   https://developer.android.com/ndk/downloads"
    echo ""
    echo "Then set: export ANDROID_NDK=/path/to/ndk"
    exit 1
fi

echo "Found NDK: $ANDROID_NDK"
echo ""

# Build
echo "Building..."
chmod +x build.sh
./build.sh

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo ""
echo "=== Setup Instructions ==="
echo ""
echo "1. Connect rooted Android device via USB"
echo "2. Enable USB debugging"
echo "3. Run: adb devices"
echo ""
echo "4. Push library to device:"
echo "   adb push libs/arm64-v8a/libfpspoof.so /data/local/tmp/"
echo ""
echo "5. Set SELinux to permissive (one-time):"
echo "   adb shell su -c 'setenforce 0'"
echo ""
echo "6. Hook Chrome:"
echo "   ./hook.sh com.android.chrome 64"
echo ""
echo "7. Watch logs:"
echo "   adb logcat -s FPSpoof:V"
echo ""
echo "=== Limitations ==="
echo ""
echo "⚠️  Chrome's renderer process may not receive LD_PRELOAD"
echo "    (Chrome uses isolated process sandboxing)"
echo ""
echo "⚠️  Works best with apps using Android WebView, not Chrome itself"
echo ""
echo "For Chrome browser specifically, Frida is recommended instead."

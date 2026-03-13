#!/bin/bash
# Frida Server Setup Script
# Downloads and installs frida-server on Android device
# Use -s flag for stealth/hluda version

set -e

STEALTH=false
if [ "$1" = "-s" ] || [ "$1" = "--stealth" ]; then
    STEALTH=true
fi

echo "═══════════════════════════════════════════════════════════════"
if [ "$STEALTH" = true ]; then
    echo "   HLUDA SERVER SETUP (Stealth/Anti-Detection)"
else
    echo "   FRIDA SERVER SETUP"
fi
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check for adb
if ! command -v adb &> /dev/null; then
    echo "❌ Error: adb not found"
    echo ""
    echo "Install with:"
    echo "  brew install android-platform-tools"
    exit 1
fi

# Check device connection
echo "[1/5] Checking device connection..."
DEVICE=$(adb devices | grep -v "List" | grep "device" | head -1 | awk '{print $1}')

if [ -z "$DEVICE" ]; then
    echo "❌ No device connected!"
    echo ""
    echo "Please:"
    echo "1. Connect Android device via USB"
    echo "2. Enable USB Debugging in Developer Options"
    echo "3. Accept the USB debugging prompt on device"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "   Device found: $DEVICE"

# Get architecture
echo ""
echo "[2/5] Detecting device architecture..."
ARCH=$(adb shell getprop ro.product.cpu.abi)
echo "   Architecture: $ARCH"

# Map to frida naming
case "$ARCH" in
    "arm64-v8a")
        FRIDA_ARCH="arm64"
        ;;
    "armeabi-v7a"|"armeabi")
        FRIDA_ARCH="arm"
        ;;
    "x86_64")
        FRIDA_ARCH="x86_64"
        ;;
    "x86")
        FRIDA_ARCH="x86"
        ;;
    *)
        echo "❌ Unknown architecture: $ARCH"
        exit 1
        ;;
esac

echo "   Frida architecture: $FRIDA_ARCH"

# Check frida-tools version
echo ""
echo "[3/5] Checking Frida version..."

if ! command -v frida &> /dev/null; then
    echo "   Installing frida-tools..."
    pip3 install frida-tools
fi

FRIDA_VERSION=$(frida --version)
echo "   Frida version: $FRIDA_VERSION"

# Download server
echo ""
echo "[4/5] Downloading server..."

SERVER_FILE="srv64"  # Renamed for stealth

if [ "$STEALTH" = true ]; then
    # Download hluda (anti-detection frida)
    echo "   Downloading hluda (stealth version)..."
    # hluda releases follow pattern: hluda-server-{version}-android-{arch}.xz
    HLUDA_URL="https://github.com/aspect-ux/hluda/releases/latest/download/hluda-server-${FRIDA_VERSION}-android-${FRIDA_ARCH}.xz"
    
    if [ ! -f "$SERVER_FILE" ]; then
        curl -L -o "hluda.xz" "$HLUDA_URL" 2>/dev/null || {
            echo "   hluda not available for this version, falling back to regular frida..."
            STEALTH=false
        }
        
        if [ -f "hluda.xz" ]; then
            xz -d "hluda.xz"
            mv "hluda" "$SERVER_FILE" 2>/dev/null || mv hluda-server* "$SERVER_FILE" 2>/dev/null
        fi
    fi
fi

if [ "$STEALTH" = false ] || [ ! -f "$SERVER_FILE" ]; then
    # Download regular frida-server
    FRIDA_SERVER="frida-server-${FRIDA_VERSION}-android-${FRIDA_ARCH}"
    DOWNLOAD_URL="https://github.com/frida/frida/releases/download/${FRIDA_VERSION}/${FRIDA_SERVER}.xz"
    
    echo "   URL: $DOWNLOAD_URL"
    
    if [ ! -f "$SERVER_FILE" ]; then
        curl -L -o "${FRIDA_SERVER}.xz" "$DOWNLOAD_URL" 2>/dev/null || wget -q -O "${FRIDA_SERVER}.xz" "$DOWNLOAD_URL"
        
        echo "   Extracting..."
        xz -d "${FRIDA_SERVER}.xz"
        mv "$FRIDA_SERVER" "$SERVER_FILE"
    fi
fi

echo "   ✓ Downloaded server as '$SERVER_FILE'"

# Push to device
echo ""
echo "[5/5] Installing on device..."
echo "   Pushing server..."

adb push "$SERVER_FILE" /data/local/tmp/
adb shell chmod 755 /data/local/tmp/$SERVER_FILE

echo "   ✓ Installed to /data/local/tmp/$SERVER_FILE"

# Verify
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Start server (requires root):"
echo "   adb shell \"su -c '/data/local/tmp/$SERVER_FILE &'\""
echo ""
echo "2. Hook Chrome with stealth script:"
echo "   frida -U -f com.android.chrome -l stealth.js --no-pause"
echo ""
echo "   ./start_frida.sh"
echo ""
echo "2. Run fingerprint spoofer:"
echo "   ./hook_chrome.sh"
echo ""
echo "Or manually:"
echo "   adb shell su -c '/data/local/tmp/frida-server &'"
echo "   frida -U -f com.android.chrome -l combined.js --no-pause"
echo ""

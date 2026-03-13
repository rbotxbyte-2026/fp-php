#!/bin/bash
# Hook Chrome with fingerprint spoofer

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Default values
PACKAGE="com.android.chrome"
SCRIPT="stealth.js"
MODE="spawn"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--package)
            PACKAGE="$2"
            shift 2
            ;;
        -s|--script)
            SCRIPT="$2"
            shift 2
            ;;
        -a|--attach)
            MODE="attach"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -p, --package   Package name (default: com.android.chrome)"
            echo "  -s, --script    Script to inject (default: stealth.js)"
            echo "  -a, --attach    Attach to running app instead of spawning"
            echo ""
            echo "Examples:"
            echo "  $0                           # Hook Chrome (stealth)"
            echo "  $0 -s minimal.js             # Minimal fingerprint only"
            echo "  $0 -p com.chrome.beta        # Hook Chrome Beta"
            echo "  $0 -a                        # Attach to running Chrome"
            echo ""
            echo "Scripts:"
            echo "  stealth.js     Anti-detection + spoof (recommended)"
            echo "  minimal.js     Fingerprint only, minimal size"
            echo "  combined.js    Verbose logs (debug only)"
            echo ""
            echo "Common packages:"
            echo "  com.android.chrome          Chrome"
            echo "  com.chrome.beta             Chrome Beta"
            echo "  com.brave.browser           Brave"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "═══════════════════════════════════════════════════════════════"
echo "   FRIDA CHROME HOOKER"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Package: $PACKAGE"
echo "Script:  $SCRIPT"
echo "Mode:    $MODE"
echo ""

# Check script exists
if [ ! -f "$SCRIPT" ]; then
    echo "❌ Script not found: $SCRIPT"
    exit 1
fi

# Check Frida connection
echo "Checking Frida connection..."
if ! frida-ps -U &>/dev/null; then
    echo "❌ Cannot connect to Frida"
    echo ""
    echo "Make sure frida-server is running:"
    echo "  ./start_frida.sh"
    exit 1
fi
echo "✓ Frida connected"
echo ""

# Run Frida
echo "Starting hook..."
echo ""

if [ "$MODE" = "spawn" ]; then
    # Spawn mode - launch app with hooks
    frida -U -f "$PACKAGE" -l "$SCRIPT" --no-pause
else
    # Attach mode - attach to running app
    frida -U "$PACKAGE" -l "$SCRIPT"
fi

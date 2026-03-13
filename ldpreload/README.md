# LD_PRELOAD Chrome Fingerprint Spoofer

Injects fingerprint spoofing JavaScript into Chrome on rooted Android.

## Approach

Since Chrome doesn't load JS from assets, we use two strategies:

1. **WebView Hook** - For apps using WebView (hooks `loadUrl`, `evaluateJavascript`)
2. **Chrome Hook** - Hooks internal functions to inject JS on page load

## Requirements

- Rooted Android device
- SELinux set to permissive
- Android NDK for building

## Quick Start

```bash
# Build
./build.sh

# Install
adb push libs/arm64-v8a/libfpspoof.so /data/local/tmp/

# Hook Chrome (64-bit)
adb shell su -c "
    am force-stop com.android.chrome
    setprop wrap.com.android.chrome 'LD_PRELOAD=/data/local/tmp/libfpspoof.so'
    am start -n com.android.chrome/com.google.android.apps.chrome.Main
"

# Or use hook.sh
./hook.sh com.android.chrome 64
```

## Files

- `fpspoof.c` - Main hook implementation
- `spoof.js` - JavaScript payload (embedded)
- `build.sh` - Build script
- `hook.sh` - Enable/disable hooks

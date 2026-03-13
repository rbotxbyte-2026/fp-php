# Frida Fingerprint Spoofer for Android Chrome

Inject fingerprint spoofing JavaScript into Chrome using Frida.
This keeps the **REAL TLS fingerprint** while spoofing JS APIs.

## Scripts (Pick One)

| Script | Size | Best For |
|--------|------|----------|
| `minimal.js` | 4KB | Fingerprint only, no detection bypass |
| `stealth.js` | 7KB | **Recommended** - Spoof + Anti-detection |
| `combined.js` | 18KB | Full debug logs (more detectable) |

## Anti-Detection Tips

1. **Use hluda-server** (Frida with anti-detection patches):
   - Download: https://github.com/aspect-ux/hluda/releases
   
2. **Rename the binary:**
   ```bash
   adb shell "su -c 'mv /data/local/tmp/frida-server /data/local/tmp/srv64'"
   adb shell "su -c '/data/local/tmp/srv64 &'"
   ```

3. **Use spawn mode** (default) - harder to detect than attach

4. **Quick command:**
   ```bash
   frida -U -f com.android.chrome -l stealth.js --no-pause
   ```

---

## What This Does

```
┌─────────────────────────────────────────────────────────────┐
│                    FRIDA INJECTION                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Chrome Process                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  frida-server hooks into Chrome                      │   │
│  │       ↓                                              │   │
│  │  Injects spoof.js into every WebView/page           │   │
│  │       ↓                                              │   │
│  │  JS APIs return spoofed values                      │   │
│  │       ↓                                              │   │
│  │  TLS connection is ORIGINAL (not proxied!)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Advantages over Proxy

| Feature | Proxy (mitmproxy) | Frida |
|---------|-------------------|-------|
| TLS Fingerprint | Proxy's fingerprint | **Real Chrome** ✓ |
| JA3/JA4 | Detectable | **Authentic** ✓ |
| Requires cert install | Yes | No |
| Works on all sites | Yes | Yes |
| Persistence | While proxy on | While Frida running |

---

## Step-by-Step Setup

### Step 1: Install Frida on Mac

```bash
# Install Frida tools
pip3 install frida-tools

# Verify installation
frida --version
```

### Step 2: Connect Android Device

```bash
# Enable USB debugging on Android:
# Settings → Developer Options → USB Debugging → ON

# Connect via USB and verify
adb devices
# Should show your device

# Get device architecture
adb shell getprop ro.product.cpu.abi
# Usually: arm64-v8a
```

### Step 3: Download frida-server for Android

```bash
# Run the setup script (downloads correct version automatically)
./setup.sh

# Or manual download:
# 1. Go to: https://github.com/frida/frida/releases
# 2. Download: frida-server-XX.X.X-android-arm64.xz
# 3. Extract and rename to frida-server
```

### Step 4: Push frida-server to Device

```bash
# Push to device
adb push frida-server /data/local/tmp/

# Make executable
adb shell chmod 755 /data/local/tmp/frida-server

# Verify
adb shell ls -la /data/local/tmp/frida-server
```

### Step 5: Start frida-server (requires root)

```bash
# Start frida-server as root
adb shell su -c "/data/local/tmp/frida-server &"

# Or use the helper script
./start_frida.sh

# Verify it's running
frida-ps -U
# Should list running processes on device
```

### Step 6: Run Fingerprint Spoofer

```bash
# Spoof Chrome's fingerprint
frida -U -f com.android.chrome -l fpspoof.js --no-pause

# Or attach to running Chrome
frida -U com.android.chrome -l fpspoof.js

# For Chrome Beta
frida -U -f com.chrome.beta -l fpspoof.js --no-pause
```

---

## Quick Start (After Setup)

```bash
# Terminal 1: Start frida-server
./start_frida.sh

# Terminal 2: Run spoofer
./hook_chrome.sh
```

---

## Verification

1. Open Chrome on Android
2. Go to: https://browserleaks.com/javascript
3. Check that values are spoofed:
   - Platform: Win32
   - Hardware Concurrency: 8
   - Device Memory: 8
   - Plugins: 5 (PDF viewers)

4. Go to: https://tls.browserleaks.com/
5. Verify TLS fingerprint is **Chrome's real JA3** (not a proxy)

---

## Troubleshooting

### "Unable to find device"
```bash
adb kill-server
adb start-server
adb devices
```

### "Failed to spawn: unable to access process"
```bash
# Restart frida-server
adb shell su -c "pkill frida-server"
adb shell su -c "/data/local/tmp/frida-server &"
```

### "Permission denied"
```bash
# Make sure you have root
adb shell su -c "whoami"  # Should say "root"
```

### "Process crashed"
```bash
# Try attaching instead of spawning
frida -U com.android.chrome -l fpspoof.js
```

---

## Files

| File | Description |
|------|-------------|
| `fpspoof.js` | Main fingerprint spoofing script |
| `bypass_kit.js` | Root/SSL/Debug detection bypass |
| `setup.sh` | Download and setup frida-server |
| `start_frida.sh` | Start frida-server on device |
| `hook_chrome.sh` | Hook Chrome with spoofer |
| `combined.js` | All-in-one (spoof + bypass) |

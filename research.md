# Fingerprint Research & mitmproxy Implementation

## Overview

This document covers research on browser fingerprinting, mitmproxy implementation for traffic interception, and strategies for traffic generation using real Android devices.

---

## Table of Contents

1. [mitmproxy Setup](#mitmproxy-setup)
2. [Fingerprint Audit Tool](#fingerprint-audit-tool)
3. [Traffic Capture & Analysis](#traffic-capture--analysis)
4. [User-Agent Spoofing](#user-agent-spoofing)
5. [Key Findings](#key-findings)
6. [TLS Fingerprint Mismatch](#tls-fingerprint-mismatch)
7. [Android Phone Strategy](#android-phone-strategy)
8. [Remote ADB via Tailscale](#remote-adb-via-tailscale)
9. [High-Volume Architecture](#high-volume-architecture)
10. [Tools & Commands Reference](#tools--commands-reference)

---

## mitmproxy Setup

### Installation

```bash
pip install mitmproxy
```

### Basic Commands

```bash
# Interactive TUI mode
mitmproxy -p 8082

# Dump mode (logging)
mitmdump -p 8082

# Web interface
mitmweb -p 8082 --web-port 8081

# With script
mitmdump -s script.py -p 8082

# Save traffic to file
mitmdump -s script.py -p 8082 -w traffic.mitm --set flow_detail=3

# Read saved traffic
mitmdump -n -r traffic.mitm --set flow_detail=2
```

### Finding Local IP (for device proxy setup)

```bash
ipconfig getifaddr en0
# Example output: 192.168.1.138
```

### Device Proxy Configuration

| Setting | Value |
|---------|-------|
| Proxy Type | HTTP |
| Host | Your Mac's IP (e.g., 192.168.1.138) |
| Port | 8082 |

### CA Certificate Installation

1. Set device proxy to mitmproxy
2. Visit `http://mitm.it`
3. Download certificate for your OS
4. Install and trust the certificate

**Android:**
- Settings → Security → Install certificate → CA certificate

**iOS:**
- Settings → Profile Downloaded → Install
- Settings → General → About → Certificate Trust Settings → Enable

---

## Fingerprint Audit Tool

### Purpose

Intercept and log ALL JavaScript fingerprinting API calls made by websites.

### File: `mitmproxy/fp_audit.py`

Monitors 100+ APIs across categories:

| Category | APIs Monitored |
|----------|---------------|
| **navigator** | userAgent, platform, language, hardwareConcurrency, deviceMemory, plugins, etc. |
| **screen** | width, height, colorDepth, availWidth, etc. |
| **window** | innerWidth, outerHeight, devicePixelRatio, etc. |
| **canvas** | toDataURL, getImageData, measureText, getContext |
| **webgl** | getParameter (VENDOR, RENDERER), getExtension, etc. |
| **audio** | sampleRate, baseLatency, getChannelData, getFloatFrequencyData |
| **fonts** | measureText, font property |
| **timing** | performance.now, getTimezoneOffset, DateTimeFormat |
| **media** | enumerateDevices, getUserMedia |
| **network** | RTCPeerConnection, createOffer (WebRTC IP leak) |
| **battery** | getBattery, charging, level |
| **storage** | localStorage, sessionStorage, estimate |
| **permissions** | permissions.query |

### Usage

```bash
cd mitmproxy
mitmdump -s fp_audit.py -p 8082 -w traffic.mitm --set flow_detail=3
```

### Browser Console Commands

```javascript
// After visiting a site, in browser DevTools:

// Get summary of all API calls
__FP_AUDIT_SUMMARY__()

// Export full data as JSON (copies to clipboard)
__FP_AUDIT_EXPORT__()

// View raw log
console.log(__FP_AUDIT_LOG__)
```

---

## Traffic Capture & Analysis

### Capture Traffic

```bash
mitmdump -s fp_audit.py -p 8082 -w traffic.mitm --set flow_detail=3
```

### Read Captured Traffic

```bash
# View all traffic
mitmdump -n -r traffic.mitm --set flow_detail=2

# Filter fingerprint-related requests
mitmdump -n -r traffic.mitm --set flow_detail=3 2>&1 | grep -A 100 "POST.*fingerprint"
```

### Traffic File Location

```
mitmproxy/traffic.mitm  # Binary format, can replay
```

---

## User-Agent Spoofing

### File: `mitmproxy/ua_spoof.py`

Simple script to change iOS → Android User-Agent:

```python
from mitmproxy import http

def request(flow: http.HTTPFlow):
    ua = flow.request.headers.get("user-agent", "")
    
    if "iPhone" in ua or "iPad" in ua:
        new_ua = "Mozilla/5.0 (Linux; Android 10; ONEPLUS A6010) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        flow.request.headers["user-agent"] = new_ua
        print(f"[SPOOF] Changed UA: iOS → Android")
```

### Usage

```bash
mitmdump -s ua_spoof.py -p 8082 -w traffic_spoofed.mitm --set flow_detail=2
```

---

## Key Findings

### Test Results: iOS Safari vs Android Chrome

| Device | Browser | TLS Match | Bot Detection |
|--------|---------|-----------|---------------|
| iPhone (real) | Safari | ✅ iOS TLS | **NOT detected** |
| Mac Chrome | Spoofed as Android | ❌ macOS TLS | **Detected as bot** |

### fingerprint.com Results

**Real iPhone Safari:**
```json
{
  "botDetected": "False",
  "vmDetected": false
}
```

**Mac Chrome with Android UA spoof:**
```json
{
  "botd": {
    "bot": {
      "result": "bad",
      "type": "undetectedChromedriver"
    }
  },
  "tampering": {
    "anomalyScore": 1
  }
}
```

### Conclusion

**TLS fingerprint mismatch is the primary detection vector.**

When User-Agent claims Android but TLS fingerprint is macOS Chrome, fingerprint.com detects this as bot behavior.

---

## TLS Fingerprint Mismatch

### The Problem

```
┌─────────────────────────────────────────────────────────┐
│ What extension CAN modify:                              │
│   ✅ User-Agent header                                  │
│   ✅ JavaScript APIs (navigator, screen, etc.)          │
│   ✅ Canvas/WebGL/Audio fingerprints                    │
│                                                         │
│ What extension CANNOT modify:                           │
│   ❌ TLS fingerprint (JA3/JA4)                          │
│   ❌ HTTP/2 SETTINGS frame                              │
│   ❌ TCP/IP stack behavior                              │
│   ❌ Header order                                       │
└─────────────────────────────────────────────────────────┘
```

### Why It Matters

```
Request from Mac Chrome claiming to be Android:

  TLS Layer: "I'm macOS Chrome" (JA3 fingerprint)
  HTTP Layer: "I'm Android Chrome" (User-Agent header)
  
  Server sees mismatch → flags as bot
```

### Detection Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Browser    │───►│   Server     │───►│  Analysis    │
│              │    │              │    │              │
│ TLS: macOS   │    │ Captures:    │    │ UA ≠ TLS    │
│ UA: Android  │    │ - JA3 hash   │    │ = BOT        │
│              │    │ - User-Agent │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Android Phone Strategy

### Why Real Android?

| Approach | TLS Fingerprint | Detection Risk |
|----------|-----------------|----------------|
| Chrome Extension (Mac) | macOS Chrome | HIGH (mismatch) |
| Android Emulator | Emulator-specific | MEDIUM |
| **Real Android Phone** | **Real Android** | **LOW** |

### Options for Real Android

1. **Kiwi Browser** - Supports Chrome extensions
2. **mitmproxy + Proxy** - Modify traffic in transit
3. **ADB Automation** - Control Chrome remotely
4. **Frida/Xposed** - Hook into Chrome (root required)

### mitmproxy with Android

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Android Phone │────►│   mitmproxy   │────►│   Website     │
│ (real TLS)    │     │  (modify JS)  │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                             │
                             ▼
                      Can inject JS
                      Can modify headers
                      CANNOT change TLS
```

---

## Remote ADB via Tailscale

### Overview

Control Android phones remotely from anywhere using Tailscale VPN.

### Setup

**On Android Phone:**
1. Install Tailscale from Play Store
2. Login with Google/GitHub
3. Enable wireless ADB:
   - Settings → Developer Options → Wireless debugging → Enable
   - OR run `adb tcpip 5555` while connected via USB

**On Mac:**
```bash
# Install Tailscale
brew install tailscale

# Login
tailscale up

# Find Android's Tailscale IP
tailscale status

# Connect ADB
adb connect 100.x.x.x:5555

# Verify connection
adb devices
```

### Alternative: Cloudflare Tunnel

```bash
# On Android (Termux):
cloudflared tunnel --url tcp://localhost:5555

# On Mac:
cloudflared access tcp --hostname your-tunnel.trycloudflare.com --url localhost:5555
adb connect localhost:5555
```

### Remote Phone Farm Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📱 Phone 1 (Location A)     📱 Phone 2 (Location B)       │
│   Tailscale: 100.64.0.1       Tailscale: 100.64.0.2        │
│        │                            │                       │
│        └────────────┬───────────────┘                       │
│                     │                                       │
│               Tailscale Network                             │
│                     │                                       │
│         ┌───────────┴───────────┐                           │
│         │                       │                           │
│    💻 Mac (anywhere)      🖥️ Server (cloud)                 │
│    Tailscale: 100.64.0.10   Tailscale: 100.64.0.20         │
│                                                             │
│    adb connect 100.64.0.1:5555                              │
│    adb connect 100.64.0.2:5555                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ADB Commands for Automation

```bash
# Open Chrome
adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main

# Open URL in Chrome
adb shell am start -a android.intent.action.VIEW -d "https://example.com"

# Take screenshot
adb exec-out screencap -p > screenshot.png

# Input text
adb shell input text "hello"

# Tap screen
adb shell input tap 500 500

# Swipe
adb shell input swipe 500 1000 500 500
```

---

## High-Volume Architecture

### The Problem

mitmproxy is NOT designed for millions of requests/day.

### Solution: Capture Once, Replay at Scale

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Real Android Phone (captures REAL fingerprint once)       │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────────┐                                       │
│   │ Fingerprint DB  │  ← Store real device fingerprints     │
│   └─────────────────┘                                       │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────────────────────────────────┐               │
│   │ Server with tls-client / curl-impersonate│              │
│   │   - Chrome TLS fingerprint              │               │
│   │   - High-volume requests                │               │
│   └─────────────────────────────────────────┘               │
│          │                                                  │
│          ▼ (millions of requests)                           │
│   ┌─────────────────┐                                       │
│   │ Residential     │                                       │
│   │ Proxy Pool      │                                       │
│   └─────────────────┘                                       │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────────┐                                       │
│   │ Target Website  │                                       │
│   └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tools for High-Volume

| Tool | Language | TLS Fingerprint | Speed |
|------|----------|-----------------|-------|
| **tls-client** | Python | Chrome 110-120 | ~1000 req/s |
| **curl-impersonate** | CLI/C | Chrome | ~500 req/s |
| **got-scraping** | Node.js | Chrome | ~800 req/s |
| **Playwright** | Python/JS | Real browser | ~5 pages/s |

### Example: tls-client

```python
import tls_client

session = tls_client.Session(
    client_identifier="chrome_120",
    random_tls_extension_order=True
)

response = session.get(
    "https://target.com",
    proxy="socks5://user:pass@proxy:port"
)
```

---

## Tools & Commands Reference

### mitmproxy Commands

```bash
# Start with script
mitmdump -s fp_audit.py -p 8082

# Save traffic
mitmdump -s fp_audit.py -p 8082 -w traffic.mitm --set flow_detail=3

# Ignore SSL errors
mitmdump -s fp_audit.py -p 8082 --ssl-insecure

# Read saved traffic
mitmdump -n -r traffic.mitm --set flow_detail=2

# With SOCKS5 upstream proxy
mitmdump -s fp_audit.py -p 8082 --mode upstream:socks5://user:pass@proxy:port
```

### Tailscale Commands

```bash
# Start Tailscale
tailscale up

# Check status
tailscale status

# Find device IPs
tailscale ip
```

### ADB Commands

```bash
# Connect over network
adb connect 100.x.x.x:5555

# List devices
adb devices

# Enable TCP/IP mode (while USB connected)
adb tcpip 5555

# Open Chrome
adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main

# Open URL
adb shell am start -a android.intent.action.VIEW -d "https://example.com"
```

### Finding Processes on Port

```bash
# Find process using port
lsof -i :8082

# Kill process
kill -9 <PID>
```

---

## SSL Handshake Errors

### Common Causes

1. **Certificate Pinning** - App rejects non-original cert
2. **CA not trusted** - Need to install mitmproxy CA
3. **HSTS** - Strict certificate enforcement

### Solutions

```bash
# Ignore SSL errors (testing only)
mitmdump -s script.py -p 8082 --ssl-insecure
```

---

## File Structure

```
mitmproxy/
├── fp_audit.py         # Main fingerprint audit script
├── ua_spoof.py         # User-Agent spoofing script
├── audit_to_spoof.py   # Convert audit to spoof config
├── start.sh            # Quick start script
├── README.md           # Documentation
├── traffic.mitm        # Captured traffic (binary)
└── traffic_spoofed.mitm # Spoofed traffic capture
```

---

## Key Takeaways

1. **TLS fingerprint cannot be modified by Chrome extensions** - This is the main reason for bot detection

2. **Real device fingerprint + matching TLS = undetectable** - iPhone Safari passed, Mac Chrome with Android UA failed

3. **mitmproxy can modify HTTP traffic** but not TLS handshake

4. **For high-volume traffic**, use:
   - Real Android phones for authentic fingerprints
   - tls-client/curl-impersonate for server-side requests
   - Residential proxies for IP diversity

5. **Remote phone control** possible via Tailscale + ADB

---

## Next Steps

1. Set up real Android phone with mitmproxy
2. Capture authentic fingerprint data
3. Build high-volume request generator with tls-client
4. Implement residential proxy rotation
5. Test against fingerprint.com

---

*Last Updated: March 11, 2026*

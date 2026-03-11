# UC — Undetectable ChromeDriver: Complete Research

## Table of Contents

1. [What is Undetectable ChromeDriver (UC)?](#1-what-is-undetectable-chromedriver-uc)
2. [How Bot Detection Works](#2-how-bot-detection-works)
3. [Changes Made by UC — Overview](#3-changes-made-by-uc--overview)
4. [Binary-Level Patches](#4-binary-level-patches)
5. [Chrome Command-Line Flags](#5-chrome-command-line-flags)
6. [JavaScript Environment Changes (with Commands)](#6-javascript-environment-changes-with-commands)
   - 6.1 [navigator.webdriver](#61-navigatorwebdriver)
   - 6.2 [window.cdc_* Variables](#62-windowcdc_-variables)
   - 6.3 [window.chrome / chrome.runtime](#63-windowchrome--chromeruntime)
   - 6.4 [navigator.plugins & navigator.mimeTypes](#64-navigatorplugins--navigatormimetypes)
   - 6.5 [navigator.languages](#65-navigatorlanguages)
   - 6.6 [navigator.permissions](#66-navigatorpermissions)
   - 6.7 [User-Agent String](#67-user-agent-string)
   - 6.8 [navigator.platform & navigator.hardwareConcurrency](#68-navigatorplatform--navigatorhardwareconcurrency)
   - 6.9 [WebGL Vendor & Renderer Spoofing](#69-webgl-vendor--renderer-spoofing)
   - 6.10 [Canvas Fingerprint Spoofing](#610-canvas-fingerprint-spoofing)
   - 6.11 [Audio Fingerprint Spoofing](#611-audio-fingerprint-spoofing)
   - 6.12 [iframe.contentWindow Consistency](#612-iframecontentwindow-consistency)
   - 6.13 [Notification API](#613-notification-api)
   - 6.14 [Function toString() Native Code Check](#614-function-tostring-native-code-check)
7. [CDP (Chrome DevTools Protocol) Injection](#7-cdp-chrome-devtools-protocol-injection)
8. [Puppeteer Stealth Plugin Evasion Modules](#8-puppeteer-stealth-plugin-evasion-modules)
9. [Detection Test Sites](#9-detection-test-sites)
10. [Summary Table of All Changes](#10-summary-table-of-all-changes)
11. [References](#11-references)

---

## 1. What is Undetectable ChromeDriver (UC)?

**Undetectable ChromeDriver** (commonly called **UC** or `undetected-chromedriver`) is an optimized Selenium ChromeDriver patch that modifies the ChromeDriver binary and browser JavaScript environment to bypass anti-bot detection systems used by websites.

- **Repository**: [ultrafunkamsterdam/undetected-chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver)
- **Language**: Python (with Node.js wrappers available)
- **Purpose**: Evade detection by Cloudflare, DataDome, PerimeterX, Akamai, and other anti-bot providers

UC works at **three levels**:
1. **Binary patching** — modifies the ChromeDriver executable itself
2. **Chrome flags** — launches Chrome with specific command-line arguments
3. **JavaScript injection** — overrides browser APIs and properties at runtime

---

## 2. How Bot Detection Works

Anti-bot systems detect automation by checking for:

| Detection Vector | What They Check |
|---|---|
| `navigator.webdriver` | Is it `true`? (set by standard ChromeDriver) |
| `window.cdc_*` variables | ChromeDriver injects global variables like `window.cdc_adoQpoasnfa76pfcZLmcfl_Array` |
| `window.chrome` | Missing or incomplete in headless mode |
| `navigator.plugins` | Empty array = headless/automated |
| `navigator.languages` | Empty or missing = bot |
| User-Agent | Contains "HeadlessChrome" |
| WebGL renderer | "Google SwiftShader" = software rendering (headless) |
| Canvas fingerprint | Consistent across headless instances |
| CDP side effects | `Runtime.enable` events, unusual error patterns |
| Stack traces | Non-standard function call patterns |
| Worker thread consistency | Main thread vs Web Worker property mismatches |

---

## 3. Changes Made by UC — Overview

UC makes the following categories of changes:

1. **Removes `cdc_` signatures** from the ChromeDriver binary
2. **Disables automation flags** via Chrome command-line switches
3. **Overrides `navigator.webdriver`** to `undefined`
4. **Fakes `window.chrome`** and `chrome.runtime`
5. **Spoofs `navigator.plugins`** and `navigator.mimeTypes`
6. **Normalizes `navigator.languages`**
7. **Overrides `navigator.permissions.query`**
8. **Strips "HeadlessChrome"** from user-agent
9. **Spoofs WebGL** vendor/renderer strings
10. **Adds canvas noise** to break consistent fingerprints
11. **Spoofs audio context** fingerprints
12. **Normalizes iframe** contentWindow behavior
13. **Protects `toString()`** on overridden functions

---

## 4. Binary-Level Patches

### What Gets Patched

The ChromeDriver binary contains JavaScript code blocks like:

```js
{window.cdc_adoQpoasnfa76pfcZLmcfl_Array = Array;}
```

This code is embedded in the chromedriver executable and gets executed in every browser page, creating a detectable global variable.

### How UC Patches It

UC's `patcher.py` scans the binary for patterns matching `/{window\.cdc.*?;}/` and replaces them with innocuous code of the same byte length:

**Before:**
```js
{window.cdc_adoQpoasnfa76pfcZLmcfl_Array = Array;}
```

**After:**
```js
{console.log("undetected chromedriver 1337!");}
```

> **Important**: The replacement must be the exact same byte length to avoid corrupting the binary. Padding is added if necessary.

### Why Binary Patching is Preferred Over JS Cleanup

- JavaScript property cleanup at runtime is insufficient because:
  - New windows, pop-ups, or iframes can reintroduce the detection variables
  - Anti-bot scripts detect the cleanup patterns themselves
- Binary patching eliminates the variables at the source before they ever appear in the browser

---

## 5. Chrome Command-Line Flags

UC launches Chrome with specific flags to disable automation indicators:

### `--disable-blink-features=AutomationControlled`

Disables the Blink engine feature that sets `navigator.webdriver = true`.

```python
options.add_argument("--disable-blink-features=AutomationControlled")
```

### `excludeSwitches: ["enable-automation"]`

Removes the `--enable-automation` flag from the Chrome process, which tells websites the session is automated.

```python
options.add_experimental_option("excludeSwitches", ["enable-automation"])
```

### `useAutomationExtension: false`

Disables the Selenium Chrome extension that is loaded automatically and detectable.

```python
options.add_experimental_option('useAutomationExtension', False)
```

### Complete Setup Example

```python
import undetected_chromedriver as uc

options = uc.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

driver = uc.Chrome(options=options)
```

---

## 6. JavaScript Environment Changes (with Commands)

### 6.1 `navigator.webdriver`

**Detection check (what websites run):**
```js
// Detection: returns true if automated
if (navigator.webdriver) {
    console.log("Bot detected!");
}
```

**UC evasion — JavaScript command:**
```js
Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined
});
```

**Alternative approach:**
```js
Object.defineProperty(navigator, 'webdriver', {
    get: () => false
});
```

**Verify the fix:**
```js
console.log(navigator.webdriver);  // undefined (not true)
```

---

### 6.2 `window.cdc_*` Variables

**Detection check (what websites run):**
```js
// Detection: scan for cdc_ prefixed properties
let isBot = false;
for (const key in window) {
    if (key.startsWith('cdc_') || key.startsWith('$cdc_')) {
        isBot = true;
        break;
    }
}

// Alternative detection
if (window.cdc_adoQpoasnfa76pfcZLmcfl_Array) {
    console.log("ChromeDriver detected!");
}
```

**UC evasion — JavaScript command (runtime cleanup):**
```js
// Delete all cdc_ prefixed variables from window
for (const key in window) {
    if (key.startsWith('cdc_') || key.startsWith('$cdc_')) {
        try {
            delete window[key];
        } catch (e) {}
    }
}
```

> **Note**: UC primarily handles this at the binary level (see Section 4). The JS cleanup above is a supplementary measure.

---

### 6.3 `window.chrome` / `chrome.runtime`

**Detection check (what websites run):**
```js
// Detection: window.chrome is missing or incomplete in headless mode
if (!window.chrome) {
    console.log("Not a real Chrome browser!");
}

if (!window.chrome || !window.chrome.app) {
    console.log("Headless or automated Chrome detected!");
}

if (!window.chrome.runtime) {
    console.log("Chrome runtime missing — likely automated!");
}
```

**UC evasion — JavaScript command:**
```js
// Create a realistic window.chrome object
window.chrome = {
    app: {
        isInstalled: false,
        InstallState: {
            DISABLED: 'disabled',
            INSTALLED: 'installed',
            NOT_INSTALLED: 'not_installed'
        },
        RunningState: {
            CANNOT_RUN: 'cannot_run',
            READY_TO_RUN: 'ready_to_run',
            RUNNING: 'running'
        }
    },
    runtime: {
        OnInstalledReason: {
            CHROME_UPDATE: 'chrome_update',
            INSTALL: 'install',
            SHARED_MODULE_UPDATE: 'shared_module_update',
            UPDATE: 'update'
        },
        OnRestartRequiredReason: {
            APP_UPDATE: 'app_update',
            OS_UPDATE: 'os_update',
            PERIODIC: 'periodic'
        },
        PlatformArch: {
            ARM: 'arm',
            MIPS: 'mips',
            MIPS64: 'mips64',
            X86_32: 'x86-32',
            X86_64: 'x86-64'
        },
        PlatformNaclArch: {
            ARM: 'arm',
            MIPS: 'mips',
            MIPS64: 'mips64',
            X86_32: 'x86-32',
            X86_64: 'x86-64'
        },
        PlatformOs: {
            ANDROID: 'android',
            CROS: 'cros',
            LINUX: 'linux',
            MAC: 'mac',
            OPENBSD: 'openbsd',
            WIN: 'win'
        },
        RequestUpdateCheckStatus: {
            NO_UPDATE: 'no_update',
            THROTTLED: 'throttled',
            UPDATE_AVAILABLE: 'update_available'
        },
        connect: function() {},
        sendMessage: function() {}
    }
};
```

---

### 6.4 `navigator.plugins` & `navigator.mimeTypes`

**Detection check (what websites run):**
```js
// Detection: headless Chrome has zero plugins
if (navigator.plugins.length === 0) {
    console.log("Headless browser — no plugins!");
}

if (navigator.mimeTypes.length === 0) {
    console.log("Headless browser — no MIME types!");
}
```

**UC evasion — JavaScript command:**
```js
// Spoof navigator.plugins to look like a real Chrome browser
Object.defineProperty(navigator, 'plugins', {
    get: () => {
        const ChromePDFPlugin = {
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            name: "Chrome PDF Plugin",
            length: 1,
            item: function(i) { return this[i]; },
            namedItem: function(name) { return this[name]; },
            0: { type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: null }
        };
        const ChromePDFViewer = {
            description: "",
            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
            name: "Chrome PDF Viewer",
            length: 1,
            item: function(i) { return this[i]; },
            namedItem: function(name) { return this[name]; },
            0: { type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: null }
        };
        const NativeClient = {
            description: "",
            filename: "internal-nacl-plugin",
            name: "Native Client",
            length: 2,
            item: function(i) { return this[i]; },
            namedItem: function(name) { return this[name]; },
            0: { type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: null },
            1: { type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: null }
        };
        const pluginArray = [ChromePDFPlugin, ChromePDFViewer, NativeClient];
        pluginArray.item = function(i) { return this[i]; };
        pluginArray.namedItem = function(name) {
            return this.find(p => p.name === name);
        };
        pluginArray.refresh = function() {};
        return pluginArray;
    }
});
```

---

### 6.5 `navigator.languages`

**Detection check (what websites run):**
```js
// Detection: missing or empty languages
if (!navigator.languages || navigator.languages.length === 0) {
    console.log("Bot detected — no languages set!");
}
```

**UC evasion — JavaScript command:**
```js
Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en']
});

Object.defineProperty(navigator, 'language', {
    get: () => 'en-US'
});
```

---

### 6.6 `navigator.permissions`

**Detection check (what websites run):**
```js
// Detection: permissions.query behaves differently under automation
navigator.permissions.query({ name: 'notifications' }).then(result => {
    if (Notification.permission === 'denied' && result.state === 'prompt') {
        console.log("Bot detected — permission inconsistency!");
    }
});
```

**UC evasion — JavaScript command:**
```js
// Override permissions.query to return consistent results
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters)
);
```

---

### 6.7 User-Agent String

**Detection check (what websites run):**
```js
// Detection: "HeadlessChrome" in the user agent
if (navigator.userAgent.includes("HeadlessChrome")) {
    console.log("Headless Chrome detected!");
}

// Or checking for missing Chrome version info
if (!navigator.userAgent.includes("Chrome/")) {
    console.log("Suspicious user agent!");
}
```

**UC evasion — JavaScript command:**
```js
Object.defineProperty(navigator, 'userAgent', {
    get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});
```

**Via CDP command (recommended — sets it at the protocol level):**
```js
// In Selenium/Python:
// driver.execute_cdp_cmd('Network.setUserAgentOverride', {
//     "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
// })
```

---

### 6.8 `navigator.platform` & `navigator.hardwareConcurrency`

**Detection check (what websites run):**
```js
// Detection: platform mismatch with user-agent
if (navigator.platform === 'Linux x86_64' && navigator.userAgent.includes('Win64')) {
    console.log("Platform/UA mismatch — bot detected!");
}

// Detection: typical headless environments have unusual core counts
if (navigator.hardwareConcurrency < 2) {
    console.log("Possible bot — low core count!");
}
```

**UC evasion — JavaScript command:**
```js
Object.defineProperty(navigator, 'platform', {
    get: () => 'Win32'
});

Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => 8
});
```

---

### 6.9 WebGL Vendor & Renderer Spoofing

**Detection check (what websites run):**
```js
// Detection: read GPU info — "Google SwiftShader" = headless
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);     // 37445
const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL); // 37446

if (renderer.includes('SwiftShader')) {
    console.log("Headless environment detected!");
}
```

**UC evasion — JavaScript command:**
```js
const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
WebGLRenderingContext.prototype.getParameter = function(parameter) {
    // UNMASKED_VENDOR_WEBGL
    if (parameter === 37445) {
        return 'Intel Inc.';
    }
    // UNMASKED_RENDERER_WEBGL
    if (parameter === 37446) {
        return 'Intel Iris OpenGL Engine';
    }
    return originalGetParameter.apply(this, arguments);
};

// Also patch WebGL2
const originalGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
WebGL2RenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) {
        return 'Intel Inc.';
    }
    if (parameter === 37446) {
        return 'Intel Iris OpenGL Engine';
    }
    return originalGetParameter2.apply(this, arguments);
};
```

---

### 6.10 Canvas Fingerprint Spoofing

**Detection check (what websites run):**
```js
// Detection: read canvas pixel data to generate a unique fingerprint
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.textBaseline = 'top';
ctx.font = '14px Arial';
ctx.fillStyle = '#f60';
ctx.fillRect(125, 1, 62, 20);
ctx.fillStyle = '#069';
ctx.fillText('BrowserFingerprint', 2, 15);
const dataURL = canvas.toDataURL();
// Hash of dataURL is the fingerprint — identical across headless instances
```

**UC evasion — JavaScript command:**
```js
// Inject subtle random noise into canvas toDataURL output
const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
HTMLCanvasElement.prototype.toDataURL = function(type) {
    if (type === 'image/png' || type === undefined) {
        const context = this.getContext('2d');
        if (context) {
            // Add invisible noise to canvas pixels
            const imageData = context.getImageData(0, 0, this.width, this.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                // Subtle noise on the alpha channel — invisible but changes the hash
                imageData.data[i + 3] = imageData.data[i + 3] > 0
                    ? Math.max(1, imageData.data[i + 3] + (Math.random() > 0.5 ? 1 : -1))
                    : 0;
            }
            context.putImageData(imageData, 0, 0);
        }
    }
    return originalToDataURL.apply(this, arguments);
};

// Also override toBlob
const originalToBlob = HTMLCanvasElement.prototype.toBlob;
HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
    if (type === 'image/png' || type === undefined) {
        const context = this.getContext('2d');
        if (context) {
            const imageData = context.getImageData(0, 0, this.width, this.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i + 3] = imageData.data[i + 3] > 0
                    ? Math.max(1, imageData.data[i + 3] + (Math.random() > 0.5 ? 1 : -1))
                    : 0;
            }
            context.putImageData(imageData, 0, 0);
        }
    }
    return originalToBlob.apply(this, [callback, type, quality]);
};
```

---

### 6.11 Audio Fingerprint Spoofing

**Detection check (what websites run):**
```js
// Detection: AudioContext produces a consistent fingerprint per environment
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioCtx.createOscillator();
const analyser = audioCtx.createAnalyser();
const gain = audioCtx.createGain();
oscillator.connect(analyser);
analyser.connect(gain);
gain.connect(audioCtx.destination);
oscillator.start(0);
// Read frequency data — consistent fingerprint for headless
const dataArray = new Float32Array(analyser.frequencyBinCount);
analyser.getFloatFrequencyData(dataArray);
// Hash of dataArray = audio fingerprint
```

**UC evasion — JavaScript command:**
```js
// Add subtle noise to audio fingerprint data
const origGetFloatFrequencyData = AnalyserNode.prototype.getFloatFrequencyData;
AnalyserNode.prototype.getFloatFrequencyData = function(array) {
    origGetFloatFrequencyData.call(this, array);
    for (let i = 0; i < array.length; i++) {
        array[i] = array[i] + (Math.random() * 0.0001);
    }
};

const origGetByteFrequencyData = AnalyserNode.prototype.getByteFrequencyData;
AnalyserNode.prototype.getByteFrequencyData = function(array) {
    origGetByteFrequencyData.call(this, array);
    for (let i = 0; i < array.length; i++) {
        array[i] = Math.max(0, Math.min(255, array[i] + (Math.random() > 0.5 ? 1 : -1)));
    }
};

// Also patch getChannelData for OfflineAudioContext
const origGetChannelData = AudioBuffer.prototype.getChannelData;
AudioBuffer.prototype.getChannelData = function(channel) {
    const data = origGetChannelData.call(this, channel);
    for (let i = 0; i < data.length; i++) {
        data[i] = data[i] + (Math.random() * 0.0000001);
    }
    return data;
};
```

---

### 6.12 `iframe.contentWindow` Consistency

**Detection check (what websites run):**
```js
// Detection: check iframe contentWindow for automation traces
const iframe = document.createElement('iframe');
iframe.style.display = 'none';
document.body.appendChild(iframe);

// Check if webdriver leaks in iframe context
if (iframe.contentWindow.navigator.webdriver) {
    console.log("Automation detected in iframe!");
}

// Check chrome object consistency
if (!iframe.contentWindow.chrome) {
    console.log("iframe chrome mismatch!");
}
```

**UC evasion — JavaScript command:**
```js
// Ensure overrides propagate to iframes
const originalCreateElement = document.createElement.bind(document);
document.createElement = function(tagName) {
    const element = originalCreateElement(tagName);
    if (tagName.toLowerCase() === 'iframe') {
        element.addEventListener('load', () => {
            try {
                Object.defineProperty(element.contentWindow.navigator, 'webdriver', {
                    get: () => undefined
                });
            } catch (e) {}
        });
    }
    return element;
};
```

> **Note**: This is why binary-level patching is superior — it eliminates detection variables before any JavaScript context (main page, iframe, worker) can observe them.

---

### 6.13 Notification API

**Detection check (what websites run):**
```js
// Detection: inconsistency between Notification.permission and permissions API
if (Notification.permission === 'default') {
    navigator.permissions.query({ name: 'notifications' }).then(p => {
        if (p.state !== 'prompt') {
            console.log("Permission state mismatch — automation!");
        }
    });
}
```

**UC evasion — JavaScript command:**
```js
// Ensure Notification.permission is consistent
const originalNotificationPermission = Object.getOwnPropertyDescriptor(
    Notification, 'permission'
);
if (originalNotificationPermission) {
    Object.defineProperty(Notification, 'permission', {
        get: () => 'default'
    });
}
```

---

### 6.14 Function `toString()` Native Code Check

**Detection check (what websites run):**
```js
// Detection: overridden functions won't show "[native code]"
const webdriverGetter = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
if (webdriverGetter && webdriverGetter.get) {
    if (!webdriverGetter.get.toString().includes('[native code]')) {
        console.log("navigator.webdriver has been tampered with!");
    }
}

// Generic check for any function
function isNative(fn) {
    return /\[native code\]/.test(Function.prototype.toString.call(fn));
}
```

**UC evasion — JavaScript command:**
```js
// Proxy the toString to always return native code signature
const nativeToStringFunctionString = Error.toString().replace(/Error/g, "toString");
const oldToString = Function.prototype.toString;

function newToString() {
    if (this === window.navigator.permissions.query) {
        return "function query() { [native code] }";
    }
    if (this === HTMLCanvasElement.prototype.toDataURL) {
        return "function toDataURL() { [native code] }";
    }
    if (this === WebGLRenderingContext.prototype.getParameter) {
        return "function getParameter() { [native code] }";
    }
    return oldToString.call(this);
}

Function.prototype.toString = newToString;
// Protect our own toString override
Function.prototype.toString.toString = function() {
    return "function toString() { [native code] }";
};
```

**Generalized helper for protecting overrides:**
```js
// Helper: make any overridden function appear native
function makeNativeString(fn, name) {
    const handler = {
        apply: function(target, thisArg, args) {
            if (thisArg === fn) {
                return `function ${name || fn.name || ''}() { [native code] }`;
            }
            return target.apply(thisArg, args);
        }
    };
    Function.prototype.toString = new Proxy(Function.prototype.toString, handler);
}
```

---

## 7. CDP (Chrome DevTools Protocol) Injection

UC uses CDP's `Page.addScriptToEvaluateOnNewDocument` to inject JavaScript **before** any page scripts execute. This is critical because it ensures overrides are in place before detection scripts run.

### Complete CDP Injection Example

```python
import undetected_chromedriver as uc

driver = uc.Chrome()

stealth_script = """
    // 1. Hide navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });

    // 2. Fix chrome.runtime
    window.chrome = {
        runtime: {
            connect: function() {},
            sendMessage: function() {}
        }
    };

    // 3. Fix navigator.permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters)
    );

    // 4. Fix navigator.plugins
    Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
    });

    // 5. Fix navigator.languages
    Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
    });

    // 6. Override WebGL renderer
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris OpenGL Engine';
        return getParameter.apply(this, arguments);
    };
"""

driver.execute_cdp_cmd(
    "Page.addScriptToEvaluateOnNewDocument",
    {"source": stealth_script}
)

driver.get("https://example.com")
```

### Why `addScriptToEvaluateOnNewDocument`?

| Method | Timing | Scope | Reliability |
|---|---|---|---|
| `execute_script()` | After page load | Current page only | Low — detection scripts run first |
| `addScriptToEvaluateOnNewDocument` | Before any script | Every new document | High — overrides are pre-set |
| Binary patching | Before browser launch | All contexts | Highest — no JS to detect |

---

## 8. Puppeteer Stealth Plugin Evasion Modules

The **puppeteer-extra-plugin-stealth** package provides modular evasions that UC concepts are based on. Each evasion module targets a specific detection vector:

| Module | What It Does |
|---|---|
| `chrome.app` | Adds realistic `window.chrome.app` object |
| `chrome.csi` | Adds `window.chrome.csi()` function |
| `chrome.loadTimes` | Adds `window.chrome.loadTimes()` function |
| `chrome.runtime` | Creates fake but realistic `chrome.runtime` object |
| `defaultArgs` | Removes `--enable-automation` from Chrome's default args |
| `iframe.contentWindow` | Patches iframe contentWindow to hide automation traces |
| `media.codecs` | Reports realistic media codec support |
| `navigator.hardwareConcurrency` | Spoofs CPU core count |
| `navigator.languages` | Returns realistic language arrays |
| `navigator.permissions` | Patches `permissions.query()` for consistent responses |
| `navigator.plugins` | Injects realistic plugin list |
| `navigator.vendor` | Returns "Google Inc." |
| `navigator.webdriver` | Sets `navigator.webdriver` to `undefined` |
| `sourceurl` | Hides injected script source URLs |
| `user-agent-override` | Removes "HeadlessChrome" from UA string |
| `webgl.vendor` | Spoofs WebGL vendor/renderer strings |
| `window.outerdimensions` | Sets realistic `outerWidth`/`outerHeight` values |

### Usage in Puppeteer (Node.js)

```js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://bot.sannysoft.com');
    await browser.close();
})();
```

### Individual Evasion Usage

```js
const puppeteer = require('puppeteer-extra');

// Load only specific evasions
puppeteer.use(require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver')());
puppeteer.use(require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime')());
puppeteer.use(require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions')());
puppeteer.use(require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins')());
```

---

## 9. Detection Test Sites

Use these sites to verify that UC evasions are working:

| Site | URL | What It Tests |
|---|---|---|
| Bot Sannysoft | https://bot.sannysoft.com | navigator.webdriver, plugins, languages, chrome object |
| Incolumitas Bot Detection | https://bot.incolumitas.com | Comprehensive fingerprinting & behavioral tests |
| BrowserLeaks | https://browserleaks.com | WebGL, canvas, audio, WebRTC, fonts |
| CreepJS | https://abrahamjuliot.github.io/creepjs/ | Deep browser fingerprinting |
| Pixelscan | https://pixelscan.net | IP, fingerprint, header analysis |
| ScrapFly Automation Detector | https://scrapfly.io/web-scraping-tools/automation-detector | Automation-specific checks |

---

## 10. Summary Table of All Changes

| # | Detection Vector | What UC Changes | JavaScript Command | Level |
|---|---|---|---|---|
| 1 | `navigator.webdriver` | Set to `undefined` | `Object.defineProperty(navigator, 'webdriver', {get: () => undefined})` | JS + Flag |
| 2 | `window.cdc_*` variables | Removed from binary | Binary patch replaces `{window.cdc_...}` blocks | Binary |
| 3 | `window.chrome` | Fake chrome object created | `window.chrome = { runtime: {}, app: {} }` | JS |
| 4 | `chrome.runtime` | Realistic runtime object | See Section 6.3 | JS |
| 5 | `navigator.plugins` | Fake plugin list | `Object.defineProperty(navigator, 'plugins', {...})` | JS |
| 6 | `navigator.mimeTypes` | Fake MIME types | Same pattern as plugins | JS |
| 7 | `navigator.languages` | Set to `['en-US', 'en']` | `Object.defineProperty(navigator, 'languages', {get: () => ['en-US','en']})` | JS |
| 8 | `navigator.permissions` | Patched `query()` method | Override `permissions.query` for consistent results | JS |
| 9 | User-Agent | Remove "HeadlessChrome" | `Network.setUserAgentOverride` via CDP | CDP |
| 10 | `--enable-automation` | Excluded from switches | `excludeSwitches: ["enable-automation"]` | Flag |
| 11 | AutomationControlled | Blink feature disabled | `--disable-blink-features=AutomationControlled` | Flag |
| 12 | Automation extension | Disabled | `useAutomationExtension: false` | Flag |
| 13 | WebGL vendor/renderer | Spoofed to Intel | Override `getParameter()` for params 37445/37446 | JS |
| 14 | Canvas fingerprint | Random noise added | Override `toDataURL()` and `toBlob()` | JS |
| 15 | Audio fingerprint | Random noise added | Override `getFloatFrequencyData()` and `getChannelData()` | JS |
| 16 | `navigator.platform` | Spoofed to match UA | `Object.defineProperty(navigator, 'platform', {...})` | JS |
| 17 | `hardwareConcurrency` | Spoofed to realistic value | `Object.defineProperty(navigator, 'hardwareConcurrency', {get: () => 8})` | JS |
| 18 | iframe consistency | Overrides propagated | Patch `document.createElement` for iframes | JS |
| 19 | `Notification.permission` | Consistent with permissions API | Override permission descriptor | JS |
| 20 | `Function.toString()` | Returns "[native code]" | Proxy `Function.prototype.toString` | JS |
| 21 | `window.outerWidth/Height` | Set to realistic values | `Object.defineProperty(window, 'outerWidth', {...})` | JS |
| 22 | CDP `Runtime.enable` | Minimized CDP traces | Architecture-level changes in UC | Internal |

---

## 11. References

1. **undetected-chromedriver GitHub** — https://github.com/ultrafunkamsterdam/undetected-chromedriver
2. **Anti-Detection Techniques (DeepWiki)** — https://deepwiki.com/ultrafunkamsterdam/undetected-chromedriver/5.2-anti-detection-techniques
3. **patcher.py Source Code** — https://github.com/ultrafunkamsterdam/undetected-chromedriver/blob/master/undetected_chromedriver/patcher.py
4. **puppeteer-extra-plugin-stealth** — https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth
5. **Stealth Evasions README** — https://github.com/berstend/puppeteer-extra/blob/master/packages/puppeteer-extra-plugin-stealth/evasions/readme.md
6. **How to Make Chromedriver Undetectable** — https://www.tutorialpedia.org/blog/how-to-make-chromedriver-undetectable/
7. **ChromeDriver Patching (FlareSolverr)** — https://deepwiki.com/FlareSolverr/FlareSolverr/5.6-chromedriver-patching
8. **Bypass navigator.webdriver (Stack Overflow)** — https://stackoverflow.com/questions/53039551/selenium-webdriver-modifying-navigator-webdriver-flag-to-prevent-selenium-detec
9. **--disable-blink-features=AutomationControlled (ZenRows)** — https://www.zenrows.com/blog/disable-blink-features-automationcontrolled
10. **Advanced Headless Chrome Detection (Workers & WebGL)** — https://www.ipasis.com/blog/detecting-headless-chrome-workers-webgl
11. **Chrome Command Line Switches** — https://peter.sh/experiments/chromium-command-line-switches/
12. **Bot Detection Test Suite (Incolumitas)** — https://bot.incolumitas.com/
13. **BotD Detection Library** — https://github.com/fingerprintjs/BotD
14. **Headless Browser Detector** — https://github.com/AdrianSchiwor/headless-detector
15. **CDP Documentation (Selenium)** — https://www.selenium.dev/documentation/webdriver/bidi/cdp/
16. **How to Detect CDP-Injected Scripts (Castle.io)** — https://blog.castle.io/how-to-detect-scripts-injected-via-cdp-in-chrome-2/
17. **Chromium Flags** — https://www.chrome-flags.com/
18. **undetected-chromedriver Fix cdc_* PR #1010** — https://github.com/ultrafunkamsterdam/undetected-chromedriver/pull/1010

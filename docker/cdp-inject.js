#!/usr/bin/env node
/**
 * cdp-inject.js
 * Connects to Chrome on Android via CDP and injects spoofing script
 * Handles parameters that ADB cannot set
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { adb, sleep } = require('./utils');

const PROFILE_PATH = process.env.PROFILE_PATH || './profiles/original.json';
const CDP_CONFIG_PATH = process.env.CDP_CONFIG_PATH || './profiles/cdp-config.json';
const CHROME_DEBUG_PORT = process.env.CHROME_DEBUG_PORT || '9222';
const TARGET_URL = process.env.TARGET_URL || 'https://botxbyte.com/fp.php';

async function main() {
    console.log('========================================');
    console.log('  CDP Fingerprint Injection');
    console.log('========================================\n');
    
    // Load CDP config
    let cdpConfig;
    if (fs.existsSync(CDP_CONFIG_PATH)) {
        console.log(`Loading CDP config from: ${CDP_CONFIG_PATH}`);
        cdpConfig = JSON.parse(fs.readFileSync(CDP_CONFIG_PATH, 'utf8'));
    } else {
        console.log(`Loading profile from: ${PROFILE_PATH}`);
        const profile = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
        const { generateCdpConfig } = require('./setup-device');
        cdpConfig = generateCdpConfig(profile);
    }
    
    // Start Chrome with remote debugging
    console.log('\nStarting Chrome...');
    const browser = await startChrome();
    
    // Connect to Chrome DevTools
    console.log(`\nConnecting to Chrome DevTools on port ${CHROME_DEBUG_PORT}...`);
    const wsUrl = await getWebSocketUrl();
    
    if (!wsUrl) {
        console.error('ERROR: Failed to get Chrome WebSocket URL');
        console.error('DevTools may not be available for this browser');
        console.log('\nTrying fallback: direct page capture via ADB...');
        
        // Fallback: navigate and capture via screenshot/DOM
        await fallbackCapture(cdpConfig, TARGET_URL);
        return;
    }
    
    console.log(`WebSocket URL: ${wsUrl}`);
    
    // Generate injection script
    const injectScript = generateInjectScript(cdpConfig);
    
    // Connect and inject (save result if env var set)
    const saveResult = process.env.SAVE_RESULT === 'true';
    await connectAndInject(wsUrl, injectScript, TARGET_URL, saveResult);
    
    console.log('\n========================================');
    console.log('  CDP Injection Complete!');
    console.log('========================================\n');
}

/**
 * Fallback capture method when CDP is unavailable
 * Uses ADB to navigate and capture HTTP response
 */
async function fallbackCapture(cdpConfig, targetUrl) {
    console.log('\nUsing fallback capture method...');
    
    // Navigate to the URL using am start
    console.log(`Navigating to: ${targetUrl}`);
    try {
        adb(`shell am start -a android.intent.action.VIEW -d "${targetUrl}"`);
    } catch (e) {
        console.log('Navigation error:', e.message);
    }
    
    // Wait for page to load
    console.log('Waiting for page to load...');
    await sleep(10000);
    
    // Try to capture page content via curl from within Android
    console.log('Attempting to capture fingerprint data...');
    try {
        // Use wget/curl from Android shell if available
        const result = adb(`shell "wget -q -O - '${targetUrl}' 2>/dev/null || curl -s '${targetUrl}' 2>/dev/null"`);
        
        if (result && result.trim()) {
            const resultPath = process.env.RESULT_PATH || './result.json';
            try {
                const parsed = JSON.parse(result);
                fs.writeFileSync(resultPath, JSON.stringify(parsed, null, 2));
                console.log(`Result saved to: ${resultPath}`);
            } catch {
                fs.writeFileSync(resultPath, result);
                console.log(`Raw result saved to: ${resultPath}`);
            }
        } else {
            console.log('Could not capture page content');
            
            // Last resort: capture a basic fingerprint using Android properties
            console.log('Generating fallback fingerprint from device properties...');
            const fallbackFp = {
                captured_at: new Date().toISOString(),
                method: 'adb_fallback',
                device: {
                    model: adb('shell getprop ro.product.model').trim(),
                    brand: adb('shell getprop ro.product.brand').trim(),
                    manufacturer: adb('shell getprop ro.product.manufacturer').trim(),
                    device: adb('shell getprop ro.product.device').trim(),
                    sdk: adb('shell getprop ro.build.version.sdk').trim(),
                    timezone: adb('shell getprop persist.sys.timezone').trim()
                },
                config: cdpConfig
            };
            
            const resultPath = process.env.RESULT_PATH || './result.json';
            fs.writeFileSync(resultPath, JSON.stringify(fallbackFp, null, 2));
            console.log(`Fallback result saved to: ${resultPath}`);
        }
    } catch (e) {
        console.log('Fallback capture failed:', e.message);
    }
    
    console.log('\n========================================');
    console.log('  Fallback Capture Complete!');
    console.log('========================================\n');
}

/**
 * Start Chrome/Chromium on Android with remote debugging
 */
async function startChrome() {
    // List of browser packages to try (in order of preference)
    const browsers = [
        { pkg: 'com.android.chrome', activity: 'com.google.android.apps.chrome.Main', socket: 'chrome_devtools_remote' },
        { pkg: 'org.chromium.chrome', activity: 'com.google.android.apps.chrome.Main', socket: 'chrome_devtools_remote' },
        { pkg: 'com.brave.browser', activity: 'com.brave.browser.BraveActivity', socket: 'chrome_devtools_remote' },
        { pkg: 'org.chromium.webview_shell', activity: 'org.chromium.webview_shell.WebViewBrowserActivity', socket: 'webview_devtools_remote' },
    ];
    
    // Find which browser is installed
    let installedBrowser = null;
    const packagesOutput = adb('shell pm list packages');
    console.log('Checking installed browsers...');
    
    for (const browser of browsers) {
        if (packagesOutput.includes(browser.pkg)) {
            console.log(`Found browser: ${browser.pkg}`);
            installedBrowser = browser;
            break;
        }
    }
    
    if (!installedBrowser) {
        throw new Error('No supported browser available. Please install Chrome/Chromium.');
    }
    
    // Kill existing browser
    try {
        adb(`shell am force-stop ${installedBrowser.pkg}`);
    } catch (e) {}
    
    await sleep(1000);
    
    // Write Chrome command-line flags file (works for Chromium-based browsers)
    const chromeFlags = [
        'chrome',
        '--disable-fre',
        '--no-first-run', 
        '--disable-notifications',
        '--disable-popup-blocking',
        '--remote-debugging-port=9222'
    ].join(' ');
    
    try {
        adb(`shell "echo '${chromeFlags}' > /data/local/tmp/chrome-command-line"`);
        adb('shell chmod 644 /data/local/tmp/chrome-command-line');
        // Also set for the specific package
        adb(`shell "echo '${chromeFlags}' > /data/local/tmp/${installedBrowser.pkg}-command-line"`);
    } catch (e) {
        console.log('Could not write Chrome flags file');
    }
    
    // Start browser with about:blank first
    console.log(`Starting ${installedBrowser.pkg}...`);
    try {
        adb(`shell am start -n ${installedBrowser.pkg}/${installedBrowser.activity} -a android.intent.action.VIEW -d "about:blank"`);
    } catch (e) {
        console.log('Browser start error:', e.message);
        // Try without data
        try {
            adb(`shell am start -n ${installedBrowser.pkg}/${installedBrowser.activity}`);
        } catch (e2) {
            throw new Error(`Browser launch failed: ${e2.message}`);
        }
    }
    
    await sleep(3000);
    
    // Set up port forwarding based on browser type
    console.log('Forwarding ADB port...');
    
    // First try the browser-specific socket
    try {
        adb(`forward tcp:${CHROME_DEBUG_PORT} localabstract:${installedBrowser.socket}`);
        console.log(`Port forwarded via ${installedBrowser.socket}`);
    } catch (e) {
        console.log(`Failed to forward ${installedBrowser.socket}, trying alternatives...`);
    }
    
    // For WebView, we might need to find the actual socket with PID
    if (installedBrowser.socket === 'webview_devtools_remote') {
        try {
            const psOutput = adb('shell ps -A | grep webview');
            console.log('WebView processes:', psOutput);
            const pidMatch = psOutput.match(/\s+(\d+)\s+/);
            if (pidMatch) {
                const pid = pidMatch[1];
                try {
                    adb(`forward tcp:${CHROME_DEBUG_PORT} localabstract:webview_devtools_remote_${pid}`);
                    console.log(`Port forwarded via webview_devtools_remote_${pid}`);
                } catch (e) {}
            }
        } catch (e) {}
    }
    
    await sleep(2000);
    
    return installedBrowser;
}

/**
 * Get WebSocket URL from Chrome DevTools
 */
async function getWebSocketUrl(retries = 15) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`http://localhost:${CHROME_DEBUG_PORT}/json`);
            const targets = await response.json();
            console.log(`DevTools targets (${i + 1}/${retries}):`, targets.map(t => ({ type: t.type, url: t.url })));
            
            const page = targets.find(t => t.type === 'page');
            if (page) {
                return page.webSocketDebuggerUrl;
            }
            
            // If we get a response but no page, wait a bit and retry
            await sleep(1000);
        } catch (e) {
            if (i < retries - 1) {
                console.log(`Waiting for Chrome DevTools... (${i + 1}/${retries}) - ${e.message}`);
            } else {
                console.log(`Chrome DevTools not available after ${retries} attempts`);
            }
            await sleep(2000);
        }
    }
    return null;
}

/**
 * Connect via WebSocket and inject script
 */
function connectAndInject(wsUrl, script, targetUrl, saveResult = false) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        let messageId = 1;
        const pendingCallbacks = new Map();
        
        function sendCommand(method, params = {}) {
            const id = messageId++;
            return new Promise((res, rej) => {
                pendingCallbacks.set(id, { resolve: res, reject: rej });
                ws.send(JSON.stringify({ id, method, params }));
            });
        }
        
        ws.on('open', async () => {
            console.log('WebSocket connected');
            
            try {
                // Enable Page and Runtime domains
                await sendCommand('Page.enable');
                await sendCommand('Runtime.enable');
                
                // Add script to run on every new document
                await sendCommand('Page.addScriptToEvaluateOnNewDocument', {
                    source: script,
                    worldName: 'main'
                });
                
                // Navigate to target URL
                console.log(`Navigating to: ${targetUrl}`);
                await sendCommand('Page.navigate', { url: targetUrl });
                
                // Wait for page to load
                await sleep(8000);
                
                // Capture fingerprint result if requested
                if (saveResult) {
                    console.log('\nCapturing fingerprint result...');
                    try {
                        const evalResult = await sendCommand('Runtime.evaluate', {
                            expression: `
                                (function() {
                                    // Try to get fingerprint from page
                                    const pre = document.querySelector('pre');
                                    if (pre) return pre.textContent;
                                    const code = document.querySelector('code');
                                    if (code) return code.textContent;
                                    return document.body.innerText;
                                })()
                            `,
                            returnByValue: true
                        });
                        
                        if (evalResult.result && evalResult.result.value) {
                            const resultPath = process.env.RESULT_PATH || './result.json';
                            let resultData = evalResult.result.value;
                            
                            // Try to parse as JSON
                            try {
                                resultData = JSON.parse(resultData);
                                fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
                            } catch {
                                fs.writeFileSync(resultPath, resultData);
                            }
                            console.log(`Result saved to: ${resultPath}`);
                        }
                    } catch (e) {
                        console.log('Could not capture result:', e.message);
                    }
                }
                
                console.log('Script injected and page loaded');
                resolve();
            } catch (err) {
                reject(err);
            }
        });
        
        ws.on('message', (data) => {
            const msg = JSON.parse(data);
            if (msg.id && pendingCallbacks.has(msg.id)) {
                const cb = pendingCallbacks.get(msg.id);
                pendingCallbacks.delete(msg.id);
                if (msg.error) {
                    cb.reject(new Error(msg.error.message));
                } else {
                    cb.resolve(msg.result);
                }
            }
            if (msg.error && !msg.id) {
                console.log('CDP Error:', msg.error);
            }
        });
        
        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
            reject(err);
        });
    });
}

/**
 * Generate the injection script from config
 */
function generateInjectScript(cfg) {
    return `
(function() {
    'use strict';
    
    const config = ${JSON.stringify(cfg)};
    
    // ============================================
    // NATIVE FUNCTION MASKING
    // ============================================
    
    const nativeToString = Function.prototype.toString;
    const nativeFunctions = new Map();
    
    function makeNative(fn, name) {
        nativeFunctions.set(fn, \`function \${name}() { [native code] }\`);
        return fn;
    }
    
    Function.prototype.toString = function() {
        if (nativeFunctions.has(this)) {
            return nativeFunctions.get(this);
        }
        return nativeToString.call(this);
    };
    nativeFunctions.set(Function.prototype.toString, 'function toString() { [native code] }');
    
    function defineNativeGetter(obj, prop, value) {
        const getter = function() { return value; };
        makeNative(getter, \`get \${prop}\`);
        try {
            Object.defineProperty(obj, prop, {
                get: getter,
                configurable: true,
                enumerable: true
            });
        } catch (e) {}
    }
    
    // ============================================
    // NAVIGATOR SPOOFING
    // ============================================
    
    const nav = config.navigator || {};
    
    if (nav.hardwareConcurrency !== undefined) {
        defineNativeGetter(Navigator.prototype, 'hardwareConcurrency', nav.hardwareConcurrency);
    }
    if (nav.deviceMemory !== undefined) {
        defineNativeGetter(Navigator.prototype, 'deviceMemory', nav.deviceMemory);
    }
    if (nav.maxTouchPoints !== undefined) {
        defineNativeGetter(Navigator.prototype, 'maxTouchPoints', nav.maxTouchPoints);
    }
    
    // Always set webdriver to false
    defineNativeGetter(Navigator.prototype, 'webdriver', false);
    
    if (nav.pdfViewerEnabled !== undefined) {
        defineNativeGetter(Navigator.prototype, 'pdfViewerEnabled', nav.pdfViewerEnabled);
    }
    
    // ============================================
    // SCREEN SPOOFING
    // ============================================
    
    const scr = config.screen || {};
    
    ['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth'].forEach(prop => {
        if (scr[prop] !== undefined) {
            defineNativeGetter(Screen.prototype, prop, scr[prop]);
        }
    });
    
    if (scr.devicePixelRatio !== undefined) {
        defineNativeGetter(window, 'devicePixelRatio', scr.devicePixelRatio);
    }
    if (scr.innerWidth !== undefined) {
        defineNativeGetter(window, 'innerWidth', scr.innerWidth);
    }
    if (scr.innerHeight !== undefined) {
        defineNativeGetter(window, 'innerHeight', scr.innerHeight);
    }
    
    // ============================================
    // WEBGL SPOOFING
    // ============================================
    
    const webgl = config.webgl || {};
    
    if (webgl.unmaskedVendor || webgl.unmaskedRenderer) {
        const UNMASKED_VENDOR = 37445;
        const UNMASKED_RENDERER = 37446;
        const GL_VENDOR = 7936;
        const GL_RENDERER = 7937;
        
        const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = makeNative(function(param) {
            if (param === UNMASKED_VENDOR) return webgl.unmaskedVendor || webgl.vendor;
            if (param === UNMASKED_RENDERER) return webgl.unmaskedRenderer || webgl.renderer;
            if (param === GL_VENDOR && webgl.vendor) return webgl.vendor;
            if (param === GL_RENDERER && webgl.renderer) return webgl.renderer;
            return originalGetParameter.call(this, param);
        }, 'getParameter');
        
        if (typeof WebGL2RenderingContext !== 'undefined') {
            const originalGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
            WebGL2RenderingContext.prototype.getParameter = makeNative(function(param) {
                if (param === UNMASKED_VENDOR) return webgl.unmaskedVendor || webgl.vendor;
                if (param === UNMASKED_RENDERER) return webgl.unmaskedRenderer || webgl.renderer;
                if (param === GL_VENDOR && webgl.vendor) return webgl.vendor;
                if (param === GL_RENDERER && webgl.renderer) return webgl.renderer;
                return originalGetParameter2.call(this, param);
            }, 'getParameter');
        }
    }
    
    // ============================================
    // AUDIO SPOOFING
    // ============================================
    
    const audio = config.audio || {};
    
    if (audio.baseLatency !== undefined) {
        const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
        if (OriginalAudioContext) {
            const AudioContextProxy = function(...args) {
                const ctx = new OriginalAudioContext(...args);
                Object.defineProperty(ctx, 'baseLatency', {
                    get: makeNative(function() { return audio.baseLatency; }, 'get baseLatency'),
                    configurable: true
                });
                Object.defineProperty(ctx, 'outputLatency', {
                    get: makeNative(function() { return audio.outputLatency || 0; }, 'get outputLatency'),
                    configurable: true
                });
                return ctx;
            };
            AudioContextProxy.prototype = OriginalAudioContext.prototype;
            makeNative(AudioContextProxy, 'AudioContext');
            window.AudioContext = AudioContextProxy;
        }
    }
    
    // ============================================
    // BATTERY SPOOFING
    // ============================================
    
    const battery = config.battery || {};
    
    if (battery.level !== undefined) {
        const spoofedBattery = {
            charging: battery.charging ?? true,
            chargingTime: battery.chargingTime ?? Infinity,
            dischargingTime: battery.dischargingTime ?? Infinity,
            level: battery.level ?? 1,
            addEventListener: makeNative(() => {}, 'addEventListener'),
            removeEventListener: makeNative(() => {}, 'removeEventListener'),
            onchargingchange: null,
            onchargingtimechange: null,
            ondischargingtimechange: null,
            onlevelchange: null
        };
        
        Navigator.prototype.getBattery = makeNative(async function() {
            return spoofedBattery;
        }, 'getBattery');
    }
    
    // ============================================
    // WEBRTC BLOCKING
    // ============================================
    
    if (config.webrtc && config.webrtc.block) {
        const OriginalRTC = window.RTCPeerConnection || window.webkitRTCPeerConnection;
        if (OriginalRTC) {
            window.RTCPeerConnection = makeNative(function(config) {
                const pc = new OriginalRTC({ ...config, iceServers: [], iceCandidatePoolSize: 0 });
                const originalAddEventListener = pc.addEventListener.bind(pc);
                pc.addEventListener = function(type, listener, options) {
                    if (type === 'icecandidate') {
                        const wrapped = (event) => {
                            if (event.candidate) return; // Block all candidates
                            listener(event);
                        };
                        return originalAddEventListener(type, wrapped, options);
                    }
                    return originalAddEventListener(type, listener, options);
                };
                return pc;
            }, 'RTCPeerConnection');
            window.RTCPeerConnection.prototype = OriginalRTC.prototype;
        }
    }
    
    // ============================================
    // NETWORK SPOOFING
    // ============================================
    
    const network = config.network || {};
    
    if (navigator.connection && network.effectiveType) {
        ['effectiveType', 'downlink', 'rtt', 'saveData', 'type'].forEach(prop => {
            if (network[prop] !== undefined) {
                try {
                    Object.defineProperty(navigator.connection, prop, {
                        get: makeNative(() => network[prop], \`get \${prop}\`),
                        configurable: true
                    });
                } catch (e) {}
            }
        });
    }
    
    // ============================================
    // MEDIA QUERIES SPOOFING
    // ============================================
    
    const mq = config.mediaQueries || {};
    const originalMatchMedia = window.matchMedia;
    
    window.matchMedia = makeNative(function(query) {
        const result = originalMatchMedia.call(window, query);
        const createResult = (matches) => ({
            matches,
            media: query,
            onchange: null,
            addListener: makeNative(() => {}, 'addListener'),
            removeListener: makeNative(() => {}, 'removeListener'),
            addEventListener: makeNative(() => {}, 'addEventListener'),
            removeEventListener: makeNative(() => {}, 'removeEventListener'),
            dispatchEvent: makeNative(() => true, 'dispatchEvent')
        });
        
        if (query.includes('prefers-color-scheme: dark')) return createResult(mq.darkMode ?? false);
        if (query.includes('prefers-color-scheme: light')) return createResult(mq.lightMode ?? true);
        if (query.includes('pointer: coarse')) return createResult(mq.coarsePointer ?? true);
        if (query.includes('pointer: fine')) return createResult(mq.finePointer ?? false);
        if (query.includes('hover: hover')) return createResult(mq.hover ?? false);
        if (query.includes('hover: none')) return createResult(!mq.hover ?? true);
        
        return result;
    }, 'matchMedia');
    
    // ============================================
    // UA HIGH ENTROPY SPOOFING
    // ============================================
    
    const uaHE = config.uaHighEntropy || {};
    
    if (navigator.userAgentData && uaHE.platform) {
        const spoofedUAData = {
            brands: uaHE.brands || [],
            mobile: uaHE.mobile ?? true,
            platform: uaHE.platform || 'Android',
            getHighEntropyValues: makeNative(async function(hints) {
                return {
                    architecture: uaHE.architecture || '',
                    bitness: uaHE.bitness || '',
                    brands: uaHE.brands || [],
                    fullVersionList: uaHE.fullVersionList || [],
                    mobile: uaHE.mobile ?? true,
                    model: uaHE.model || '',
                    platform: uaHE.platform || 'Android',
                    platformVersion: uaHE.platformVersion || '',
                    uaFullVersion: uaHE.uaFullVersion || ''
                };
            }, 'getHighEntropyValues'),
            toJSON: makeNative(function() {
                return { brands: this.brands, mobile: this.mobile, platform: this.platform };
            }, 'toJSON')
        };
        
        defineNativeGetter(Navigator.prototype, 'userAgentData', spoofedUAData);
    }
    
    // ============================================
    // PLUGINS SPOOFING (Mobile = empty)
    // ============================================
    
    const plugins = config.plugins || [];
    const mimeTypes = config.mimeTypes || [];
    
    const createPluginArray = makeNative(function() {
        const arr = {};
        Object.defineProperty(arr, 'length', { get: () => plugins.length, enumerable: true });
        arr.item = makeNative((i) => arr[i] || null, 'item');
        arr.namedItem = makeNative((n) => null, 'namedItem');
        arr.refresh = makeNative(() => {}, 'refresh');
        arr[Symbol.iterator] = function*() {};
        return arr;
    }, 'get plugins');
    
    Object.defineProperty(Navigator.prototype, 'plugins', { get: createPluginArray, configurable: true });
    
    const createMimeTypeArray = makeNative(function() {
        const arr = {};
        Object.defineProperty(arr, 'length', { get: () => mimeTypes.length, enumerable: true });
        arr.item = makeNative((i) => arr[i] || null, 'item');
        arr.namedItem = makeNative((n) => null, 'namedItem');
        arr[Symbol.iterator] = function*() {};
        return arr;
    }, 'get mimeTypes');
    
    Object.defineProperty(Navigator.prototype, 'mimeTypes', { get: createMimeTypeArray, configurable: true });
    
    // ============================================
    // TIMEZONE SPOOFING
    // ============================================
    
    const loc = config.locale || {};
    
    if (loc.timezoneOffset !== undefined) {
        Date.prototype.getTimezoneOffset = makeNative(function() {
            return loc.timezoneOffset;
        }, 'getTimezoneOffset');
    }
    
    console.log('[FP-SPOOF] Fingerprint spoofing injected successfully');
})();
`;
}

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('CDP injection failed:', err);
        process.exit(1);
    });
}

module.exports = { main, generateInjectScript };

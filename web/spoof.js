/**
 * Fingerprint Spoof Script
 * 
 * Include this BEFORE any fingerprint detection SDK loads.
 * Works on your own website - no proxy needed!
 * 
 * Usage:
 *   <script src="/spoof.js"></script>
 *   <script src="https://fpcdn.io/v3/YOUR_KEY"></script>
 */

(function() {
  'use strict';
  
  if (window.__FP_SPOOFED__) return;
  window.__FP_SPOOFED__ = true;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION - Edit these values to match your target profile
  // ═══════════════════════════════════════════════════════════════════════════
  
  const CONFIG = {
    navigator: {
      userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36",
      appVersion: "5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36",
      platform: "Linux armv81",
      language: "en-IN",
      languages: ["en-IN", "en-GB", "en-US", "en"],
      hardwareConcurrency: 8,
      deviceMemory: 8,
      maxTouchPoints: 5,
      vendor: "Google Inc.",
      vendorSub: "",
      product: "Gecko",
      productSub: "20030107",
      webdriver: false,
      cookieEnabled: true,
      onLine: true,
      pdfViewerEnabled: false,
      doNotTrack: null,
      appCodeName: "Mozilla",
      appName: "Netscape"
    },
    screen: {
      width: 384,
      height: 832,
      availWidth: 384,
      availHeight: 832,
      availTop: 0,
      availLeft: 0,
      colorDepth: 24,
      pixelDepth: 24
    },
    window: {
      innerWidth: 384,
      innerHeight: 747,
      outerWidth: 384,
      outerHeight: 832,
      devicePixelRatio: 2.8125
    },
    webgl: {
      vendor: "Qualcomm",
      renderer: "Adreno (TM) 630",
      version: "WebGL 1.0 (OpenGL ES 2.0 Chromium)",
      shadingLanguageVersion: "WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)"
    },
    timezone: {
      offset: -330,  // IST = UTC+5:30 = -330 minutes
      name: "Asia/Calcutta"
    },
    canvas: {
      noise: true,  // Add slight noise to canvas fingerprint
      noiseSeed: 12345
    },
    audio: {
      noise: true,
      baseLatency: 0.003
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SPOOF IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('%c[FP SPOOF] Initializing...', 'color:#e74c3c;font-weight:bold;font-size:14px');

  // --- Navigator Properties ---
  const nav = CONFIG.navigator;
  Object.keys(nav).forEach(prop => {
    try {
      Object.defineProperty(Navigator.prototype, prop, {
        get: () => nav[prop],
        configurable: true
      });
    } catch(e) {}
  });

  // Also override on navigator instance
  Object.keys(nav).forEach(prop => {
    try {
      Object.defineProperty(navigator, prop, {
        get: () => nav[prop],
        configurable: true
      });
    } catch(e) {}
  });

  // --- Screen Properties ---
  const scr = CONFIG.screen;
  Object.keys(scr).forEach(prop => {
    try {
      Object.defineProperty(Screen.prototype, prop, {
        get: () => scr[prop],
        configurable: true
      });
      Object.defineProperty(screen, prop, {
        get: () => scr[prop],
        configurable: true
      });
    } catch(e) {}
  });

  // --- Window Properties ---
  const win = CONFIG.window;
  Object.keys(win).forEach(prop => {
    try {
      Object.defineProperty(window, prop, {
        get: () => win[prop],
        configurable: true
      });
    } catch(e) {}
  });

  // --- Timezone ---
  const tz = CONFIG.timezone;
  if (tz.offset !== undefined) {
    Date.prototype.getTimezoneOffset = function() { return tz.offset; };
  }
  
  // Intl.DateTimeFormat timezone
  if (tz.name) {
    const origDateTimeFormat = Intl.DateTimeFormat;
    Intl.DateTimeFormat = function(locales, options) {
      options = options || {};
      if (!options.timeZone) {
        options.timeZone = tz.name;
      }
      return new origDateTimeFormat(locales, options);
    };
    Intl.DateTimeFormat.prototype = origDateTimeFormat.prototype;
    Intl.DateTimeFormat.supportedLocalesOf = origDateTimeFormat.supportedLocalesOf;
    
    // resolvedOptions override
    const origResolvedOptions = origDateTimeFormat.prototype.resolvedOptions;
    origDateTimeFormat.prototype.resolvedOptions = function() {
      const result = origResolvedOptions.call(this);
      result.timeZone = tz.name;
      return result;
    };
  }

  // --- WebGL ---
  const webgl = CONFIG.webgl;
  
  function spoofWebGL(proto) {
    const origGetParameter = proto.getParameter;
    proto.getParameter = function(param) {
      // UNMASKED_VENDOR_WEBGL
      if (param === 37445) return webgl.vendor;
      // UNMASKED_RENDERER_WEBGL
      if (param === 37446) return webgl.renderer;
      // VERSION
      if (param === 7938 && webgl.version) return webgl.version;
      // SHADING_LANGUAGE_VERSION
      if (param === 35724 && webgl.shadingLanguageVersion) return webgl.shadingLanguageVersion;
      return origGetParameter.call(this, param);
    };
    
    // getExtension for debug info
    const origGetExtension = proto.getExtension;
    proto.getExtension = function(name) {
      const ext = origGetExtension.call(this, name);
      if (name === 'WEBGL_debug_renderer_info' && ext) {
        return {
          UNMASKED_VENDOR_WEBGL: 37445,
          UNMASKED_RENDERER_WEBGL: 37446
        };
      }
      return ext;
    };
  }
  
  spoofWebGL(WebGLRenderingContext.prototype);
  if (typeof WebGL2RenderingContext !== 'undefined') {
    spoofWebGL(WebGL2RenderingContext.prototype);
  }

  // --- Canvas Fingerprint Noise ---
  if (CONFIG.canvas && CONFIG.canvas.noise) {
    const seed = CONFIG.canvas.noiseSeed || Math.random() * 10000;
    
    // Simple seeded random
    function seededRandom() {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }
    
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type) {
      const ctx = this.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        // Add tiny noise to some pixels
        for (let i = 0; i < data.length; i += 4) {
          if (seededRandom() < 0.01) {
            data[i] = Math.min(255, data[i] + (seededRandom() < 0.5 ? 1 : -1));
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
      return origToDataURL.apply(this, arguments);
    };
    
    const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function() {
      const imageData = origGetImageData.apply(this, arguments);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (seededRandom() < 0.01) {
          data[i] = Math.min(255, data[i] + (seededRandom() < 0.5 ? 1 : -1));
        }
      }
      return imageData;
    };
  }

  // --- Audio Context Fingerprint ---
  if (CONFIG.audio && CONFIG.audio.noise) {
    const origCreateOscillator = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function() {
      const osc = origCreateOscillator.call(this);
      const origConnect = osc.connect;
      osc.connect = function(dest) {
        if (dest instanceof AnalyserNode) {
          // Slightly modify frequency
          osc.frequency.value += (Math.random() - 0.5) * 0.0001;
        }
        return origConnect.apply(this, arguments);
      };
      return osc;
    };
    
    // baseLatency
    if (CONFIG.audio.baseLatency) {
      Object.defineProperty(AudioContext.prototype, 'baseLatency', {
        get: () => CONFIG.audio.baseLatency,
        configurable: true
      });
    }
  }

  // --- Battery API ---
  if (navigator.getBattery) {
    navigator.getBattery = () => Promise.resolve({
      charging: false,
      chargingTime: Infinity,
      dischargingTime: 3600,
      level: 0.3 + Math.random() * 0.1,
      addEventListener: () => {},
      removeEventListener: () => {}
    });
  }

  // --- Plugins (appear as mobile - no plugins) ---
  Object.defineProperty(Navigator.prototype, 'plugins', {
    get: () => [],
    configurable: true
  });
  Object.defineProperty(Navigator.prototype, 'mimeTypes', {
    get: () => [],
    configurable: true
  });

  // --- Connection API ---
  if (navigator.connection) {
    Object.defineProperty(navigator, 'connection', {
      get: () => ({
        effectiveType: '4g',
        rtt: 50,
        downlink: 4.05,
        saveData: false,
        type: 'wifi',
        addEventListener: () => {},
        removeEventListener: () => {}
      }),
      configurable: true
    });
  }

  // --- Permissions API ---
  const origQuery = navigator.permissions?.query;
  if (origQuery) {
    navigator.permissions.query = function(desc) {
      // Return consistent permission states
      if (desc.name === 'notifications') {
        return Promise.resolve({ state: 'prompt', addEventListener: () => {} });
      }
      return origQuery.call(this, desc);
    };
  }

  // --- Speech Synthesis (voices fingerprinting) ---
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices = () => [];
  }

  // --- Media Devices ---
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices = () => Promise.resolve([
      { deviceId: 'default', kind: 'audioinput', label: '', groupId: 'default' },
      { deviceId: 'default', kind: 'videoinput', label: '', groupId: 'default' },
      { deviceId: 'default', kind: 'audiooutput', label: '', groupId: 'default' }
    ]);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFICATION UI
  // ═══════════════════════════════════════════════════════════════════════════

  function createIndicator() {
    if (document.getElementById('fp-spoof-indicator')) return;
    
    const btn = document.createElement('div');
    btn.id = 'fp-spoof-indicator';
    btn.innerHTML = '🛡️<br><small>SPOOFED</small>';
    btn.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      padding: 15px 20px !important;
      border-radius: 12px !important;
      font-weight: bold !important;
      font-size: 18px !important;
      z-index: 2147483647 !important;
      cursor: pointer !important;
      box-shadow: 0 4px 15px rgba(102,126,234,0.4) !important;
      text-align: center !important;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
      transition: transform 0.2s !important;
    `;
    
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    
    btn.onclick = () => {
      alert(
        'SPOOFED VALUES:\n\n' +
        '📱 Platform: ' + nav.platform + '\n' +
        '🌐 UA: ' + nav.userAgent.substring(0, 50) + '...\n' +
        '📐 Screen: ' + scr.width + 'x' + scr.height + '\n' +
        '🎮 WebGL: ' + webgl.renderer + '\n' +
        '🕐 Timezone: ' + tz.name + '\n' +
        '💻 Cores: ' + nav.hardwareConcurrency + '\n' +
        '💾 Memory: ' + nav.deviceMemory + 'GB'
      );
    };
    
    document.body.appendChild(btn);
  }

  // Add indicator when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createIndicator);
  } else {
    createIndicator();
  }

  console.log('%c[FP SPOOF] Active! Platform=' + nav.platform + ', WebGL=' + webgl.renderer, 
    'color:#27ae60;font-weight:bold;font-size:12px');
  
})();

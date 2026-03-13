"""
mitmproxy addon: Service Worker Injector with INLINE spoof code

Fixes: Mixed content issue (no HTTP fetch from HTTPS page)
The spoof code is embedded directly in the SW - no external fetch needed.

Usage:
    mitmdump -s sw_injector.py -p 8082
"""

import re
import json
import os
from mitmproxy import http

# Load spoof config
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spoof_config.json")

DEFAULT_CONFIG = {
    "navigator": {
        "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36",
        "platform": "Linux armv81",
        "language": "en-IN",
        "languages": ["en-IN", "en-GB", "en-US", "en"],
        "hardwareConcurrency": 8,
        "deviceMemory": 8,
        "maxTouchPoints": 5,
        "vendor": "Google Inc.",
        "webdriver": False
    },
    "screen": {
        "width": 384,
        "height": 832,
        "availWidth": 384,
        "availHeight": 832,
        "colorDepth": 24
    },
    "webgl": {
        "vendor": "Qualcomm",
        "renderer": "Adreno (TM) 630"
    },
    "timezone": {
        "offset": -330,
        "name": "Asia/Calcutta"
    }
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return DEFAULT_CONFIG

# The inline spoof script - will be injected directly
def get_spoof_script(config):
    return '''
(function() {
  if (window.__FP_SPOOFED__) return;
  window.__FP_SPOOFED__ = true;
  
  var C = ''' + json.dumps(config) + ''';
  
  console.log('%c[FP SPOOF] Active!', 'color:#e74c3c;font-weight:bold;font-size:16px');
  
  // Create UI indicator button - same pattern as addon.py
  function createIndicator() {
    if (document.getElementById('fp-spoof-btn')) return;
    var btn = document.createElement('div');
    btn.id = 'fp-spoof-btn';
    btn.innerHTML = '<span style="font-size:40px">✓</span><br>SPOOFED';
    btn.style.cssText = 'position:fixed !important;top:0 !important;right:0 !important;background:#2ecc71 !important;color:#fff !important;padding:25px 35px !important;border-radius:0 0 0 20px !important;font-weight:bold !important;font-size:24px !important;z-index:2147483647 !important;cursor:pointer !important;box-shadow:0 8px 30px rgba(0,0,0,0.5) !important;text-align:center !important;border:4px solid #fff !important;min-width:100px !important;';
    btn.onclick = function() {
      alert('SPOOFED VALUES:\\n\\nPlatform: ' + (C.navigator && C.navigator.platform || 'N/A') + '\\nUA: ' + ((C.navigator && C.navigator.userAgent || '').substring(0,50)) + '...\\nScreen: ' + (C.screen && C.screen.width || '?') + 'x' + (C.screen && C.screen.height || '?') + '\\nWebGL: ' + (C.webgl && C.webgl.renderer || 'N/A') + '\\nTimezone: ' + (C.timezone && C.timezone.name || 'N/A'));
    };
    (document.body || document.documentElement).appendChild(btn);
    console.log('[FP] Spoof indicator button added!');
  }
  
  // Try multiple times like addon.py
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createIndicator();
  }
  document.addEventListener('DOMContentLoaded', createIndicator);
  window.addEventListener('load', createIndicator);
  setTimeout(createIndicator, 1000);
  setTimeout(createIndicator, 3000);
  setTimeout(createIndicator, 5000);
  
  // Navigator
  var nav = C.navigator || {};
  var navProps = ['userAgent','platform','language','languages','hardwareConcurrency','deviceMemory','maxTouchPoints','vendor','webdriver','appVersion','product','productSub','vendorSub','appCodeName','appName','cookieEnabled','onLine','pdfViewerEnabled','doNotTrack'];
  navProps.forEach(function(p) {
    if (nav[p] !== undefined) {
      try {
        Object.defineProperty(Navigator.prototype, p, { get: function() { return nav[p]; }, configurable: true });
      } catch(e) {}
    }
  });
  
  // Screen
  var scr = C.screen || {};
  Object.keys(scr).forEach(function(p) {
    try {
      Object.defineProperty(Screen.prototype, p, { get: function() { return scr[p]; }, configurable: true });
    } catch(e) {}
  });
  
  // Window
  var win = C.window || {};
  Object.keys(win).forEach(function(p) {
    try {
      Object.defineProperty(window, p, { get: function() { return win[p]; }, configurable: true });
    } catch(e) {}
  });
  
  // Timezone
  var tz = C.timezone || {};
  if (tz.offset !== undefined) {
    Date.prototype.getTimezoneOffset = function() { return tz.offset; };
  }
  
  // WebGL
  var webgl = C.webgl || {};
  if (webgl.vendor || webgl.renderer) {
    var origGetParam = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(p) {
      if (p === 37445 && webgl.vendor) return webgl.vendor;
      if (p === 37446 && webgl.renderer) return webgl.renderer;
      return origGetParam.call(this, p);
    };
    if (typeof WebGL2RenderingContext !== 'undefined') {
      var origGetParam2 = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function(p) {
        if (p === 37445 && webgl.vendor) return webgl.vendor;
        if (p === 37446 && webgl.renderer) return webgl.renderer;
        return origGetParam2.call(this, p);
      };
    }
  }
  
  // Webdriver always false
  Object.defineProperty(navigator, 'webdriver', { get: function() { return false; }, configurable: true });
  
  // Show what's spoofed
  console.log('[FP] Spoofed: UA=' + (nav.userAgent||'').substring(0,40) + '...');
  console.log('[FP] Platform=' + nav.platform + ', Screen=' + (scr.width||'?') + 'x' + (scr.height||'?'));
})();
'''


def get_injector_script(config):
    spoof_code = get_spoof_script(config)
    # Escape for JS string
    spoof_escaped = spoof_code.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')
    
    return '''
<script>
(function() {
  // Run spoof immediately
  ''' + spoof_code + '''
  
  // Also try to register SW for persistence (may fail on iOS)
  if ('serviceWorker' in navigator) {
    var spoofCode = \'''' + spoof_escaped + '''\';
    
    var swLines = [
      "self.addEventListener('install', function(e) { self.skipWaiting(); });",
      "self.addEventListener('activate', function(e) { e.waitUntil(clients.claim()); });",
      "self.addEventListener('fetch', function(e) {",
      "  var accept = e.request.headers.get('accept') || '';",
      "  if (e.request.mode === 'navigate' || accept.indexOf('text/html') > -1) {",
      "    e.respondWith(fetch(e.request).then(function(r) {",
      "      return r.text().then(function(t) {",
      "        var h = t.replace(/<head/i, '<head><script>' + spoofCode + '<\\\\/script><HEAD_MARK');",
      "        h = h.replace('<HEAD_MARK', '');",
      "        return new Response(h, {status: r.status, headers: {'content-type': 'text/html'}});",
      "      });",
      "    }));",
      "  }",
      "});"
    ];
    
    try {
      var blob = new Blob([swLines.join('\\n').replace('spoofCode', JSON.stringify(spoofCode))], {type: 'application/javascript'});
      var url = URL.createObjectURL(blob);
      navigator.serviceWorker.register(url, {scope: '/'}).then(function(r) {
        console.log('[FP] SW registered for persistence');
      }).catch(function(e) {
        console.log('[FP] SW failed (expected on iOS):', e.message);
      });
    } catch(e) {}
  }
})();
</script>
'''


def inject_html(html, encoding, config):
    text = html.decode(encoding, errors="replace")
    
    # Remove CSP
    text = re.sub(r'<meta[^>]*content-security-policy[^>]*>', '', text, flags=re.I)
    
    script = get_injector_script(config)
    
    # Static HTML button that gets injected directly after <body>
    static_button = '''
<div id="fp-spoof-btn-static" style="position:fixed !important;top:0 !important;right:0 !important;background:#2ecc71 !important;color:#fff !important;padding:25px 35px !important;border-radius:0 0 0 20px !important;font-weight:bold !important;font-size:24px !important;z-index:2147483647 !important;cursor:pointer !important;box-shadow:0 8px 30px rgba(0,0,0,0.5) !important;text-align:center !important;border:4px solid #fff !important;min-width:100px !important;font-family:monospace !important;">
<span style="font-size:40px !important;">✓</span><br>SPOOFED
</div>
'''
    
    # Inject script after <head>
    if '<head' in text.lower():
        text = re.sub(r'(<head[^>]*>)', r'\1' + script, text, count=1, flags=re.I)
    else:
        text = script + text
    
    # Also inject static button after <body>
    if '<body' in text.lower():
        text = re.sub(r'(<body[^>]*>)', r'\1' + static_button, text, count=1, flags=re.I)
    
    return text.encode(encoding, errors="replace")


class SWInjector:
    def __init__(self):
        self.config = load_config()
        # Domains to skip injection (system/captive portal)
        self.skip_domains = [
            'captive.apple.com',
            'www.apple.com',
            'apple.com',
            'gstatic.com',
            'connectivitycheck.gstatic.com',
            'clients3.google.com',
            'mtalk.google.com',
        ]
        print("[FP] Inline Spoof Injector loaded")
        print("[FP] Config:", CONFIG_FILE if os.path.exists(CONFIG_FILE) else "default")
        print("[FP] Spoofing:", self.config.get('navigator', {}).get('platform', 'unknown'))

    def response(self, flow):
        # Skip certain domains
        host = flow.request.host.lower()
        if any(skip in host for skip in self.skip_domains):
            return
        
        # Strip CSP headers
        for h in ["content-security-policy", "content-security-policy-report-only", 
                  "x-content-security-policy"]:
            if h in flow.response.headers:
                del flow.response.headers[h]
        
        ct = flow.response.headers.get("content-type", "")
        if "text/html" not in ct:
            return
        
        try:
            enc = "utf-8"
            m = re.search(r"charset=([^\s;]+)", ct, re.I)
            if m:
                enc = m.group(1).strip('"')
            
            # Reload config on each request (allows live updates)
            self.config = load_config()
            
            flow.response.content = inject_html(flow.response.content, enc, self.config)
            print("[FP] Injected:", flow.request.host)
        except Exception as e:
            print("[FP] Error:", e)


addons = [SWInjector()]

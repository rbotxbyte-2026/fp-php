"""
mitmproxy addon: Service Worker Hijacker

Intercepts existing Service Worker files and injects spoof code into them.
This allows persistence even after proxy is turned off!

How it works:
1. Proxy ON → Visit a site that has a SW already (or force registration)
2. mitmproxy modifies the SW to include our spoof injection
3. Browser registers the modified SW from its real URL
4. Proxy OFF → SW persists and continues injecting spoof code!

Usage:
    mitmdump -s sw_hijacker.py -p 8082
"""

import re
import json
import os
from mitmproxy import http

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


def get_spoof_script(config):
    """The spoof script that runs in the page context"""
    return '''
(function() {
  if (window.__FP_SPOOFED__) return;
  window.__FP_SPOOFED__ = true;
  
  var C = ''' + json.dumps(config) + ''';
  
  console.log('%c[FP SPOOF] Active via SW!', 'color:#e74c3c;font-weight:bold;font-size:16px');
  
  // UI indicator
  function createBtn() {
    if (document.getElementById('fp-sw-btn')) return;
    var btn = document.createElement('div');
    btn.id = 'fp-sw-btn';
    btn.innerHTML = '<span style="font-size:30px">✓</span><br>SW';
    btn.style.cssText = 'position:fixed !important;top:0 !important;right:0 !important;background:#9b59b6 !important;color:#fff !important;padding:15px 20px !important;border-radius:0 0 0 15px !important;font-weight:bold !important;font-size:16px !important;z-index:2147483647 !important;cursor:pointer !important;box-shadow:0 4px 15px rgba(0,0,0,0.4) !important;text-align:center !important;border:3px solid #fff !important;font-family:monospace !important;';
    btn.onclick = function() { alert('SPOOFED VIA SERVICE WORKER!\\n\\nPlatform: ' + (C.navigator?.platform || 'N/A') + '\\nScreen: ' + (C.screen?.width || '?') + 'x' + (C.screen?.height || '?') + '\\nWebGL: ' + (C.webgl?.renderer || 'N/A')); };
    (document.body || document.documentElement).appendChild(btn);
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') createBtn();
  document.addEventListener('DOMContentLoaded', createBtn);
  window.addEventListener('load', createBtn);
  setTimeout(createBtn, 1000);
  setTimeout(createBtn, 3000);
  
  // Spoof navigator
  var nav = C.navigator || {};
  ['userAgent','platform','language','languages','hardwareConcurrency','deviceMemory','maxTouchPoints','vendor','webdriver'].forEach(function(p) {
    if (nav[p] !== undefined) {
      try { Object.defineProperty(Navigator.prototype, p, { get: function() { return nav[p]; }, configurable: true }); } catch(e) {}
    }
  });
  
  // Spoof screen
  var scr = C.screen || {};
  Object.keys(scr).forEach(function(p) {
    try { Object.defineProperty(Screen.prototype, p, { get: function() { return scr[p]; }, configurable: true }); } catch(e) {}
  });
  
  // Spoof timezone
  var tz = C.timezone || {};
  if (tz.offset !== undefined) {
    Date.prototype.getTimezoneOffset = function() { return tz.offset; };
  }
  
  // Spoof WebGL
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
  
  Object.defineProperty(navigator, 'webdriver', { get: function() { return false; }, configurable: true });
})();
'''


def get_sw_injection_code(config):
    """Code to inject INTO the Service Worker to make it inject our spoof into pages"""
    spoof_script = get_spoof_script(config)
    # Escape for embedding in SW
    spoof_escaped = spoof_script.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    return '''
// ═══════════════════════════════════════════════════════════════════════════
// FP SPOOF INJECTION - Added by mitmproxy SW Hijacker
// This code intercepts HTML responses and injects spoof script
// ═══════════════════════════════════════════════════════════════════════════

const __FP_SPOOF_SCRIPT__ = `''' + spoof_escaped + '''`;

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const accept = request.headers.get('accept') || '';
  
  // Only intercept HTML navigation requests
  if (request.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      fetch(request).then(function(response) {
        // Only modify HTML responses
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          return response;
        }
        
        return response.text().then(function(html) {
          // Inject spoof script at start of <head>
          let modified = html;
          if (/<head/i.test(html)) {
            modified = html.replace(/(<head[^>]*>)/i, '$1<script>' + __FP_SPOOF_SCRIPT__ + '<\\/script>');
          } else {
            modified = '<script>' + __FP_SPOOF_SCRIPT__ + '<\\/script>' + html;
          }
          
          return new Response(modified, {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers({
              'content-type': 'text/html; charset=utf-8'
            })
          });
        });
      }).catch(function(err) {
        console.log('[FP SW] Fetch error:', err);
        return fetch(request);
      })
    );
  }
});

console.log('%c[FP] Service Worker Hijacked! Spoof injection active.', 'color:#9b59b6;font-weight:bold;font-size:14px');

// ═══════════════════════════════════════════════════════════════════════════
// END FP SPOOF INJECTION
// ═══════════════════════════════════════════════════════════════════════════

'''


def is_service_worker_request(flow):
    """Detect if this is a Service Worker file request"""
    path = flow.request.path.lower()
    
    # Common SW file patterns
    sw_patterns = [
        'sw.js',
        'service-worker.js',
        'serviceworker.js',
        'firebase-messaging-sw.js',
        'pushsw.js',
        'push-sw.js',
        'ngsw-worker.js',  # Angular
        'workbox',
        'larapush-sw',
        'onesignal',
        'clevertap',
        'webpush',
    ]
    
    for pattern in sw_patterns:
        if pattern in path:
            return True
    
    # Check Service-Worker header
    if flow.request.headers.get('Service-Worker') == 'script':
        return True
    
    return False


def inject_into_sw(js_content, config):
    """Inject our spoof code into a Service Worker file"""
    injection = get_sw_injection_code(config)
    
    # Add our injection at the START of the SW (before other code)
    # This ensures our fetch handler runs first
    modified = injection + "\n\n// ═══ ORIGINAL SW CODE BELOW ═══\n\n" + js_content
    
    return modified


def get_full_sw_code(config):
    """Generate a complete standalone SW file"""
    spoof_script = get_spoof_script(config)
    spoof_escaped = spoof_script.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    return '''// FP Spoof Service Worker - Injected by mitmproxy
// This SW persists and injects spoof code into all pages

const __FP_SPOOF_SCRIPT__ = `''' + spoof_escaped + '''`;

self.addEventListener('install', function(event) {
  console.log('[FP SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[FP SW] Activated!');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const accept = request.headers.get('accept') || '';
  
  // Only intercept HTML navigation requests
  if (request.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      fetch(request).then(function(response) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          return response;
        }
        
        return response.text().then(function(html) {
          // Inject spoof script at start of <head>
          let modified = html;
          if (/<head/i.test(html)) {
            modified = html.replace(/(<head[^>]*>)/i, '$1<script>' + __FP_SPOOF_SCRIPT__ + '<\\/script>');
          } else {
            modified = '<script>' + __FP_SPOOF_SCRIPT__ + '<\\/script>' + html;
          }
          
          return new Response(modified, {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers({
              'content-type': 'text/html; charset=utf-8'
            })
          });
        });
      }).catch(function(err) {
        console.log('[FP SW] Fetch error:', err);
        return fetch(request);
      })
    );
  }
});

console.log('%c[FP] Service Worker loaded and ready!', 'color:#9b59b6;font-weight:bold;font-size:14px');
'''


def get_html_injection_script(config):
    """Script to inject into HTML pages with SW registration"""
    spoof_script = get_spoof_script(config)
    
    return '''
<script>
// Run spoof immediately
''' + spoof_script + '''

// Register our SW for persistence
if ('serviceWorker' in navigator) {
  // Update button to show registration status
  function updateSwStatus(status, color) {
    var btn = document.getElementById('fp-spoof-btn');
    if (btn) {
      btn.innerText = status;
      btn.style.background = color;
    }
  }
  
  // Try to register our injected SW
  navigator.serviceWorker.register('/fp-spoof-sw.js', {scope: '/'})
    .then(function(reg) {
      console.log('%c[FP] SW REGISTERED! Persistence enabled!', 'color:#9b59b6;font-weight:bold;font-size:14px');
      console.log('[FP] SW scope:', reg.scope);
      updateSwStatus('✓ SW OK', '#9b59b6');
    })
    .catch(function(err) {
      console.log('[FP] SW registration failed:', err.message);
      updateSwStatus('⚠ SW FAIL', '#e74c3c');
      // Try alternate path
      navigator.serviceWorker.register('/sw.js', {scope: '/'})
        .then(function(reg) {
          console.log('%c[FP] SW REGISTERED via /sw.js!', 'color:#9b59b6;font-weight:bold');
          updateSwStatus('✓ SW OK', '#9b59b6');
        })
        .catch(function(e) {
          console.log('[FP] All SW registrations failed:', e.message);
          updateSwStatus('✗ NO SW', '#e74c3c');
        });
    });
} else {
  console.log('[FP] ServiceWorker not supported');
}
</script>
'''


class SWHijacker:
    def __init__(self):
        self.config = load_config()
        self.hijacked_sws = set()
        # Paths we'll intercept and serve our SW
        self.sw_paths = ['/fp-spoof-sw.js', '/sw.js', '/service-worker.js']
        print("[FP] Service Worker Hijacker loaded")
        print("[FP] Config:", CONFIG_FILE if os.path.exists(CONFIG_FILE) else "default")
        print("[FP] Will hijack SW files AND serve fake SW at:", self.sw_paths)

    def request(self, flow):
        """Intercept requests to serve our fake SW"""
        path = flow.request.path.split('?')[0]  # Remove query string
        host = flow.request.host
        
        # Debug: log all JS requests
        if path.endswith('.js'):
            print(f"[FP] JS request: {host}{path}")
        
        # If requesting our SW paths, we'll serve our fake SW
        if path in self.sw_paths or 'spoof' in path.lower() or path == '/sw.js':
            print(f"[FP] >>> INTERCEPTING SW REQUEST: {host}{path}")
            self.config = load_config()
            sw_code = get_full_sw_code(self.config)
            
            flow.response = http.Response.make(
                200,
                sw_code.encode('utf-8'),
                {
                    "Content-Type": "application/javascript",
                    "Service-Worker-Allowed": "/",
                    "Cache-Control": "no-cache",
                }
            )
            print(f"[FP] ✓ SERVED FAKE SW: {host}{path}")

    def response(self, flow):
        # Strip CSP headers that might block our injection
        for h in ["content-security-policy", "content-security-policy-report-only"]:
            if h in flow.response.headers:
                del flow.response.headers[h]
        
        ct = flow.response.headers.get("content-type", "")
        host = flow.request.host
        path = flow.request.path
        
        # Check if this is a Service Worker file
        if is_service_worker_request(flow):
            if "javascript" in ct or path.endswith('.js'):
                try:
                    self.config = load_config()
                    original = flow.response.content.decode('utf-8', errors='replace')
                    modified = inject_into_sw(original, self.config)
                    flow.response.content = modified.encode('utf-8')
                    
                    sw_id = f"{host}{path}"
                    if sw_id not in self.hijacked_sws:
                        self.hijacked_sws.add(sw_id)
                        print(f"[FP] ✓ HIJACKED SW: {host}{path}")
                    return
                except Exception as e:
                    print(f"[FP] SW hijack error: {e}")
        
        # Also inject into HTML pages (immediate spoof + shows if SW is working)
        if "text/html" in ct:
            try:
                self.config = load_config()
                html = flow.response.content.decode('utf-8', errors='replace')
                script = get_html_injection_script(self.config)
                
                if '<head' in html.lower():
                    html = re.sub(r'(<head[^>]*>)', r'\1' + script, html, count=1, flags=re.I)
                else:
                    html = script + html
                
                # Add static button
                static_btn = '''
<div id="fp-proxy-btn" style="position:fixed !important;top:0 !important;right:0 !important;background:#2ecc71 !important;color:#fff !important;padding:15px 20px !important;border-radius:0 0 0 15px !important;font-weight:bold !important;font-size:16px !important;z-index:2147483647 !important;text-align:center !important;border:3px solid #fff !important;font-family:monospace !important;box-shadow:0 4px 15px rgba(0,0,0,0.4) !important;">
<span style="font-size:30px !important;">✓</span><br>PROXY
</div>
'''
                if '<body' in html.lower():
                    html = re.sub(r'(<body[^>]*>)', r'\1' + static_btn, html, count=1, flags=re.I)
                
                flow.response.content = html.encode('utf-8')
                print(f"[FP] Injected: {host}")
            except Exception as e:
                print(f"[FP] HTML inject error: {e}")


addons = [SWHijacker()]

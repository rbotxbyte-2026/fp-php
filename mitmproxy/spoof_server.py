"""
Flask server to serve spoof.js with CORS

Run: python3 spoof_server.py
Serves: http://192.168.1.138:5555/spoof.js

This server continues running after proxy is off!
"""

from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load spoof config from file or use defaults
SPOOF_CONFIG = {
    "navigator": {
        "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36",
        "platform": "Linux armv81",
        "language": "en-US",
        "languages": ["en-US", "en"],
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
    "window": {
        "innerWidth": 384,
        "innerHeight": 747,
        "outerWidth": 384,
        "outerHeight": 832,
        "devicePixelRatio": 2.8125
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

# The spoof.js script
SPOOF_JS = '''
// FP Spoofer - Injected via Service Worker
// This runs on every page load, even without proxy!
(function() {
  'use strict';
  
  if (window.__FP_SPOOFED__) return;
  window.__FP_SPOOFED__ = true;
  
  const CONFIG = __CONFIG__;
  
  console.log('%c[FP Spoofer] Active! (via Service Worker)', 'color:#e74c3c;font-weight:bold;font-size:14px');
  
  // === NAVIGATOR ===
  const nav = CONFIG.navigator;
  const navProps = {
    userAgent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    languages: nav.languages,
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    maxTouchPoints: nav.maxTouchPoints,
    vendor: nav.vendor,
    webdriver: nav.webdriver,
    appVersion: nav.userAgent.replace('Mozilla/', '')
  };
  
  for (const [prop, value] of Object.entries(navProps)) {
    try {
      Object.defineProperty(Navigator.prototype, prop, {
        get: () => value,
        configurable: true
      });
    } catch(e) {}
  }
  
  // === SCREEN ===
  const scr = CONFIG.screen;
  for (const [prop, value] of Object.entries(scr)) {
    try {
      Object.defineProperty(Screen.prototype, prop, {
        get: () => value,
        configurable: true
      });
    } catch(e) {}
  }
  
  // === WINDOW ===
  const win = CONFIG.window;
  for (const [prop, value] of Object.entries(win)) {
    try {
      Object.defineProperty(window, prop, {
        get: () => value,
        configurable: true
      });
    } catch(e) {}
  }
  
  // === TIMEZONE ===
  const tz = CONFIG.timezone;
  Date.prototype.getTimezoneOffset = function() { return tz.offset; };
  
  const origDTF = Intl.DateTimeFormat;
  Intl.DateTimeFormat = function(...args) {
    const dtf = new origDTF(...args);
    const origResolved = dtf.resolvedOptions.bind(dtf);
    dtf.resolvedOptions = function() {
      const opts = origResolved();
      opts.timeZone = tz.name;
      return opts;
    };
    return dtf;
  };
  Intl.DateTimeFormat.prototype = origDTF.prototype;
  Intl.DateTimeFormat.supportedLocalesOf = origDTF.supportedLocalesOf;
  
  // === WEBGL ===
  const webgl = CONFIG.webgl;
  const origGetParam = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(param) {
    if (param === 37445) return webgl.vendor;   // UNMASKED_VENDOR
    if (param === 37446) return webgl.renderer; // UNMASKED_RENDERER
    return origGetParam.call(this, param);
  };
  
  const origGetParam2 = WebGL2RenderingContext.prototype.getParameter;
  WebGL2RenderingContext.prototype.getParameter = function(param) {
    if (param === 37445) return webgl.vendor;
    if (param === 37446) return webgl.renderer;
    return origGetParam2.call(this, param);
  };
  
  // === WEBDRIVER ===
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
    configurable: true
  });
  
  // Delete automation indicators
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
  
  console.log('%c[FP Spoofer] Spoofed values:', 'color:#3498db');
  console.log('  UA:', navigator.userAgent.substring(0, 50) + '...');
  console.log('  Platform:', navigator.platform);
  console.log('  Screen:', screen.width + 'x' + screen.height);
  console.log('  WebGL:', webgl.vendor, webgl.renderer);
  console.log('  TZ:', tz.name, '(' + tz.offset + ')');
})();
'''


@app.route('/spoof.js')
def serve_spoof_js():
    """Serve the spoof.js with current config"""
    # Allow loading config from file
    config_file = os.path.join(os.path.dirname(__file__), 'spoof_config.json')
    config = SPOOF_CONFIG
    
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            print(f"[Server] Loaded config from {config_file}")
        except Exception as e:
            print(f"[Server] Config load error: {e}")
    
    js = SPOOF_JS.replace('__CONFIG__', json.dumps(config))
    
    return Response(
        js,
        mimetype='application/javascript',
        headers={
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        }
    )


@app.route('/config', methods=['GET', 'POST'])
def config():
    """Get or update spoof config"""
    config_file = os.path.join(os.path.dirname(__file__), 'spoof_config.json')
    
    if request.method == 'POST':
        data = request.get_json()
        with open(config_file, 'w') as f:
            json.dump(data, f, indent=2)
        return jsonify({"status": "saved"})
    
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            return jsonify(json.load(f))
    return jsonify(SPOOF_CONFIG)


@app.route('/status')
def status():
    """Health check"""
    return jsonify({
        "status": "running",
        "spoof_js": "http://192.168.1.138:5555/spoof.js"
    })


@app.route('/')
def index():
    return '''
    <h1>FP Spoofer Server</h1>
    <ul>
        <li><a href="/spoof.js">spoof.js</a> - The injection script</li>
        <li><a href="/config">config</a> - View/update config</li>
        <li><a href="/status">status</a> - Server status</li>
    </ul>
    <h2>How it works:</h2>
    <ol>
        <li>Run mitmproxy: <code>mitmdump -s sw_injector.py -p 8082</code></li>
        <li>Connect phone to proxy (192.168.1.138:8082)</li>
        <li>Visit target site once - Service Worker installs</li>
        <li>Turn OFF proxy on phone</li>
        <li>Spoofing continues! (SW injects spoof.js)</li>
    </ol>
    '''


if __name__ == '__main__':
    print("=" * 50)
    print("FP Spoofer Server")
    print("=" * 50)
    print(f"spoof.js: http://192.168.1.138:5555/spoof.js")
    print(f"config:   http://192.168.1.138:5555/config")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5555, debug=False)

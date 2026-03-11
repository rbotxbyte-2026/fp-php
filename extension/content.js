// content.js - Comprehensive fingerprint spoofing
// Runs in MAIN world to access page's JavaScript context

// ============================================
// ULTRA-EARLY CHROMEDRIVER DETECTION EVASION
// Must run BEFORE any other code to catch cdc_ variables
// ============================================
(function earlyAntiDetection() {
  'use strict';
  
  // 0. V8 Stack Trace Sanitization - MUST be first
  // This catches ALL Error stack traces at the V8 engine level
  // fingerprint.com analyzes stack traces to detect automation
  const originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function(error, structuredStackTrace) {
    // Filter out any automation-related frames
    const filtered = structuredStackTrace.filter(frame => {
      try {
        const fileName = frame.getFileName() || '';
        const funcName = frame.getFunctionName() || '';
        const evalOrigin = frame.getEvalOrigin?.() || '';
        const lower = (fileName + funcName + evalOrigin).toLowerCase();
        
        // Comprehensive automation detection patterns
        const automationPatterns = [
          'chromedriver', 'webdriver', 'selenium', 'puppeteer', 'playwright',
          'chrome-extension://', 'cdc_', '__driver', '__cdp',
          '__puppeteer_evaluation_script__', '__selenium_evaluate',
          'puppeteer_evaluation_script', 'devtools://',
          'debugger eval', 'eval at <anonymous>',
          'VM\\d+', // Chrome's internal VM naming for eval'd code
          '__playwright', '__nightmare',
          'runtime.evaluate', 'injectedscript'
        ];
        
        for (const pattern of automationPatterns) {
          if (lower.includes(pattern.toLowerCase()) || 
              (pattern.includes('\\') && new RegExp(pattern, 'i').test(fileName))) {
            return false;
          }
        }
        
        // Also check the script URL for CDP-injected patterns
        const scriptUrl = frame.getScriptNameOrSourceURL?.() || '';
        if (scriptUrl && (
          scriptUrl.includes('__puppeteer') ||
          scriptUrl.includes('__selenium') ||
          scriptUrl.includes('__playwright') ||
          /^VM\d+$/.test(scriptUrl)
        )) {
          return false;
        }
        
        return true;
      } catch (e) {
        return true;
      }
    });
    
    if (originalPrepareStackTrace) {
      return originalPrepareStackTrace(error, filtered);
    }
    // Default V8 format
    return error.toString() + '\n' + filtered.map(f => '    at ' + f.toString()).join('\n');
  };
  
  // 1. IMMEDIATELY delete all cdc_ variables (ChromeDriver signature)
  // These are injected by ChromeDriver before page scripts run
  const windowKeys = Object.keys(window);
  for (const key of windowKeys) {
    if (key.match(/^[\$]?cdc_/i) || key.match(/^[\$]?[a-z]{26}_$/i)) {
      try { delete window[key]; } catch (e) {}
    }
  }
  
  // 1b. Also clean document-level cdc_ variables (UC adds them here too)
  try {
    const docKeys = Object.keys(document);
    for (const key of docKeys) {
      if (key.match(/^[\$]?cdc_/i) || key.match(/^[\$]?[a-z]{26}_$/i)) {
        try { delete document[key]; } catch (e) {}
      }
    }
  } catch (e) {}
  
  // 1c. Delete domAutomationController (Chrome automation marker)
  try { delete window.domAutomationController; } catch (e) {}
  try { delete window.domAutomation; } catch (e) {}
  
  // 1d. Clean up any automation-related properties on window
  const automationProps = [
    'domAutomationController', 'domAutomation', 
    '_Selenium_IDE_Recorder', '_selenium', 'calledSelenium',
    '__webdriver_script_fn', '__driver_unwrap', '__webdriver_unwrap',
    '__selenium_unwrap', '__fxdriver_unwrap',
    '__webdriver_evaluate', '__selenium_evaluate',
    '__driver_evaluate', '__fxdriver_evaluate',
    '__lastWatirAlert', '__lastWatirConfirm', '__lastWatirPrompt',
    '$chrome_asyncScriptInfo', '__$webdriverAsyncExecutor',
    '_WEBDRIVER_ELEM_CACHE', 'ChromeDriverw',
    '__nightmare', '__puppeteer', '__playwright',
    'webdriver', '__webdriver_script_function', '__webdriver_script_func'
  ];
  for (const prop of automationProps) {
    try { delete window[prop]; } catch (e) {}
  }
  
  // 2. Fix navigator.webdriver
  // On real browsers (non-automated): navigator.webdriver is false/undefined
  // CRITICAL: Fingerprint.com detects OVERLY AGGRESSIVE overrides as "undetectedChromedriver"
  // They look for patterns like: overriding Object.prototype, Reflect methods, etc.
  // Since user is NOT using actual chromedriver, we should do MINIMAL intervention:
  // - If webdriver is already false/undefined, do nothing
  // - If webdriver is true (automated), try simple fix only
  // - DO NOT override global Object.prototype or Reflect methods - that's the detection signature!
  
  const origNavigator = navigator;
  
  // Store original methods (but DON'T override them globally)
  const origObjectProtoToString = Object.prototype.toString;
  const origSymbolHasInstance = Function.prototype[Symbol.hasInstance];
  
  // Check current webdriver state
  let needsWebdriverFix = false;
  try {
    // Only fix if webdriver is actually true (automated browser)
    // On regular Chrome, this is already false/undefined
    needsWebdriverFix = navigator.webdriver === true;
  } catch (e) {}
  
  if (needsWebdriverFix) {
    // Only apply minimal fix if actually needed
    try {
      // Try simple property override - much less detectable than Proxy
      Object.defineProperty(Navigator.prototype, 'webdriver', {
        get: function() { return false; },
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      // If that fails, try on navigator directly
      try {
        Object.defineProperty(navigator, 'webdriver', {
          get: function() { return false; },
          configurable: true
        });
      } catch (e2) {}
    }
  }
  
  // NOTE: We deliberately DO NOT:
  // - Create Proxy for navigator (detectable)
  // - Override Object.prototype.toString (detectable)
  // - Override Object.prototype.hasOwnProperty (detectable)
  // - Override Reflect.has/get/ownKeys (detectable)
  // - Override Object.getOwnPropertyDescriptor globally (detectable)
  // These patterns ARE the "undetectedChromedriver" signature!
  
  // Store original Reflect methods (for internal use only, not overriding)
  const origReflectHas = Reflect.has;
  const origReflectGet = Reflect.get;
  const origReflectOwnKeys = Reflect.ownKeys;
  const origReflectGetOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
  
  // NOTE: We deliberately DO NOT override Object.prototype.toString, 
  // Object.prototype.hasOwnProperty, Object.getOwnPropertyDescriptor, or
  // Object.getOwnPropertyNames globally. These overrides are the EXACT
  // signature that fingerprint.com looks for when detecting "undetectedChromedriver"!
  // 
  // According to UC research (uc.md):
  // "Anti-bot scripts detect the cleanup patterns themselves"
  // 
  // Since the user is NOT using actual chromedriver, these overrides are
  // not needed and only serve to trigger detection.

  // 3. Continuously monitor and delete cdc_ variables
  // ChromeDriver injects them dynamically during execution
  // NOTE: This is safe because it only cleans up variables, doesn't override prototypes
  const cleanupCdc = () => {
    try {
      // Clean window
      const keys = Object.keys(window);
      for (const key of keys) {
        if (key.match(/^[\$]?cdc_/i) || key.match(/^[\$]?[a-z]{26}_$/i)) {
          delete window[key];
        }
      }
      // Clean document
      const docKeys = Object.keys(document);
      for (const key of docKeys) {
        if (key.match(/^[\$]?cdc_/i) || key.match(/^[\$]?[a-z]{26}_$/i)) {
          delete document[key];
        }
      }
      // Clean domAutomationController if it reappears
      if ('domAutomationController' in window) {
        delete window.domAutomationController;
      }
    } catch(e) {}
  };
  
  // Run cleanup frequently for first 10 seconds, then periodically
  const cdcInterval = setInterval(cleanupCdc, 10);
  setTimeout(() => {
    clearInterval(cdcInterval);
    // Continue with slower interval
    setInterval(cleanupCdc, 500);
  }, 10000);
  
  // 4. Override Object.keys to hide cdc_ variables
  const originalKeys = Object.keys;
  Object.keys = function(obj) {
    const keys = originalKeys(obj);
    if (obj === window) {
      return keys.filter(k => !k.match(/^[\$]?cdc_/i) && !k.match(/^[\$]?[a-z]{26}_$/i));
    }
    return keys;
  };
  
  // 5. CDP (Chrome DevTools Protocol) Detection Evasion
  // This is the key detection for "undetectedChromedriver"
  // fingerprint.com looks for CDP-injected execute_cdp_cmd signatures
  
  // 5a. Block CDP Runtime.evaluate detection - only on window object
  // When UC uses CDP, it leaves trace in window.cdc_adoQpoasnfa76pfcZLmcfl_
  // Also block webdriver property being set on navigator (UC does this via CDP)
  try {
    // Only block known automation property patterns on window
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, desc) {
      // Block webdriver property being set on navigator
      if ((obj === origNavigator || obj === Navigator.prototype) && prop === 'webdriver') {
        // Silently ignore - don't let UC set webdriver
        return obj;
      }
      // Only block on window object
      if (obj === window && typeof prop === 'string') {
        // Block CDC patterns and exact automation markers
        if (prop.match(/^[\$]?cdc_/i) || prop.match(/^[\$]?[a-z]{26}_$/i)) {
          return obj; // Silently fail
        }
      }
      return originalDefineProperty(obj, prop, desc);
    };
  } catch (e) {}
  
  // 5b. Delete phantom properties if they exist (don't define them!)
  // Real browsers don't have callPhantom/_phantom at all
  // Defining them (even as undefined) makes fingerprint.com think it's PhantomJS
  try { delete window.callPhantom; } catch (e) {}
  try { delete window._phantom; } catch (e) {}
  try { delete window.phantom; } catch (e) {}
  
  // 5c. Block debugger statement detection (UC uses CDP Debugger.enable)
  // fingerprint.com times debugger statements to detect automation
  // We can't fully block this but we can make it less detectable
  
  // 5d. Hide CDP-related globals that UC might have injected
  // undetected-chromedriver sometimes leaves these traces
  const cdpGlobals = ['__cdcRequest', '__cdcResponse', '__webdriver_evaluate', '__selenium_evaluate', 
                      '__webdriver_script_function', '__webdriver_script_func', '__webdriver_script_fn',
                      '__fxdriver_evaluate', '__driver_evaluate', '__driver_unwrap', '__selenium_unwrap',
                      '__fxdriver_unwrap', '$chrome_asyncScriptInfo', '__$webdriverAsyncExecutor',
                      '__lastWatirAlert', '__lastWatirConfirm', '__lastWatirPrompt', '_Selenium_IDE_Recorder',
                      '_selenium', 'calledSelenium', '_WEBDRIVER_ELEM_CACHE', 'ChromeDriverw',
                      '__nightmare', '__puppeteer', '__playwright'];
  for (const glob of cdpGlobals) {
    try { 
      if (glob in window) {
        delete window[glob]; 
      }
    } catch (e) {}
  }
  
  // 5d-early. EARLY TOUCH FIX - Must run before fingerprinting
  // fingerprint.com checks multiple things:
  // 1. typeof TouchEvent !== 'undefined'
  // 2. 'ontouchstart' in window
  // 3. document.createEvent('TouchEvent') - THIS throws on desktop Chrome!
  // On desktop Chrome, TouchEvent exists but ontouchstart does NOT and createEvent throws
  try {
    // Add touch properties to window - CRITICAL for 'ontouchstart' in window check
    const touchEventProps = ['ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel'];
    touchEventProps.forEach(prop => {
      if (!(prop in window)) {
        Object.defineProperty(window, prop, {
          value: null,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    });
    
    // Also add to document
    touchEventProps.forEach(prop => {
      if (!(prop in document)) {
        Object.defineProperty(document, prop, {
          value: null,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    });
    
    // CRITICAL: Override document.createEvent to handle TouchEvent
    // On desktop Chrome, document.createEvent('TouchEvent') throws NotSupportedError
    // fingerprint.com uses this to detect touch support
    const originalCreateEvent = document.createEvent.bind(document);
    Object.defineProperty(document, 'createEvent', {
      value: function(eventType) {
        if (eventType === 'TouchEvent' || eventType === 'TouchEvents') {
          // Return a fake TouchEvent-like object
          const fakeEvent = originalCreateEvent.call(this, 'UIEvent');
          fakeEvent.initUIEvent('touchstart', true, true, window, 0);
          // Add touch-specific properties
          Object.defineProperties(fakeEvent, {
            touches: { value: [], writable: true, configurable: true },
            targetTouches: { value: [], writable: true, configurable: true },
            changedTouches: { value: [], writable: true, configurable: true }
          });
          return fakeEvent;
        }
        return originalCreateEvent.call(this, eventType);
      },
      writable: true,
      configurable: true
    });
    
    // Also ensure new TouchEvent() works properly for mobile profile
    // Desktop Chrome has TouchEvent but it may behave differently
    const OriginalTouchEvent = window.TouchEvent;
    if (OriginalTouchEvent) {
      const PatchedTouchEvent = function TouchEvent(type, eventInitDict) {
        try {
          return new OriginalTouchEvent(type, eventInitDict);
        } catch (e) {
          // If original throws, create a fake one
          const evt = document.createEvent('UIEvent');
          evt.initUIEvent(type, eventInitDict?.bubbles ?? true, eventInitDict?.cancelable ?? true, window, 0);
          Object.defineProperties(evt, {
            touches: { value: eventInitDict?.touches ?? [], configurable: true },
            targetTouches: { value: eventInitDict?.targetTouches ?? [], configurable: true },
            changedTouches: { value: eventInitDict?.changedTouches ?? [], configurable: true }
          });
          return evt;
        }
      };
      PatchedTouchEvent.prototype = OriginalTouchEvent.prototype;
      Object.defineProperty(window, 'TouchEvent', {
        value: PatchedTouchEvent,
        writable: true,
        configurable: true
      });
    }
  } catch (e) {
    // Silently fail
  }
  
  // 5d-early-2. Fix Developer Tools detection
  // fingerprint.com detects DevTools via multiple methods:
  // 1. outerWidth/Height vs innerWidth/Height (DevTools docked changes these)
  // 2. console.log timing (slower with DevTools open)
  // 3. Firebug detection
  // 4. debugger statement timing
  // For mobile profile, we need consistent dimensions
  // NOTE: __SPOOF_PROFILE__ is not available yet, we'll fix dimensions in main spoofing
  // Here we just ensure the detection methods don't trigger
  try {
    // Block Firebug detection
    if (!window.Firebug) {
      Object.defineProperty(window, 'Firebug', {
        get: () => undefined,
        set: () => {},
        configurable: true
      });
    }
    // Ensure chrome.devtools doesn't exist (it shouldn't in page context anyway)
    // but make sure no automation tools added it
  } catch (e) {}

  // 5e. Fix Function.prototype.toString to not reveal any spoofing
  // UC detection looks at native function patterns
  // CRITICAL: Must NEVER throw errors - that triggers toString_error signal
  const originalFunctionToString = Function.prototype.toString;
  const nativeCode = 'function () { [native code] }';
  const boundNativePattern = /^function\s*\(\)\s*\{\s*\[native code\]\s*\}$/;
  Function.prototype.toString = function() {
    try {
      // If this function was marked as native by makeNative, return native string
      if (this && this.__isNative__) {
        return 'function ' + (this.__nativeName__ || '') + '() { [native code] }';
      }
      // For bound functions and proxies, try to get original toString
      const result = originalFunctionToString.call(this);
      return result;
    } catch (e) {
      // NEVER throw - return a generic native code string
      // This prevents the toString_error tampering signal
      return 'function () { [native code] }';
    }
  };
  // Make toString itself look native
  try {
    Object.defineProperty(Function.prototype.toString, '__isNative__', { value: true, enumerable: false, configurable: false, writable: false });
    Object.defineProperty(Function.prototype.toString, '__nativeName__', { value: 'toString', enumerable: false, configurable: false, writable: false });
  } catch(e) {}
  
  // 5f. Override console methods to hide our logging from fingerprinters
  // Some detection scripts check for console modifications
  try {
    const origConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      profile: console.profile,
      profileEnd: console.profileEnd
    };
    // Store original for our use - non-enumerable to avoid detection
    Object.defineProperty(window, '__fpOrigConsole', {
      value: origConsole,
      writable: true,
      enumerable: false,
      configurable: true
    });
    
    // 5f-1. Block console.profile() DevTools detection
    // FP.com uses: console.profile(); console.profileEnd(); 
    // These throw when DevTools is closed, but succeed when open
    // On mobile, these APIs should not exist or be no-ops
    console.profile = function() { return undefined; };
    console.profileEnd = function() { return undefined; };
    
    // Make them look native
    console.profile.toString = () => 'function profile() { [native code] }';
    console.profileEnd.toString = () => 'function profileEnd() { [native code] }';
  } catch (e) {}
  
  // 5g. Block DevTools detection via outerHeight/outerWidth difference
  // fingerprint.com checks window.outerHeight - window.innerHeight > threshold
  // We'll handle this in the main spoofing section with screen data
  
})();

// EMBEDDED DEFAULT PROFILE - Loaded synchronously to ensure config is available at document_start
// This solves the timing issue where background.js injects config AFTER content.js runs
const EMBEDDED_DEFAULT_PROFILE = {"server":{"ip":"2405:f600:8:e0a9:985c:f5c3:3402:a232","protocol":"HTTP/1.0","https":true,"port":"80","request_time":"2026-03-10 06:08:42","user_agent":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36","accept":"*/*","accept_language":"en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,gu;q=0.6","accept_encoding":"gzip, br","connection":"close","cache_control":null,"dnt":null,"upgrade_insecure":null,"referer":"https://botxbyte.com/fp.php","origin":"https://botxbyte.com","te":null,"priority":"u=1, i","sec_fetch_site":"same-origin","sec_fetch_mode":"cors","sec_fetch_dest":"empty","sec_fetch_user":null,"ch_ua":"\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"","ch_ua_mobile":"?1","ch_ua_platform":"\"Android\"","ch_ua_arch":null,"ch_ua_bitness":null,"ch_ua_full_version_list":null,"ch_ua_model":null,"x_forwarded_for":"2405:f600:8:e0a9:985c:f5c3:3402:a232, 172.70.230.48","x_real_ip":null,"via":null,"cf_connecting_ip":"2405:f600:8:e0a9:985c:f5c3:3402:a232","cf_ipcountry":"IN","cf_ray":"9da02576ecf41494-EWR","cdn_loop":"cloudflare; loops=1","x_forwarded_proto":"https","ja3_hash":null,"ja3_string":null,"ja4_hash":null,"tls_client_hello_hex":null,"all_headers":{"Cf-Visitor":"{\"scheme\":\"https\"}","Cf-Ipcountry":"IN","Cf-Connecting-Ip":"2405:f600:8:e0a9:985c:f5c3:3402:a232","Cdn-Loop":"cloudflare; loops=1","Cf-Ray":"9da02576ecf41494-EWR","Accept-Language":"en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,gu;q=0.6","Accept-Encoding":"gzip, br","Referer":"https://botxbyte.com/fp.php","Sec-Fetch-Dest":"empty","Sec-Fetch-Mode":"cors","Sec-Fetch-Site":"same-origin","Origin":"https://botxbyte.com","Accept":"*/*","Sec-Ch-Ua-Mobile":"?1","Content-Type":"application/json","Sec-Ch-Ua":"\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"","User-Agent":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36","X-Requested-With":"XMLHttpRequest","Sec-Ch-Ua-Platform":"\"Android\"","Priority":"u=1, i","Content-Length":"44862","Connection":"close","X-Forwarded-Proto":"https","X-Forwarded-For":"2405:f600:8:e0a9:985c:f5c3:3402:a232, 172.70.230.48","X-Server-Addr":"107.170.48.37","Host":"botxbyte.com","Authorization":""},"header_order":["Cf-Visitor","Cf-Ipcountry","Cf-Connecting-Ip","Cdn-Loop","Cf-Ray","Accept-Language","Accept-Encoding","Referer","Sec-Fetch-Dest","Sec-Fetch-Mode","Sec-Fetch-Site","Origin","Accept","Sec-Ch-Ua-Mobile","Content-Type","Sec-Ch-Ua","User-Agent","X-Requested-With","Sec-Ch-Ua-Platform","Priority","Content-Length","Connection","X-Forwarded-Proto","X-Forwarded-For","X-Server-Addr","Host","Authorization"],"header_count":27},"ipTimezoneEnabled":true,"client":{"navigator":{"userAgent":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36","appVersion":"5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36","appName":"Netscape","appCodeName":"Mozilla","product":"Gecko","productSub":"20030107","platform":"Linux armv81","vendor":"Google Inc.","vendorSub":"","language":"en-IN","languages":["en-IN","en-GB","en-US","en","gu"],"cookieEnabled":true,"doNotTrack":null,"globalPrivacyControl":null,"hardwareConcurrency":8,"deviceMemory":8,"maxTouchPoints":5,"pdfViewerEnabled":null,"webdriver":false,"onLine":true,"javaEnabled":false,"cookieStore":true},"screen":{"width":384,"height":832,"availWidth":384,"availHeight":832,"colorDepth":24,"pixelDepth":24,"devicePixelRatio":2.8125,"orientationType":"portrait-primary","orientationAngle":0,"innerWidth":384,"innerHeight":699,"outerWidth":384,"outerHeight":832,"screenX":0,"screenY":0,"pageXOffset":0,"pageYOffset":0,"scrollbarWidth":0,"isFullscreen":false},"locale":{"timezone":"Asia/Calcutta","timezoneOffset":-330,"locale":"en-GB","calendar":"gregory","numberingSystem":"latn","localeDateString":"10/03/2026","localeTimeString":"11:38:40"},"canvas":{"hash":"20eb40bf","geometry_hash":"1c675ab6","winding_rule":true},"webgl":{"supported":true,"vendor":"WebKit","renderer":"WebKit WebGL","version":"WebGL 1.0 (OpenGL ES 2.0 Chromium)","shadingLanguageVersion":"WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)","unmaskedVendor":"Qualcomm","unmaskedRenderer":"Adreno (TM) 630","maxTextureSize":4096,"maxCubeMapTextureSize":4096,"maxViewportDims":[16384,16384],"maxVertexAttribs":32,"maxVertexUniformVectors":256,"maxFragmentUniformVectors":256,"maxCombinedTextureUnits":96,"maxVertexTextureUnits":16,"maxTextureImageUnits":16,"maxRenderbufferSize":16384,"maxVaryingVectors":31,"aliasedLineWidthRange":[1,8],"aliasedPointSizeRange":[1,1023],"redBits":8,"greenBits":8,"blueBits":8,"alphaBits":8,"depthBits":24,"stencilBits":0,"subpixelBits":4,"extensionCount":23,"extensionHash":"79cb5ed9","extensions":["ANGLE_instanced_arrays","EXT_blend_minmax","EXT_color_buffer_half_float","EXT_float_blend","EXT_texture_filter_anisotropic","EXT_sRGB","OES_element_index_uint","OES_fbo_render_mipmap","OES_standard_derivatives","OES_texture_float","OES_texture_float_linear","OES_texture_half_float","OES_texture_half_float_linear","OES_vertex_array_object","WEBGL_color_buffer_float","WEBGL_compressed_texture_astc","WEBGL_compressed_texture_etc","WEBGL_compressed_texture_etc1","WEBGL_debug_renderer_info","WEBGL_debug_shaders","WEBGL_depth_texture","WEBGL_lose_context","WEBGL_multi_draw"],"shaderRenderHash":"1280848c","rasterizationMethod":"hardware"},"webgl2":{"supported":true,"maxSamples":4,"maxUniformBufferBindings":84,"maxTransformFeedbackSeparateComponents":4,"maxElementsVertices":2147483647,"maxElementsIndices":2147483647,"max3DTextureSize":2048,"maxArrayTextureLayers":2048,"maxColorAttachments":8,"maxDrawBuffers":8},"audio":{"sampleRate":44100,"sampleRateLive":48000,"hash":"26005579","fullHash":"2d99ce51","value":124.08075643483608,"maxChannelCount":2,"contextState":"suspended","numberOfChannels":1,"duration":1},"plugins":[],"mimeTypes":[],"fonts":{"detected":["Arial","Courier","Courier New","Georgia","Tahoma","Times New Roman","Verdana","Helvetica","Baskerville","Palatino","Courier New"],"count":11,"metricsHash":"23adb0f9"},"features":{"localStorage":true,"sessionStorage":true,"indexedDB":true,"openDatabase":false,"caches":true,"serviceWorker":true,"webWorker":true,"sharedWorker":false,"webSocket":true,"webRTC":true,"fetch":true,"bluetooth":true,"usb":true,"nfc":false,"serial":true,"hid":false,"xr":true,"gamepad":true,"geolocation":true,"deviceMotion":true,"deviceOrientation":true,"ambientLight":false,"notifications":true,"speechSynthesis":true,"speechRecognition":true,"mediaSession":true,"paymentRequest":true,"credentials":true,"wakeLock":true,"pictureInPicture":true,"clipboard":true,"share":true,"contacts":true,"fileSystem":true,"eyeDropper":false,"pointerEvents":true,"touchEvents":true,"wasm":true,"wasmStreaming":true,"offscreenCanvas":true,"cryptoSubtle":true,"intersectionObserver":true,"resizeObserver":true,"mutationObserver":true,"broadcastChannel":true,"scheduler":true,"requestIdleCallback":true},"webrtc":{"ips":["192.168.1.123","2405:f600:8:e0a9:985c:f5c3:3402:a232","103.178.154.170"],"ipv4":["192.168.1.123","103.178.154.170"],"ipv6":["2405:f600:8:e0a9:985c:f5c3:3402:a232"]},"battery":{"charging":false,"chargingTime":null,"dischargingTime":3,"level":0.85},"mediaDevices":[{"kind":"audioinput","label":"(requires permission)","deviceId":null,"groupId":null},{"kind":"videoinput","label":"(requires permission)","deviceId":null,"groupId":null},{"kind":"audiooutput","label":"(requires permission)","deviceId":null,"groupId":null}],"network":{"effectiveType":"4g","downlink":1.55,"rtt":50,"saveData":false,"type":"wifi"},"mediaQueries":{"darkMode":false,"lightMode":true,"reducedMotion":false,"reducedTransparency":false,"reducedData":false,"highContrast":false,"invertedColors":false,"hdr":false,"coarsePointer":true,"finePointer":false,"noPointer":false,"hover":false,"anyHover":false,"colorGamutSRGB":true,"colorGamutP3":false,"colorGamutRec2020":false,"print":false,"monochrome":false,"overflowInline":true},"permissions":{"ambient-light-sensor":"unsupported","window-placement":"unsupported","geolocation":"prompt","notifications":"prompt","camera":"prompt","microphone":"prompt","clipboard-read":"prompt","clipboard-write":"granted","payment-handler":"granted","background-sync":"granted","persistent-storage":"prompt","accelerometer":"granted","gyroscope":"granted","magnetometer":"granted","midi":"prompt","background-fetch":"granted","nfc":"prompt","screen-wake-lock":"granted","idle-detection":"prompt","display-capture":"prompt","storage-access":"granted"},"speechVoices":[],"document":{"characterSet":"UTF-8","contentType":"text/html","referrer":"","visibilityState":"visible","historyLength":2,"cookieCount":0,"domainLookupTime":null,"URL":"https://botxbyte.com/fp.php","protocol":"https:","host":"botxbyte.com"},"math":{"tan_neg1e300":-1.4214488238747245,"sin_1":0.8414709848078965,"cos_1":0.5403023058681398,"atan2":1.1071487177940904,"exp_1":2.718281828459045,"log_pi":1.1447298858494002,"sqrt_2":1.4142135623730951,"pow_pi":1.9275814160560206e-50,"acos":1.4470237543681796,"asin":0.12377257242671708,"sinh_1":1.1752011936438014,"cosh_1":1.5430806348152437,"tanh_1":0.7615941559557649,"log2_pi":1.6514961294723187,"log10_pi":0.4971498726941338,"cbrt_2":1.2599210498948732,"hypot":5,"fround":1.3370000123977661,"clz32":31,"imul":12,"trunc":-1,"sign":-1,"expm1":1.718281828459045,"log1p":0.6931471805599453},"performance":{"timerResolutionMs":0.1,"timerGranularity":"coarse_100us","timerSamples":[0.1,0.1,0.1,0.2,0.1,0.1,0.1,0.1,0.1,0.1],"navigationTiming":{"type":"navigate","redirectCount":0,"domInteractive":1186,"domContentLoaded":1198,"loadEvent":1199,"ttfb":500,"transferSize":52093,"encodedBodySize":51793},"memory":{"jsHeapSizeLimit":1130000000,"totalJSHeapSize":10000000,"usedJSHeapSize":10000000},"timeOrigin":1773122913591.5,"now":6798.399999856949},"stackTrace":{"engine":"V8(Chrome/Node)","sample":"Error: fp |     at getStackTrace (https://botxbyte.com/fp.php:694:21) |     at collect (https://botxbyte.com/fp.php:4510:21)","lines":4},"internals":{"toStringTags":{"Window":"[object Window]","Document":"[object HTMLDocument]","Navigator":"[object Navigator]","Screen":"[object Screen]","Location":"[object Location]","History":"[object History]"},"windowProto":"Window","docProto":"HTMLDocument","nativeChecks":{"navigator.userAgent getter":"native","navigator.platform getter":"native","navigator.hardwareConcurrency":"native"},"iteratorSymbol":"symbol","asyncIterator":"symbol"},"cssSupport":{"grid":true,"flexbox":true,"customProperties":true,"containerQueries":true,"hasSelector":true,"subgrid":true,"cascade":false,"colorMix":true,"nesting":true,"scrollTimeline":true,"viewTimeline":true,"anchorPosition":true,"startingStyle":false,"math":true,"clamp":true,"aspectRatio":true,"gap":true,"backdropFilter":true,"contain":true,"contentVisibility":true,"overscrollBehavior":true,"scrollBehavior":true},"cssComputedStyles":{"fontFamily":"\"Courier New\", monospace","fontSize":"16px","color":"rgb(201, 209, 217)","backgroundColor":"rgba(0, 0, 0, 0)","lineHeight":"normal","boxSizing":"border-box","nativeScrollbarWidth":0},"cpu":{"hardwareConcurrency":8,"deviceMemory":8,"wasm_supported":true,"wasm_simd":true,"wasm_threads":false,"wasm_bulk_memory":true,"wasm_sat_float":false,"estimated_arch":"ARM64_NEON"},"architecture":{"byte":-1,"method":"int8_probe","float32Byte0":0,"wasmMemRead":"error","uaDataArch":null,"uaDataBitness":null,"uaDataPlatform":"Android","uaDataPlatformVersion":"11.0.0","uaDataModel":"ONEPLUS A6010"},"refreshRate":{"measured_fps":60,"snapped_hz":60,"avg_frame_ms":16.656},"videoDecoder":{"supported":true,"codecs":{"h264":"supported","h265":"supported","vp8":"supported","vp9":"supported","av1":"supported"}},"behavioral":{"mouse":null,"keyboard":null,"scroll":{"eventCount":0,"totalDelta":0,"sample":[]},"clicks":{"count":0,"avgPressure":null,"avgInterval":null},"touch":{"radii":[],"pressures":[]},"sensors":{"motion":{"x":0,"y":0,"z":-0.1,"gx":-0.8,"gy":8.6,"gz":4.5,"interval":16},"orientation":{"alpha":0,"beta":61.5,"gamma":9.200000000000001,"absolute":false}},"sessionDuration":6192},"fontPreferences":{"default":455.95556640625,"apple":455.95556640625,"sans":455.95556640625,"serif":498.6333312988281,"mono":377.8166809082031,"system":455.95556640625,"min":9.449999809265137},"webglPrecisions":{"contextAttributes":{"alpha":true,"antialias":true,"depth":true,"desynchronized":false,"failIfMajorPerformanceCaveat":false,"powerPreference":"default","premultipliedAlpha":true,"preserveDrawingBuffer":false,"stencil":false,"xrCompatible":false},"contextAttributesHash":"13f1d07c","shaderPrecisions":{"VERTEX_LOW_FLOAT":{"rangeMin":127,"rangeMax":127,"precision":23},"VERTEX_MEDIUM_FLOAT":{"rangeMin":127,"rangeMax":127,"precision":23},"VERTEX_HIGH_FLOAT":{"rangeMin":127,"rangeMax":127,"precision":23},"VERTEX_LOW_INT":{"rangeMin":31,"rangeMax":31,"precision":0},"VERTEX_MEDIUM_INT":{"rangeMin":31,"rangeMax":31,"precision":0},"VERTEX_HIGH_INT":{"rangeMin":31,"rangeMax":31,"precision":0},"FRAGMENT_LOW_FLOAT":{"rangeMin":15,"rangeMax":15,"precision":10},"FRAGMENT_MEDIUM_FLOAT":{"rangeMin":15,"rangeMax":15,"precision":10},"FRAGMENT_HIGH_FLOAT":{"rangeMin":127,"rangeMax":127,"precision":23},"FRAGMENT_LOW_INT":{"rangeMin":15,"rangeMax":15,"precision":0},"FRAGMENT_MEDIUM_INT":{"rangeMin":15,"rangeMax":15,"precision":0},"FRAGMENT_HIGH_INT":{"rangeMin":31,"rangeMax":31,"precision":0}},"shaderPrecisionsHash":"510ff2a0","extensionPresenceHash":"46f092d0"},"audioLatency":{"baseLatency":0.003,"outputLatency":0,"sampleRate":48000,"state":"suspended","maxChannelCount":2,"channelCount":2,"channelInterpretation":"speakers"},"domBlockers":{"detected":false,"blockedCount":0,"blockedClasses":[],"allResults":{"ad-banner":false,"ad-unit":false,"adsbox":false,"ad-slot":false,"adsbygoogle":false,"banner_ad":false,"pub_300x250":false,"pub_300x250m":false,"pub_728x90":false,"text-ad":false,"textAd":false,"text_ad":false,"text_ads":false,"textads":false,"sponsoredMidArticle":false,"mmnetwork-ad":false,"ad-text":false,"googlead":false,"GoogleActiveViewElement":false,"#AdHeader":false,"#AdContainer":false,"#ad-container":false,"#advertise":false,"#adbar":false}},"emojiBoundingBox":{"width":159.711,"height":150.044,"top":-9999,"bottom":-9848.956,"left":-9999,"right":-9839.289},"mathmlBoundingBox":{"width":29.222,"height":17.978,"supported":true},"screenFrame":{"top":0,"left":0,"right":0,"bottom":0,"availTop":null,"availLeft":null},"colorProfile":{"colorGamutString":"srgb","contrastPreference":0,"monochromeDepth":0,"colorDepth":24,"hdrCapability":false},"vendorFlavors":[],"navigatorExtra":{"oscpu":null,"cpuClass":null,"buildID":null,"productSub":"20030107","taintEnabled":null,"uaData_brands":[{"brand":"Not:A-Brand","version":"99"},{"brand":"Google Chrome","version":"145"},{"brand":"Chromium","version":"145"}],"uaData_mobile":true,"uaData_platform":"Android","privateClickMeasurement":false,"webkitMessageHandlers":null,"connection_saveData":false,"mimeTypesLength":0,"pluginsLength":0},"incognito":{"isPrivate":false,"method":null,"confidence":"low"},"tampering":{"anomalyScore":35,"signals":["no_chrome_runtime","chrome_no_plugins","toString_error"],"webdriver":false,"inIframe":false,"devtoolsOpen":false,"antiDetectBrowser":false},"mathHash":"100ac6dd","webglExtra":{"unsupportedExtensions":["EXT_clip_control","EXT_color_buffer_float","EXT_depth_clamp","EXT_disjoint_timer_query","EXT_disjoint_timer_query_webgl2","EXT_frag_depth","EXT_polygon_offset_clamp","EXT_shader_texture_lod","EXT_texture_compression_bptc","EXT_texture_compression_rgtc","EXT_texture_mirror_clamp_to_edge","KHR_parallel_shader_compile","OES_draw_buffers_indexed","WEBGL_blend_func_extended","WEBGL_clip_cull_distance","WEBGL_compressed_texture_atc","WEBGL_compressed_texture_pvrtc","WEBGL_compressed_texture_s3tc","WEBGL_compressed_texture_s3tc_srgb","WEBGL_draw_buffers","WEBGL_polygon_mode","WEBKIT_WEBGL_compressed_texture_pvrtc"],"unsupportedCount":22,"allParametersHash":"47e9739e"},"dateTimeLocale":{"numberFormatLocale":"en-GB","numberingSystem":"latn","formattedTestNumber":"1,234,567.89","dateTimeLocale":"en-GB","dateTimeCalendar":"gregory","dateTimeTimeZone":"Asia/Calcutta","relativeTimeLocale":"en-GB","collatorLocale":"en-GB","pluralRulesLocale":"en-GB","localeHash":"32e75347"},"multiMonitor":{"isExtended":false,"getScreenDetailsAPI":true,"screenCount":null,"screens":null},"pwaInfo":{"displayMode":"browser","isStandalone":false,"navigatorStandalone":false,"isInstalled":false,"launchQueue":true,"getInstalledRelatedApps":true},"mediaCapabilities":{"supported":true,"codecs":{"audio/mp4; codecs=\"mp4a.40.2\"":{"supported":true,"smooth":true,"powerEfficient":true},"audio/webm; codecs=\"opus\"":{"supported":true,"smooth":true,"powerEfficient":true},"video/mp4; codecs=\"avc1.42E01E\"":{"supported":true,"smooth":true,"powerEfficient":true},"video/webm; codecs=\"vp09.00.10.08\"":{"supported":true,"smooth":true,"powerEfficient":true},"video/mp4; codecs=\"av01.0.05M.08\"":{"supported":true,"smooth":true,"powerEfficient":false}}},"rtcCapabilities":{"supported":true,"videoCodecs":[{"mimeType":"video/VP8","clockRate":90000,"sdpFmtpLine":null},{"mimeType":"video/rtx","clockRate":90000,"sdpFmtpLine":null},{"mimeType":"video/AV1","clockRate":90000,"sdpFmtpLine":"level-idx=5;profile=0;tier=0"},{"mimeType":"video/VP9","clockRate":90000,"sdpFmtpLine":"profile-id=0"},{"mimeType":"video/H264","clockRate":90000,"sdpFmtpLine":"level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f"},{"mimeType":"video/H264","clockRate":90000,"sdpFmtpLine":"level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f"},{"mimeType":"video/H264","clockRate":90000,"sdpFmtpLine":"level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f"},{"mimeType":"video/H264","clockRate":90000,"sdpFmtpLine":"level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f"},{"mimeType":"video/H265","clockRate":90000,"sdpFmtpLine":"level-id=150;profile-id=1;tier-flag=0;tx-mode=SRST"},{"mimeType":"video/red","clockRate":90000,"sdpFmtpLine":null},{"mimeType":"video/ulpfec","clockRate":90000,"sdpFmtpLine":null}],"audioCodecs":[{"mimeType":"audio/opus","clockRate":48000,"channels":2},{"mimeType":"audio/red","clockRate":48000,"channels":2},{"mimeType":"audio/G722","clockRate":8000,"channels":1},{"mimeType":"audio/PCMU","clockRate":8000,"channels":1},{"mimeType":"audio/PCMA","clockRate":8000,"channels":1},{"mimeType":"audio/CN","clockRate":8000,"channels":1},{"mimeType":"audio/telephone-event","clockRate":48000,"channels":1},{"mimeType":"audio/telephone-event","clockRate":8000,"channels":1}],"videoCount":11,"audioCount":8},"perfObserverTypes":{"supported":true,"entryTypes":["element","event","first-input","largest-contentful-paint","layout-shift","long-animation-frame","longtask","mark","measure","navigation","paint","resource","visibility-state"],"count":13,"hash":"45e14c21"},"featurePolicy":{"supported":true,"allowedFeatures":["geolocation","ch-ua-full-version-list","cross-origin-isolated","screen-wake-lock","on-device-speech-recognition","publickey-credentials-get","shared-storage-select-url","ch-ua-arch","bluetooth","ch-prefers-reduced-transparency","deferred-fetch","usb","ch-save-data","publickey-credentials-create","shared-storage","deferred-fetch-minimal","run-ad-auction","ch-downlink","ch-ua-form-factors","otp-credentials","payment","ch-ua","ch-ua-model","ch-ect","autoplay","camera","private-state-token-issuance","digital-credentials-get","accelerometer","ch-ua-platform-version","idle-detection","private-aggregation","interest-cohort","ch-viewport-height","ch-ua-platform","midi","ch-ua-full-version","xr-spatial-tracking","clipboard-read","gamepad","display-capture","keyboard-map","join-ad-interest-group","aria-notify","local-network","ch-ua-high-entropy-values","ch-width","ch-prefers-reduced-motion","browsing-topics","encrypted-media","local-network-access","gyroscope","serial","ch-rtt","ch-ua-mobile","window-management","unload","ch-dpr","ch-prefers-color-scheme","ch-ua-wow64","attribution-reporting","fullscreen","identity-credentials-get","private-state-token-redemption","ch-ua-bitness","storage-access","sync-xhr","ch-device-memory","ch-viewport-width","picture-in-picture","magnetometer","loopback-network","clipboard-write","microphone"],"allowedCount":74,"featureStates":{"camera":true,"microphone":true,"geolocation":true,"payment":true,"usb":true,"bluetooth":true,"accelerometer":true,"gyroscope":true,"magnetometer":true,"fullscreen":true,"picture-in-picture":true,"autoplay":true,"encrypted-media":true,"midi":true,"screen-wake-lock":true,"xr-spatial-tracking":true,"ambient-light-sensor":false,"battery":false,"document-domain":false,"sync-xhr":true,"clipboard-read":true,"clipboard-write":true}},"apiPresence":{"webTransport":true,"webRTC_insertable_streams":true,"compressionStream":true,"decompressionStream":true,"trustedTypes":true,"reportingObserver":true,"navigationAPI":true,"sanitizerAPI":false,"schedulerPostTask":true,"taskController":true,"idleDetector":true,"documentPiP":false,"storageManager":true,"fileSystemAccess":true,"accessHandle":true,"cssHoudini":true,"audioWorklet":true,"abortSignalAny":true,"abortSignalTimeout":true,"structuredClone":true,"webLocks":true,"keyboardAPI":true,"presentationAPI":true,"midiAccess":true,"digitalGoods":true,"userActivation":true,"windowControlsOverlay":true,"cookieStore":true,"backgroundFetch":true,"periodicSync":true,"contentIndex":true,"paymentHandler":false,"canvasRoundRect":true,"canvasReset":true,"canvasFilter":true,"fontsReadyAPI":true,"fontFaceSet":true,"cssTypedOM":true,"cssLayoutWorklet":false,"eyeDropper":false,"getScreenDetails":true,"virtualKeyboard":true,"handwriting":false,"ink":true,"serial":true,"hid":false,"userAgentData":true},"userActivation":{"supported":true,"isActive":false,"hasBeenActive":false},"networkExtended":{"effectiveType":"4g","downlink":1.55,"downlinkMax":null,"rtt":50,"saveData":false,"type":"wifi","onchange":true},"eventCounts":{"supported":true,"counts":{"pointerdown":0,"touchend":0,"input":0,"keydown":0,"mouseleave":0,"mouseenter":0,"drop":0,"beforeinput":0,"pointerenter":0,"dragend":0,"pointercancel":0,"compositionupdate":0,"mousedown":0,"dragleave":0,"dragover":0,"mouseup":0,"pointerover":0,"lostpointercapture":0,"mouseover":0,"gotpointercapture":0,"dblclick":0,"keyup":0,"keypress":0,"pointerup":0,"compositionstart":0,"auxclick":0,"dragstart":0,"touchstart":0,"compositionend":0,"pointerout":0,"dragenter":0,"touchcancel":0,"click":0,"contextmenu":0,"mouseout":0,"pointerleave":0},"totalEvents":0},"uaHighEntropy":{"supported":true,"architecture":null,"bitness":null,"brands":[{"brand":"Not:A-Brand","version":"99"},{"brand":"Google Chrome","version":"145"},{"brand":"Chromium","version":"145"}],"fullVersionList":[{"brand":"Not:A-Brand","version":"99.0.0.0"},{"brand":"Google Chrome","version":"145.0.7632.159"},{"brand":"Chromium","version":"145.0.7632.159"}],"mobile":true,"model":"ONEPLUS A6010","platform":"Android","platformVersion":"11.0.0","uaFullVersion":"145.0.7632.159"},"storageInfo":{"storageEstimate":{"quota":69430758604,"usage":0,"usageDetails":[]},"persistentStorage":false,"hasStorageAccess":true,"cookieStoreSupported":true},"fontLoading":{"supported":true,"readyTimeMs":0.1,"status":"loaded","loadedFamilies":0},"hypervisorProbe":{"mean_ms":0.085,"stdDev_ms":0.0823,"min_ms":0,"max_ms":0.2,"cv_percent":96.84,"possibleVM":true},"memoryPattern":{"supported":true,"allocations":[{"pages":1,"sizeKB":64,"allocMs":0.4,"touchMs":0},{"pages":10,"sizeKB":640,"allocMs":0,"touchMs":0.1},{"pages":50,"sizeKB":3200,"allocMs":0,"touchMs":0.1},{"pages":100,"sizeKB":6400,"allocMs":0.1,"touchMs":0.1},{"pages":256,"sizeKB":16384,"allocMs":0,"touchMs":0}],"patternHash":"2026c7bb"},"fontsByCSS":{"detected":["Arial","Georgia","Helvetica","Verdana","Times New Roman","Courier New","Baskerville"],"count":7,"method":"css_offsetWidth"},"extendedPermissions":{"supported":true,"permissions":{"push":"unsupported","speaker-selection":"unsupported","local-fonts":"unsupported","captured-surface-control":"unsupported","keyboard-lock":"unsupported","pointer-lock":"unsupported","fullscreen":"unsupported","window-management":"denied"}},"securityContext":{"crossOriginIsolated":false,"isSecureContext":true,"originAgentCluster":true,"documentPrerendering":false,"credentialless":false,"hasPrivateToken":true,"openDatabaseStatus":"absent","canvasColorSpaceP3":true,"canvasColorSpaceSRGB":true},"visualViewport":{"supported":true,"width":384,"height":699.38,"offsetLeft":0,"offsetTop":0,"pageLeft":0,"pageTop":0,"scale":1},"mediaConstraints":{"supported":true,"constraints":{"aspectRatio":true,"autoGainControl":true,"brightness":true,"channelCount":true,"colorTemperature":true,"contrast":true,"deviceId":true,"displaySurface":true,"echoCancellation":true,"exposureCompensation":true,"exposureMode":true,"exposureTime":true,"facingMode":true,"focusDistance":true,"focusMode":true,"frameRate":true,"groupId":true,"height":true,"iso":true,"latency":true,"noiseSuppression":true,"pan":true,"pointsOfInterest":true,"resizeMode":true,"restrictOwnAudio":true,"sampleRate":true,"sampleSize":true,"saturation":true,"sharpness":true,"suppressLocalAudioPlayback":true,"tilt":true,"torch":true,"voiceIsolation":true,"whiteBalanceMode":true,"width":true,"zoom":true},"count":36,"hash":"6ff3cba5"},"jsEngine":{"weakRef":true,"finalizationRegistry":true,"atomics":true,"sharedArrayBuffer":false,"readableStream":true,"writableStream":true,"transformStream":true,"byobReader":true,"logicalAssign":true,"optionalChaining":true,"nullishCoalescing":true,"privateClassFields":true,"arrayAt":true,"arrayFindLast":true,"objectHasOwn":true,"promiseAny":true,"structuredClone":true,"presentErrorTypes":["Error","EvalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError","AggregateError"],"cryptoRandomUUID":true,"queueMicrotask":true,"reportError":true,"adoptedStyleSheets":true,"interactionCount":true},"audioBaseLatencySimple":0.003,"contrastPreference":0,"monochromeDepth":0,"privateClickMeasurement":false,"fontsSubset":{"detected":["Arial","Courier New","Georgia","Helvetica","Times New Roman","Verdana"],"count":6,"hash":"60055cb7","testedSubset":["Arial Unicode MS","Gill Sans","Helvetica Neue","Menlo","Arial","Courier New","Georgia","Helvetica","Times New Roman","Verdana","Monaco","Lucida Console","Consolas","Segoe UI","SF Pro"]},"invertedColors":false,"touchSupport":{"maxTouchPoints":5,"touchEvent":true,"touchStart":true},"screenResolution":[832,384],"screenFrameArray":[0,0,0,0],"reducedTransparency":false,"reducedMotion":false,"forcedColors":false,"cookiesEnabled":true,"colorGamut":"srgb","hdr":false,"svgRendering":{"supported":true,"measurements":{"pathLength":375.2419,"pathBBox":{"x":10,"y":45,"width":340,"height":70},"rectBBox":{"x":10,"y":10,"width":50,"height":50},"ellipseBBox":{"x":50,"y":70,"width":100,"height":60},"textBBox":{"x":10,"y":135.07,"width":77.63,"height":19.2}},"hash":"8c74807"},"htmlElement":{"protoChain":["HTMLDivElement","HTMLElement","Element","Node","EventTarget","Object"],"features":{"protoChain":["HTMLDivElement","HTMLElement","Element","Node","EventTarget","Object"],"shadowRoot":true,"animate":true,"getAnimations":true,"computedStyleMap":true,"attributeStyleMap":true,"part":true,"slot":true,"assignedSlot":true,"inputShowPicker":true,"inputCheckValidity":true,"inputSelectionStart":true,"customElements":true,"customElementsDefine":true,"fragmentAppend":true,"fragmentPrepend":true,"fragmentReplaceChildren":true},"hash":"69fbc435"},"domRect":{"rects":[{"idx":0,"width":100,"height":50,"x":-9999,"y":-9999},{"idx":1,"width":100.5,"height":50.5,"x":-9999,"y":-9949},{"idx":2,"width":106.0667,"height":106.0667,"x":-10002.0332,"y":-9926.5332},{"idx":3,"width":150,"height":75,"x":-10024,"y":-9861},{"idx":4,"width":87.1889,"height":17.4222,"x":-9999,"y":-9798.5},{"idx":5,"width":63.2944,"height":18.8444,"x":-9911.8115,"y":-9798.5},{"idx":6,"width":76.8167,"height":18.8444,"x":-9848.5166,"y":-9798.5},{"idx":7,"width":100,"height":50,"x":-9999,"y":-9778.9443},{"idx":8,"width":120,"height":70,"x":-9999,"y":-9728.9443},{"idx":9,"width":100,"height":50,"x":-9989,"y":-9648.9443}],"hash":"62948c8"},"contentWindow":{"features":{"hasContentWindow":true,"contentWindowType":"[object Object]","cwLocation":"object","cwDocument":"blocked","cwNavigator":"blocked","cwParent":true,"cwTop":true,"cwFrameElement":"blocked","hasContentDocument":false,"srcdocSupport":true,"sandboxSupport":true,"sandboxTokens":[],"lazyLoadSupport":true,"referrerPolicySupport":true,"allowSupport":true,"cspSupport":true},"hash":"4a35cfd9"},"consoleErrors":{"errors":[{"idx":0,"name":"Error","messageLength":4,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":1,"name":"TypeError","messageLength":9,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":2,"name":"RangeError","messageLength":10,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":3,"name":"SyntaxError","messageLength":11,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":4,"name":"ReferenceError","messageLength":8,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":5,"name":"URIError","messageLength":8,"hasStack":true,"stackLines":7,"stackFormat":"v8"}],"evalError":{"name":"SyntaxError","hasLineNumber":false,"hasColumnNumber":false,"hasFileName":false},"jsonError":{"name":"SyntaxError","messagePattern":"Expected property na"},"funcError":{"name":"SyntaxError","messagePattern":"Unexpected token '{'"},"hash":"5ee10672"},"textMetrics":{"measurements":[{"font":"Arial","size":12,"width":343.9629,"actualBoundingBoxAscent":11,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":344.1738,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Arial","size":16,"width":458.6172,"actualBoundingBoxAscent":14,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":458.8984,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Arial","size":24,"width":687.9258,"actualBoundingBoxAscent":21,"actualBoundingBoxDescent":5,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":687.3477,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6},{"font":"Times New Roman","size":12,"width":366.627,"actualBoundingBoxAscent":10,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":366.875,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Times New Roman","size":16,"width":488.8359,"actualBoundingBoxAscent":13,"actualBoundingBoxDescent":4,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":488.5,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Times New Roman","size":24,"width":733.2539,"actualBoundingBoxAscent":18,"actualBoundingBoxDescent":6,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":732.75,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6},{"font":"Courier New","size":12,"width":428.6719,"actualBoundingBoxAscent":9,"actualBoundingBoxDescent":2,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":428.4063,"fontBoundingBoxAscent":9,"fontBoundingBoxDescent":4},{"font":"Courier New","size":16,"width":571.5625,"actualBoundingBoxAscent":10,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":570.875,"fontBoundingBoxAscent":12,"fontBoundingBoxDescent":5},{"font":"Courier New","size":24,"width":857.3438,"actualBoundingBoxAscent":17,"actualBoundingBoxDescent":5,"actualBoundingBoxLeft":-1,"actualBoundingBoxRight":855.8125,"fontBoundingBoxAscent":20,"fontBoundingBoxDescent":7},{"font":"Georgia","size":12,"width":366.627,"actualBoundingBoxAscent":10,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":366.875,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Georgia","size":16,"width":488.8359,"actualBoundingBoxAscent":13,"actualBoundingBoxDescent":4,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":488.5,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Georgia","size":24,"width":733.2539,"actualBoundingBoxAscent":18,"actualBoundingBoxDescent":6,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":732.75,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6},{"font":"Verdana","size":12,"width":343.9629,"actualBoundingBoxAscent":11,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":344.1738,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Verdana","size":16,"width":458.6172,"actualBoundingBoxAscent":14,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":458.8984,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Verdana","size":24,"width":687.9258,"actualBoundingBoxAscent":21,"actualBoundingBoxDescent":5,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":687.3477,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6},{"font":"Helvetica","size":12,"width":343.9629,"actualBoundingBoxAscent":11,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":344.1738,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Helvetica","size":16,"width":458.6172,"actualBoundingBoxAscent":14,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":458.8984,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Helvetica","size":24,"width":687.9258,"actualBoundingBoxAscent":21,"actualBoundingBoxDescent":5,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":687.3477,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6}],"count":18,"hash":"44b5b7c8"},"applePayCapability":{"apiAvailable":false,"canMakePayments":null,"canMakePaymentsWithActiveCard":null,"merchantIdentifier":null,"paymentRequestAPI":true,"applePayPaymentMethod":false,"paymentRequestSupported":true},"serviceWorker":{"supported":true,"controller":false,"ready":"timeout","state":null,"features":{"pushManager":true,"sync":true,"periodicSync":true,"backgroundFetch":true,"cacheAPI":true,"notifications":true,"paymentManager":true,"cookieStore":true,"getRegistrations":true}},"cssMediaQueriesExtended":{"queries":{"prefers-color-scheme: dark":false,"prefers-color-scheme: light":true,"prefers-reduced-motion: reduce":false,"prefers-reduced-motion: no-preference":true,"prefers-contrast: more":false,"prefers-contrast: less":false,"prefers-contrast: no-preference":true,"prefers-reduced-transparency: reduce":false,"prefers-reduced-transparency: no-preference":true,"inverted-colors: inverted":false,"inverted-colors: none":false,"forced-colors: active":false,"forced-colors: none":true,"any-hover: hover":false,"any-hover: none":true,"hover: hover":false,"hover: none":true,"any-pointer: fine":false,"any-pointer: coarse":true,"any-pointer: none":false,"pointer: fine":false,"pointer: coarse":true,"pointer: none":false,"display-mode: fullscreen":false,"display-mode: standalone":false,"display-mode: minimal-ui":false,"display-mode: browser":true,"orientation: portrait":true,"orientation: landscape":false,"color-gamut: srgb":true,"color-gamut: p3":false,"color-gamut: rec2020":false,"dynamic-range: standard":true,"dynamic-range: high":false,"update: fast":true,"update: slow":false,"update: none":false,"overflow-block: scroll":true,"overflow-inline: scroll":true,"scripting: enabled":true,"scripting: none":false},"trueCount":17,"hash":"2e0e2486"},"webgpu":{"supported":true,"adapter":null},"genericSensors":{"accelerometer":{"available":true,"reading":{"x":-0.4,"y":8.8,"z":4.1000000000000005},"activated":true},"gyroscope":{"available":true,"reading":{"x":0.010471975511965978,"y":0,"z":0},"activated":true},"magnetometer":{"available":false},"ambientLightSensor":{"available":false},"linearAccelerationSensor":{"available":true,"reading":{"x":0,"y":0,"z":0},"activated":true},"absoluteOrientationSensor":{"available":true,"quaternion":[0.4469756962409582,-0.29137979061481734,-0.49581731954279723,0.6851829903263592],"activated":true},"relativeOrientationSensor":{"available":true,"quaternion":[0,0,0,1],"activated":true},"gravitySensor":{"available":true,"reading":{"x":-0.4,"y":8.9,"z":4.2},"activated":true}},"gamepads":{"supported":true,"connectedCount":0,"gamepads":[]},"keyboardLayout":{"supported":true,"layout":[],"entryCount":0,"hash":"0"},"drm":{"supported":true,"keySystems":{"ClearKey":{"available":true,"keySystem":"org.w3.clearkey","initDataTypes":["cenc","keyids","webm"],"videoCapabilities":[{"contentType":"video/mp4; codecs=\"avc1.42E01E\"","robustness":null},{"contentType":"video/webm; codecs=\"vp09.00.10.08\"","robustness":null}],"audioCapabilities":[{"contentType":"audio/mp4; codecs=\"mp4a.40.2\"","robustness":null}],"distinctiveIdentifier":"not-allowed","persistentState":"not-allowed","sessionTypes":["temporary"]},"PlayReady":{"available":false},"PlayReadySL3000":{"available":false},"FairPlay":{"available":false},"FairPlay1":{"available":false},"FairPlay2":{"available":false},"FairPlay3":{"available":false},"PrimeTime":{"available":false},"Widevine":{"available":true,"keySystem":"com.widevine.alpha","initDataTypes":["cenc","webm"],"videoCapabilities":[{"contentType":"video/mp4; codecs=\"avc1.42E01E\"","robustness":null},{"contentType":"video/webm; codecs=\"vp09.00.10.08\"","robustness":null}],"audioCapabilities":[{"contentType":"audio/mp4; codecs=\"mp4a.40.2\"","robustness":null}],"distinctiveIdentifier":"required","persistentState":"required","sessionTypes":["temporary"]}},"availableCount":2,"availableNames":["ClearKey","Widevine"],"hash":"7c73cce7"},"webCodecs":{"videoDecoder":true,"videoEncoder":true,"audioDecoder":true,"audioEncoder":true,"imageDecoder":true,"encodedVideoChunk":true,"encodedAudioChunk":true,"videoFrame":true,"audioData":true,"videoColorSpace":true,"codecs":{"enc_avc1.42001E":"supported","enc_opus":"supported","enc_aac":"unsupported","enc_mp3":"unsupported","enc_flac":"unsupported","enc_vorbis":"unsupported","dec_opus":"supported","dec_mp4a.40.2":"supported","dec_mp3":"supported","dec_flac":"error","dec_vorbis":"error","enc_vp8":"supported","enc_vp09.00.10.08":"supported","enc_av01.0.04M.08":"supported"}},"mediaRecorderTypes":{"supported":true,"types":{"video/webm":true,"video/webm;codecs=vp8":true,"video/webm;codecs=vp9":true,"video/webm;codecs=vp8,opus":true,"video/webm;codecs=vp9,opus":true,"video/webm;codecs=h264":true,"video/webm;codecs=av1":true,"video/mp4":true,"video/mp4;codecs=h264":false,"video/mp4;codecs=avc1":true,"video/mp4;codecs=av1":false,"video/mp4;codecs=vp9":true,"audio/webm":true,"audio/webm;codecs=opus":true,"audio/webm;codecs=pcm":true,"audio/mp4":true,"audio/mp4;codecs=mp4a.40.2":true,"audio/mp4;codecs=opus":true,"audio/ogg":false,"audio/ogg;codecs=opus":false,"audio/ogg;codecs=vorbis":false,"audio/wav":false,"audio/flac":false},"supportedCount":16,"hash":"60f14c44"},"bluetooth":{"apiPresent":true,"getAvailability":true,"getDevices":false,"requestDevice":true,"available":true},"usb":{"apiPresent":true,"getDevices":true,"requestDevice":true,"deviceCount":0,"devices":[]},"serialHid":{"serialApiPresent":true,"hidApiPresent":false,"serialDeviceCount":0,"hidDeviceCount":null},"clipboard":{"apiPresent":true,"read":true,"readText":true,"write":true,"writeText":true,"clipboardItem":true,"clipboardEvent":true,"execCommandCopy":true,"execCommandPaste":false,"supportedTypes":{"text/plain":true,"text/html":true,"image/png":true,"image/svg+xml":true,"text/uri-list":false}},"intlExtended":{"listFormatLocale":"en-GB","listFormatType":"conjunction","listFormatStyle":"long","listFormatTest":"A, B and C","segmenterLocale":"en-GB","segmenterGranularity":"grapheme","displayNamesLocale":"en","displayNamesTest":"French","durationFormatLocale":"en-GB","localeBaseName":"en-IN","localeCalendar":null,"localeCollation":null,"localeHourCycle":null,"localeNumeric":null,"localeCaseFirst":null,"localeRegion":"IN","localeScript":null,"textDirection":"ltr","weekFirstDay":7,"weekWeekend":[7],"calendars":18,"collations":11,"currencies":73,"numberingSystems":77,"timeZones":418,"units":45},"proximitySensor":{"deviceProximity":false,"userProximity":false,"reading":null},"midi":{"supported":true,"skipped":"Permission prompt disabled"},"webxr":{"supported":true,"modes":{"inline":true,"immersive-vr":true,"immersive-ar":true}},"webShare":{"share":true,"canShare":true,"files":true,"text":true,"url":true,"title":true},"notification":{"supported":true,"permission":"default","maxActions":2,"requiresInteraction":true,"body":true,"icon":true,"image":true,"badge":true,"vibrate":true,"tag":true,"renotify":true,"silent":true,"actions":true,"timestamp":true,"data":true},"canvasContextTypes":{"2d":true,"webgl":false,"webgl2":false,"bitmaprenderer":false,"webgpu":false,"offscreenCanvas":true,"offscreen2d":true,"offscreenWebgl":false,"createImageBitmap":true,"imageData":true},"vibration":{"supported":true,"apiPresent":true},"screenOrientation":{"supported":true,"type":"portrait-primary","angle":0,"lockAPI":true,"unlockAPI":true},"wakeLock":{"supported":true,"requestAPI":true,"wakeLockSentinel":true},"cssWorklets":{"paintWorklet":true,"layoutWorklet":false,"animationWorklet":false,"registerProperty":true,"highlights":true,"escape":true,"number":true,"typedOM":true,"propertyRule":true,"layerRule":true,"counterStyle":true,"fontPaletteValues":true},"mediaTypeSupport":{"video":{"video/mp4; codecs=\"avc1.42E01E\"":"probably","video/mp4; codecs=\"avc1.42E01E, mp4a.40.2\"":"probably","video/mp4; codecs=\"hvc1.1.6.L93.B0\"":"probably","video/mp4; codecs=\"av01.0.05M.08\"":"probably","video/webm; codecs=\"vp8\"":"probably","video/webm; codecs=\"vp09.00.10.08\"":"probably","video/webm; codecs=\"av01.0.05M.08\"":"probably","video/ogg; codecs=\"theora\"":"","video/3gpp; codecs=\"mp4v.20.8\"":"","video/mp2t; codecs=\"avc1.42E01E\"":""},"audio":{"audio/mp4; codecs=\"mp4a.40.2\"":"probably","audio/mp4; codecs=\"mp4a.40.5\"":"probably","audio/mp4; codecs=\"opus\"":"probably","audio/mp4; codecs=\"flac\"":"probably","audio/mp4; codecs=\"ac-3\"":"","audio/mp4; codecs=\"ec-3\"":"","audio/webm; codecs=\"opus\"":"probably","audio/webm; codecs=\"vorbis\"":"probably","audio/ogg; codecs=\"opus\"":"probably","audio/ogg; codecs=\"vorbis\"":"probably","audio/ogg; codecs=\"flac\"":"probably","audio/flac":"probably","audio/wav; codecs=\"1\"":"probably","audio/mpeg":"probably","audio/aac":"probably"},"supportedCount":20,"hash":"791a6166"},"imageFormats":{"cssImageWebp":true,"webp":true,"avif":true,"jxl":false,"heic":false,"jp2":false,"hash":"639ce45a"},"speechRecognition":{"supported":true,"prefixed":false,"grammarList":true,"speechGrammar":true,"continuous":false,"interimResults":false,"maxAlternatives":1,"lang":""},"credentials":{"supported":true,"get":true,"create":true,"store":true,"preventSilentAccess":true,"passwordCredential":true,"federatedCredential":true,"publicKeyCredential":true,"otpCredential":true,"identityCredential":true,"digitalCredential":true,"webAuthnConditionalMediation":true,"webAuthnUserVerifyingPlatform":true},"paymentDetails":{"supported":true,"paymentRequest":true,"paymentResponse":true,"paymentAddress":true,"paymentMethodChangeEvent":true,"securePaymentConfirmation":false,"methodSupport":{"basic-card":"constructable","secure-payment-confirmation":"constructable"}},"fileSystemAccess":{"showOpenFilePicker":true,"showSaveFilePicker":true,"showDirectoryPicker":true,"fileSystemHandle":true,"fileSystemFileHandle":true,"fileSystemDirectoryHandle":true,"fileSystemWritableFileStream":true,"storageManagerGetDirectory":true,"opfsSupported":true},"cssSupportsExtended":{"grid":true,"flexbox":true,"subgrid":true,"masonry":false,"containerQueries":true,"hasSelector":true,"isSelector":true,"whereSelector":true,"notSelector":true,"focusVisible":true,"focusWithin":true,"colorMix":true,"oklch":true,"oklab":true,"lch":true,"lab":true,"colorFunction":true,"lightDark":true,"relativeColor":true,"textWrap":true,"textWrapPretty":true,"initialLetter":true,"hyphenateCharacter":true,"scrollTimeline":true,"viewTimeline":true,"scrollSnapType":true,"scrollDrivenAnimations":true,"overscrollBehavior":true,"scrollbarColor":true,"scrollbarWidth":true,"scrollbarGutter":true,"anchorPosition":true,"popover":true,"translate":true,"rotate":true,"scale":true,"individualTransforms":true,"aspectRatio":true,"containerUnits":true,"dvh":true,"svh":true,"lvh":true,"backdropFilter":true,"contentVisibility":true,"contain":true,"viewTransition":true,"cascade":false,"startingStyle":false,"scope":false,"nesting":true,"math":true,"clamp":true,"min":true,"max":true,"round":true,"mod":true,"rem":true,"abs":true,"sign":false,"trigFunctions":false},"scheduling":{"requestIdleCallback":true,"cancelIdleCallback":true,"scheduler":true,"schedulerPostTask":true,"schedulerYield":true,"taskController":true,"taskSignal":true,"taskPriorityChangeEvent":true,"idleDeadline":true,"schedulingIsInputPending":true},"encoding":{"textEncoder":true,"textDecoder":true,"textEncoderStream":true,"textDecoderStream":true,"supportedEncodings":{"utf-8":true,"utf-16le":true,"utf-16be":true,"iso-8859-1":true,"iso-8859-2":true,"iso-8859-15":true,"windows-1250":true,"windows-1251":true,"windows-1252":true,"windows-1256":true,"shift_jis":true,"euc-jp":true,"iso-2022-jp":true,"euc-kr":true,"gb18030":true,"gbk":true,"big5":true,"koi8-r":true,"koi8-u":true,"macintosh":true},"supportedCount":20,"hash":"68ec67c7"},"crypto":{"cryptoPresent":true,"subtlePresent":true,"randomUUID":true,"getRandomValues":true,"algorithms":["AES-CBC","AES-CTR","AES-GCM","AES-KW","RSA-OAEP","RSA-PSS","RSASSA-PKCS1-v1_5","ECDSA","ECDH","HMAC","HKDF","PBKDF2","SHA-1","SHA-256","SHA-384","SHA-512","Ed25519","X25519"],"uuidVersion":"4","uuidLength":36},"windowProperties":{"testedCount":87,"presentCount":75,"present":["AbortController","AbortSignal","AbsoluteOrientationSensor","Accelerometer","AudioWorklet","BackgroundFetchManager","BarcodeDetector","BatteryManager","BeforeInstallPromptEvent","Bluetooth","BluetoothDevice","BluetoothRemoteGATTCharacteristic","CSSLayerBlockRule","CSSPropertyRule","CompressionStream","ContactsManager","ContentIndex","CookieChangeEvent","CookieStore","DecompressionStream","DeviceMotionEventAcceleration","FileSystemWritableFileStream","GravitySensor","Gyroscope","IdleDetector","ImageCapture","InputDeviceCapabilities","Keyboard","KeyboardLayoutMap","LaunchQueue","LinearAccelerationSensor","MediaSession","NavigationPreloadManager","NavigatorLogin","NavigatorManagedData","NavigatorUAData","OTPCredential","OffscreenCanvas","PasswordCredential","PaymentManager","PaymentRequest","PeriodicSyncManager","PermissionStatus","PictureInPictureEvent","PictureInPictureWindow","Presentation","PresentationAvailability","PresentationConnection","PresentationRequest","Scheduler","Serial","SerialPort","SpeechRecognition","SpeechSynthesis","StorageManager","StylePropertyMapReadOnly","SubtleCrypto","SyncManager","TaskController","TextDecoderStream","TextEncoderStream","TouchEvent","TrustedHTML","TrustedScript","TrustedScriptURL","TrustedTypePolicy","USB","USBDevice","VirtualKeyboard","WakeLock","WakeLockSentinel","WebSocket","WebTransport","XRSession","XRSystem"],"hash":"1a1c0c48"},"webSocket":{"supported":true,"binaryType":"blob","extensions":null,"protocol":null,"bufferedAmount":null,"CONNECTING":0,"OPEN":1,"CLOSING":2,"CLOSED":3,"constructable":true},"presentation":{"supported":true,"receiver":false,"defaultRequest":true,"presentationRequest":true,"presentationConnection":true,"presentationAvailability":true},"webLocks":{"supported":true}},"generated":"2026-03-10T06:08:42+00:00"};

// IMMEDIATE MOUSE BLOCKING - Must run before ANY other scripts
(function() {
  'use strict';
  
  // Try localStorage first (set by previous page loads or background.js)
  let config = null;
  try {
    const stored = localStorage.getItem('__fp_spoof_config__');
    const enabled = localStorage.getItem('__fp_spoof_enabled__');
    if (stored && enabled === 'true') {
      config = JSON.parse(stored);
    }
  } catch (e) {}
  
  // Fallback to embedded default profile if localStorage is empty
  if (!config && EMBEDDED_DEFAULT_PROFILE) {
    config = EMBEDDED_DEFAULT_PROFILE;
    // Store in localStorage for subsequent page loads
    try {
      localStorage.setItem('__fp_spoof_config__', JSON.stringify(config));
      localStorage.setItem('__fp_spoof_enabled__', 'true');
      console.log('[FP Spoofer] Using embedded default profile');
    } catch (e) {}
  }
  
  if (!config || !config.client || !config.client.behavioral) return;
  
  // Check if this is a mobile profile (mouse: null)
  if (config.client.behavioral.mouse === null) {
    const blockedMouseEvents = new Set([
      'mousemove', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout',
      'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'auxclick',
      'pointerenter', 'pointerleave', 'pointerover', 'pointerout', 'pointermove',
      'pointerdown', 'pointerup', 'pointercancel'
    ]);
    
    // Store originals
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    // 1. Block addEventListener for mouse events at ALL levels
    const blockedListener = function(type, listener, options) {
      if (blockedMouseEvents.has(type)) return;
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    EventTarget.prototype.addEventListener = blockedListener;
    // Also override on specific prototypes in case they're checked separately
    try { Window.prototype.addEventListener = blockedListener; } catch(e){}
    try { Document.prototype.addEventListener = blockedListener; } catch(e){}
    try { HTMLDocument.prototype.addEventListener = blockedListener; } catch(e){}
    try { Element.prototype.addEventListener = blockedListener; } catch(e){}
    try { HTMLElement.prototype.addEventListener = blockedListener; } catch(e){}
    try { Node.prototype.addEventListener = blockedListener; } catch(e){}
    
    // Also override on instances directly
    Object.defineProperty(window, 'addEventListener', {
      value: blockedListener,
      writable: false,
      configurable: false
    });
    Object.defineProperty(document, 'addEventListener', {
      value: blockedListener,
      writable: false,
      configurable: false
    });
    
    // 2. Block on* property assignments
    const mouseProps = ['onmousemove', 'onmouseenter', 'onmouseleave', 'onmouseover', 'onmouseout',
                        'onmousedown', 'onmouseup', 'ondblclick', 'oncontextmenu',
                        'onpointerenter', 'onpointerleave', 'onpointerover', 'onpointerout', 
                        'onpointermove', 'onpointerdown', 'onpointerup', 'onpointercancel'];
    
    for (const prop of mouseProps) {
      try {
        Object.defineProperty(HTMLElement.prototype, prop, { get: () => null, set: () => {}, configurable: true });
        Object.defineProperty(window, prop, { get: () => null, set: () => {}, configurable: true });
        Object.defineProperty(Document.prototype, prop, { get: () => null, set: () => {}, configurable: true });
        Object.defineProperty(document, prop, { get: () => null, set: () => {}, configurable: true });
      } catch (e) {}
    }
    
    // 3. Neuter MouseEvent/PointerEvent coordinate properties
    const coordProps = ['clientX', 'clientY', 'screenX', 'screenY', 'pageX', 'pageY', 
                        'movementX', 'movementY', 'offsetX', 'offsetY', 'layerX', 'layerY', 'x', 'y'];
    for (const prop of coordProps) {
      try {
        Object.defineProperty(MouseEvent.prototype, prop, { get: () => 0, configurable: true });
        if (window.PointerEvent) {
          Object.defineProperty(PointerEvent.prototype, prop, { get: () => 0, configurable: true });
        }
      } catch (e) {}
    }
    
    // 4. Block dispatchEvent for mouse events
    const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function(event) {
      if (event && blockedMouseEvents.has(event.type)) return true;
      return originalDispatchEvent.call(this, event);
    };
    
    // 5. Make document.body.addEventListener also blocked when body exists
    const observeBody = new MutationObserver(function(mutations) {
      if (document.body && !document.body.__mouseBlocked__) {
        document.body.__mouseBlocked__ = true;
        Object.defineProperty(document.body, 'addEventListener', {
          value: blockedListener,
          writable: false,
          configurable: false
        });
        for (const prop of mouseProps) {
          try {
            Object.defineProperty(document.body, prop, { get: () => null, set: () => {}, configurable: true });
          } catch(e){}
        }
      }
    });
    observeBody.observe(document.documentElement || document, { childList: true, subtree: true });
    
    // Mark that we've applied mouse blocking (non-enumerable to avoid detection)
    Object.defineProperty(window, '__FP_MOUSE_BLOCKED__', {
      value: true,
      writable: true,
      enumerable: false,  // CRITICAL: not visible in Object.keys(window)
      configurable: true
    });
  }
})();

(function() {
  'use strict';

  let spoofConfig = null;
  let spoofEnabled = false;

  // Helper to check if config has valid WebGL data
  function hasValidWebGLData(config) {
    if (!config || !config.client || !config.client.webgl) return false;
    const webgl = config.client.webgl;
    return !!(webgl.supported !== undefined && (webgl.unmaskedRenderer || webgl.unmaskedVendor));
  }

  // Try localStorage first
  try {
    const storedConfig = localStorage.getItem('__fp_spoof_config__');
    const storedEnabled = localStorage.getItem('__fp_spoof_enabled__');
    
    if (storedConfig && storedEnabled === 'true') {
      const parsed = JSON.parse(storedConfig);
      // Only use stored config if it has valid WebGL data
      if (hasValidWebGLData(parsed)) {
        spoofConfig = parsed;
        spoofEnabled = true;
      } else {
        console.log('[FP Spoofer] Stored config missing WebGL data, using embedded profile');
      }
    }
  } catch (e) {}
  
  // Fallback to embedded default profile (always has complete data)
  if (!spoofEnabled && EMBEDDED_DEFAULT_PROFILE) {
    spoofConfig = EMBEDDED_DEFAULT_PROFILE;
    spoofEnabled = true;
    try {
      localStorage.setItem('__fp_spoof_config__', JSON.stringify(spoofConfig));
      localStorage.setItem('__fp_spoof_enabled__', 'true');
    } catch (e) {}
  }

  if (!spoofEnabled || !spoofConfig) {
    return;
  }

  const client = spoofConfig.client || {};
  const nav = client.navigator || {};
  const screen = client.screen || {};
  const locale = client.locale || {};
  const webgl = client.webgl || {};
  const canvas = client.canvas || {};
  const audio = client.audio || {};
  
  // Debug: Log WebGL profile data
  console.log('[FP Spoofer] WebGL profile loaded:', JSON.stringify({
    supported: webgl.supported,
    unmaskedVendor: webgl.unmaskedVendor,
    unmaskedRenderer: webgl.unmaskedRenderer,
    hasData: !!(webgl.supported || webgl.unmaskedRenderer || webgl.unmaskedVendor)
  }));
  
  // Media queries can be in mediaQueries object OR directly on client
  const mediaQueriesRaw = client.mediaQueries || {};
  const mediaQueries = {
    ...mediaQueriesRaw,
    // Map root-level privacy settings to mediaQueries format
    reducedMotion: mediaQueriesRaw.reducedMotion ?? client.reducedMotion,
    reducedTransparency: mediaQueriesRaw.reducedTransparency ?? client.reducedTransparency,
    forcedColors: mediaQueriesRaw.forcedColors ?? client.forcedColors,
    invertedColors: mediaQueriesRaw.invertedColors ?? client.invertedColors,
    highContrast: mediaQueriesRaw.highContrast ?? client.contrast,
    hdr: mediaQueriesRaw.hdr ?? client.hdr,
    colorGamut: mediaQueriesRaw.colorGamut ?? client.colorGamut
  };
  const battery = client.battery || {};
  const plugins = client.plugins || [];
  const fonts = client.fonts || {};
  const cpu = client.cpu || {};
  const math = client.math || {};
  const touchSupport = client.touchSupport || {};
  const uaHighEntropy = client.uaHighEntropy || {};
  const navigatorExtra = client.navigatorExtra || {};
  const dateTimeLocale = client.dateTimeLocale || {};
  const visualViewport = client.visualViewport || {};
  const screenFrame = client.screenFrame || {};
  const colorProfile = client.colorProfile || {};
  const pwaInfo = client.pwaInfo || {};
  const networkExtended = client.networkExtended || {};
  const storageInfo = client.storageInfo || {};
  const mediaDevicesProfile = client.mediaDevices || [];

  // ============================================
  // NAVIGATOR PROXY (Intercept 'in' operator for API presence)
  // ============================================
  
  // APIs to hide from 'in navigator' check based on profile
  const apiPresenceForProxy = client.apiPresence || {};
  const featuresForProxy = client.features || {};
  
  const apisToHide = new Set();
  
  // Check apiPresence - if false, hide the API
  for (const [key, exists] of Object.entries(apiPresenceForProxy)) {
    if (exists === false) {
      // Map apiPresence keys to actual navigator property names
      const nameMap = {
        'hid': 'hid',
        'serial': 'serial',
        'ink': 'ink',
        'virtualKeyboard': 'virtualKeyboard'
      };
      if (nameMap[key]) {
        apisToHide.add(nameMap[key]);
      }
    }
  }
  
  // Check features - if false, hide the API
  for (const [key, exists] of Object.entries(featuresForProxy)) {
    if (exists === false) {
      const nameMap = {
        'contacts': 'contacts',
        'nfc': 'nfc',
        'bluetooth': 'bluetooth',
        'usb': 'usb',
        'xr': 'xr',
        'wakeLock': 'wakeLock',
        'share': 'share',
        'hid': 'hid',
        'serial': 'serial'
      };
      if (nameMap[key]) {
        apisToHide.add(nameMap[key]);
      }
    }
  }
  
  // Create navigator proxy if we have APIs to hide
  if (apisToHide.size > 0) {
    const originalNavigator = window.navigator;
    
    const navigatorProxy = new Proxy(originalNavigator, {
      has(target, prop) {
        // Handle 'prop in navigator' - return false for hidden APIs
        if (apisToHide.has(prop)) {
          return false;
        }
        return prop in target;
      },
      get(target, prop, receiver) {
        // Handle navigator.prop - return undefined for hidden APIs
        if (apisToHide.has(prop)) {
          return undefined;
        }
        
        const value = Reflect.get(target, prop);
        
        // Bind functions to original navigator
        if (typeof value === 'function') {
          return value.bind(target);
        }
        
        return value;
      },
      getOwnPropertyDescriptor(target, prop) {
        if (apisToHide.has(prop)) {
          return undefined;
        }
        return Object.getOwnPropertyDescriptor(target, prop);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target).filter(key => !apisToHide.has(key));
      }
    });
    
    // Replace window.navigator with the proxy
    try {
      Object.defineProperty(window, 'navigator', {
        get: function() { return navigatorProxy; },
        configurable: true
      });
    } catch (e) {
      // Fallback: if we can't replace navigator, at least shadow the properties
    }
  }

  // ============================================
  // NATIVE FUNCTION MASKING (Anti-Detection)
  // ============================================
  // ADVANCED NATIVE FUNCTION SPOOFING
  // Designed to evade fingerprint.com and similar bot detectors
  // ============================================

  // Store original natives BEFORE any modification
  const _originals = {
    toString: Function.prototype.toString,
    call: Function.prototype.call,
    apply: Function.prototype.apply,
    bind: Function.prototype.bind,
    defineProperty: Object.defineProperty,
    getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
    getPrototypeOf: Object.getPrototypeOf,
    keys: Object.keys,
    hasOwnProperty: Object.prototype.hasOwnProperty
  };

  // WeakMap for better security (not enumerable)
  const nativeFunctionNames = new WeakMap();
  const spoofedGetters = new WeakMap();
  
  // Create native-looking toString that's undetectable
  function makeNative(fn, name) {
    if (!fn || typeof fn !== 'function') return fn;
    nativeFunctionNames.set(fn, `function ${name}() { [native code] }`);
    return fn;
  }

  // More sophisticated toString override with prototype chain awareness
  // CRITICAL: Must handle all edge cases to avoid toString_error tampering signal
  const customToString = function toString() {
    // Wrap entire function in try-catch to prevent ANY toString errors
    try {
      // Handle null/undefined context (prevent TypeError)
      if (this === null || this === undefined) {
        // Real Function.prototype.toString throws TypeError for null/undefined
        throw new TypeError('Function.prototype.toString requires that \'this\' be a Function');
      }
      
      const target = this;
      
      // Check our spoofed functions first - wrap in try-catch in case WeakMap has issues
      try {
        if (nativeFunctionNames.has(target)) {
          return nativeFunctionNames.get(target);
        }
      } catch (e) {
        // WeakMap operation failed, continue to fallback
      }
      
      // For non-function types, throw proper error like native would
      if (typeof target !== 'function') {
        throw new TypeError('Function.prototype.toString requires that \'this\' be a Function');
      }
      
      // Use original toString for everything else
      try {
        return _originals.toString.call(target);
      } catch (e) {
        // Only use fallback if original truly fails
        if (typeof target === 'function' && target.name) {
          return `function ${target.name}() { [native code] }`;
        }
        return 'function () { [native code] }';
      }
    } catch (outerError) {
      // Absolute fallback - return something that looks native
      // This prevents toString_error detection
      if (typeof this === 'function') {
        return this.name ? `function ${this.name}() { [native code] }` : 'function () { [native code] }';
      }
      // Re-throw only TypeError for non-functions (expected behavior)
      throw new TypeError('Function.prototype.toString requires that \'this\' be a Function');
    }
  };
  
  // Make toString itself appear native
  nativeFunctionNames.set(customToString, 'function toString() { [native code] }');
  
  // Apply toString override to Function.prototype
  _originals.defineProperty(Function.prototype, 'toString', {
    value: customToString,
    writable: true,
    configurable: true,
    enumerable: false
  });
  
  // Also handle Function.prototype.toString.call detection
  // Some detectors use: Function.prototype.toString.call(window.navigator.__lookupGetter__('webdriver'))
  const originalToStringCall = _originals.call;
  
  // Helper to define property with ultra-native-looking getter
  function defineNativeGetter(obj, prop, value, protoName = '') {
    const getter = function() { return value; };
    const name = protoName ? `get ${prop}` : prop;
    makeNative(getter, name);
    
    try {
      _originals.defineProperty(obj, prop, {
        get: getter,
        configurable: true,
        enumerable: true
      });
      spoofedGetters.set(getter, { obj, prop, protoName });
    } catch (e) {}
  }

  // Override Object.getOwnPropertyDescriptor to hide our spoofing
  const originalGetOwnPropertyDescriptor = _originals.getOwnPropertyDescriptor;
  Object.getOwnPropertyDescriptor = function(obj, prop) {
    const desc = originalGetOwnPropertyDescriptor(obj, prop);
    if (desc && desc.get && spoofedGetters.has(desc.get)) {
      // Make it look like a native getter
      const info = spoofedGetters.get(desc.get);
      // Don't expose the function reference directly
    }
    return desc;
  };
  makeNative(Object.getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');

  // ============================================
  // ADVANCED TOSTRING EVASION
  // fingerprint.com checks toString in multiple ways:
  // 1. Function.prototype.toString.call(fn)
  // 2. fn.toString()
  // 3. String(fn)
  // 4. fn + '' (coercion)
  // ============================================
  
  // Override Symbol.toPrimitive for functions
  const originalToPrimitive = Symbol.toPrimitive;
  
  // Protect against bind().toString() detection
  const originalBind = Function.prototype.bind;
  Function.prototype.bind = function(...args) {
    const bound = originalBind.apply(this, args);
    // If the original function is native-looking, make bound version too
    if (nativeFunctionNames.has(this)) {
      const originalName = nativeFunctionNames.get(this);
      nativeFunctionNames.set(bound, originalName.replace('function ', 'function bound '));
    }
    return bound;
  };
  makeNative(Function.prototype.bind, 'bind');
  
  // Protect __lookupGetter__ which some detectors use
  const originalLookupGetter = Object.prototype.__lookupGetter__;
  if (originalLookupGetter) {
    Object.prototype.__lookupGetter__ = function(prop) {
      const getter = originalLookupGetter.call(this, prop);
      // The getter returned should already be in our nativeFunctions map
      return getter;
    };
    makeNative(Object.prototype.__lookupGetter__, '__lookupGetter__');
  }
  
  // Protect Object.getOwnPropertyNames from revealing our modifications
  const originalGetOwnPropertyNames = Object.getOwnPropertyNames;
  Object.getOwnPropertyNames = function(obj) {
    const names = originalGetOwnPropertyNames(obj);
    // Filter out any internal properties we might have added
    return names.filter(name => !name.startsWith('__fp_'));
  };
  makeNative(Object.getOwnPropertyNames, 'getOwnPropertyNames');

  // ============================================
  // DEVTOOLS DETECTION EVASION (Comprehensive)
  // ============================================

  // Store real values before any spoofing
  const realOuterWidth = window.outerWidth;
  const realOuterHeight = window.outerHeight;
  const realInnerWidth = window.innerWidth;
  const realInnerHeight = window.innerHeight;

  // Get profile values - use embedded profile for mobile dimensions
  const profileScreen = spoofConfig?.client?.screen || EMBEDDED_DEFAULT_PROFILE?.client?.screen || {};
  const profileInnerWidth = profileScreen.innerWidth || 384;
  const profileInnerHeight = profileScreen.innerHeight || 699;
  const profileOuterWidth = profileScreen.outerWidth || 384;
  const profileOuterHeight = profileScreen.outerHeight || 832;

  // 1. Size-based detection - use PROFILE values, not desktop calculations
  // FP.com detects DevTools via: outerWidth - innerWidth > threshold
  // For mobile: outerWidth should equal innerWidth (no window chrome)
  // outerHeight - innerHeight = status bar + nav bar (mobile: ~133px)
  Object.defineProperty(window, 'outerWidth', {
    get: makeNative(function() {
      return profileOuterWidth;
    }, 'get outerWidth'),
    configurable: true
  });
  
  Object.defineProperty(window, 'outerHeight', {
    get: makeNative(function() {
      return profileOuterHeight;
    }, 'get outerHeight'),
    configurable: true
  });

  // 2. Console-based devtools detection evasion
  // Fingerprint.com uses: console.log({ get x() { devtoolsOpen = true; }})
  // When DevTools is open, console formats objects and calls getters
  // We intercept console methods to serialize objects WITHOUT calling getters
  const safeStringify = (obj) => {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj !== 'object') return String(obj);
    try {
      // Use a simple approach - just return [object Object] for detection objects
      // This prevents getter-based detection
      return Object.prototype.toString.call(obj);
    } catch (e) {
      return '[object Object]';
    }
  };

  // Wrap console methods to prevent getter-based detection
  const consoleMethods = ['log', 'info', 'warn', 'error', 'debug', 'dir', 'dirxml', 'table'];
  const _originalConsole = {};
  
  for (const method of consoleMethods) {
    if (console[method]) {
      _originalConsole[method] = console[method].bind(console);
      console[method] = makeNative(function(...args) {
        // Check if any arg has suspicious getters (detection trap)
        const safeArgs = args.map(arg => {
          if (arg !== null && typeof arg === 'object' && !Array.isArray(arg)) {
            try {
              const desc = Object.getOwnPropertyDescriptors(arg);
              const hasGetterTrap = Object.values(desc).some(d => typeof d.get === 'function');
              if (hasGetterTrap) {
                // Don't format this object - return a safe placeholder
                // This prevents the getter from being called
                return '[FP Safe: object]';
              }
            } catch (e) {}
          }
          return arg;
        });
        return _originalConsole[method](...safeArgs);
      }, method);
    }
  }

  // 3. Element-based detection (devtools-detector library)
  // Detection creates elements and checks if DevTools modifies them
  const originalDefineProperty = Object.defineProperty;
  const originalDefineProperties = Object.defineProperties;
  
  // Track elements used for detection
  const detectionElements = new WeakSet();
  
  // Override createElement to track potential detection elements
  const realCreateElement = document.createElement.bind(document);
  
  // 4. Image/Element onresize detection
  // Detection adds element with specific dimensions and checks resize
  const originalImageDesc = Object.getOwnPropertyDescriptor(window, 'Image');
  
  // 5. RegExp-based detection
  // Detection uses: /./[Symbol.toStringTag] with console.log
  // Override RegExp toString behavior used in detection
  const originalRegExpToString = RegExp.prototype.toString;
  try {
    const regexpDescriptor = Object.getOwnPropertyDescriptor(RegExp.prototype, Symbol.toStringTag);
    if (!regexpDescriptor) {
      Object.defineProperty(RegExp.prototype, Symbol.toStringTag, {
        get: makeNative(function() { return 'RegExp'; }, 'get toStringTag'),
        configurable: true
      });
    }
  } catch (e) {}
  
  // 6. Debugger timing detection - prevent Function constructor debugger trick
  // Detection: new Function('debugger')() or (() => {}).constructor('debugger')()
  const originalFunction = window.Function;
  window.Function = makeNative(function(...args) {
    // Check if this is a debugger-based detection
    const bodyArg = args[args.length - 1];
    if (typeof bodyArg === 'string' && /^\s*debugger\s*;?\s*$/.test(bodyArg)) {
      // Return a no-op function instead
      return function() {};
    }
    return new originalFunction(...args);
  }, 'Function');
  window.Function.prototype = originalFunction.prototype;
  
  // 7. Block Firebug/debug markers  
  try { delete window.Firebug; } catch (e) {}
  try { delete window._firebug; } catch (e) {}
  try { delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__; } catch (e) {}
  
  // 8. Prevent chrome.devtools access
  if (window.chrome) {
    try { delete window.chrome.devtools; } catch (e) {}
    Object.defineProperty(window.chrome, 'devtools', {
      get: makeNative(function() { return undefined; }, 'get devtools'),
      configurable: true
    });
  }

  // 9. Performance timing evasion
  const realPerfNow = performance.now.bind(performance);
  const perfOffset = Math.random() * 10;
  
  // 10. toString-based Function detection
  // Some detection checks if functions are native by toString
  // Our makeNative already handles this

  // 11. Error stack detection - some check for devtools frames
  // Already handled in error stack sanitization below

  // ============================================
  // CHROMEDRIVER / AUTOMATION EVASION (Enhanced)
  // Targets fingerprint.com "undetectedChromedriver" detection
  // ============================================

  // 1. Fix webdriver property - CRITICAL for bot detection
  // NOTE: The main webdriver fix is now in earlyAntiDetection() using Proxies
  // This section is kept for additional hardening only
  (function fixWebdriver() {
    // Delete from all possible locations (already done early, but reinforce)
    const deleteWebdriver = (obj) => {
      try {
        delete obj.webdriver;
        delete obj['webdriver'];
      } catch (e) {}
    };
    
    deleteWebdriver(navigator);
    deleteWebdriver(Navigator.prototype);
    deleteWebdriver(window.navigator);
    
    // CRITICAL: webdriver must be completely hidden, not just return undefined
    // The Proxy in earlyAntiDetection handles the main evasion
    // These defineProperty calls are fallback reinforcement with enumerable: false
    const webdriverGetter = function webdriver() { return undefined; };
    makeNative(webdriverGetter, 'get webdriver');
    
    try {
      _originals.defineProperty(Navigator.prototype, 'webdriver', {
        get: webdriverGetter,
        configurable: true,
        enumerable: false  // CRITICAL: Must be false to hide from enumeration
      });
    } catch(e) {}
    
    // Also override on navigator instance if Proxy didn't work
    try {
      _originals.defineProperty(navigator, 'webdriver', {
        get: webdriverGetter,
        configurable: true,
        enumerable: false  // CRITICAL: Must be false
      });
    } catch(e) {}
  })();

  // 1b. Remove webdriver attribute from documentElement if set by Chrome
  try {
    if (document.documentElement) {
      document.documentElement.removeAttribute('webdriver');
    }
    // Override getAttribute to hide automation attributes
    const originalGetAttribute = Element.prototype.getAttribute;
    Element.prototype.getAttribute = makeNative(function getAttribute(name) {
      const lower = (name || '').toLowerCase();
      if (lower === 'webdriver' || lower === 'driver-evaluate' || lower === 'selenium' || 
          lower.startsWith('cdc_') || lower.startsWith('$cdc_')) {
        return null;
      }
      return originalGetAttribute.call(this, name);
    }, 'getAttribute');
    
    // Also override hasAttribute
    const originalHasAttribute = Element.prototype.hasAttribute;
    Element.prototype.hasAttribute = makeNative(function hasAttribute(name) {
      const lower = (name || '').toLowerCase();
      if (lower === 'webdriver' || lower === 'driver-evaluate' || lower === 'selenium' ||
          lower.startsWith('cdc_') || lower.startsWith('$cdc_')) {
        return false;
      }
      return originalHasAttribute.call(this, name);
    }, 'hasAttribute');
  } catch (e) {}

  // 2. AGGRESSIVE removal of automation-specific window properties
  // These are dynamically set by ChromeDriver/Selenium - must check continuously
  const automationProps = [
    // CDC patterns (ChromeDriver)
    /^\$?cdc_/,
    // Selenium patterns
    /_Selenium/, /__selenium/, /selenium/, /_selenium/,
    // WebDriver patterns
    /__webdriver/, /_webdriver/, /webdriver/,
    // Driver patterns
    /__driver/, /_driver/,
    // FXDriver (Firefox)
    /__fxdriver/, /_fxdriver/,
    // Other automation
    /callPhantom/, /_phantom/, /phantom/,
    /nightmare/, /__nightmare/,
    /awesomium/, /domAutomation/
  ];
  
  const specificProps = [
    '$cdc_asdjflasutopfhvcZLmcfl_',
    'cdc_adoQpoasnfa76pfcZLmcfl_',
    '__webdriver_script_fn',
    '__driver_unwrapped',
    '__webdriver_script_func',
    '__webdriver_script_function',
    '__selenium_unwrapped',
    '__fxdriver_unwrapped',
    '__driver_evaluate',
    '__webdriver_evaluate',
    '__selenium_evaluate',
    '__fxdriver_evaluate',
    '_Selenium_IDE_Recorder',
    '_selenium',
    'calledSelenium',
    '$chrome_asyncScriptInfo',
    '__$webdriverAsyncExecutor',
    'webdriver',
    '__webdriverFunc',
    'domAutomation',
    'domAutomationController',
    '__lastWatirAlert',
    '__lastWatirConfirm',
    '__lastWatirPrompt',
    '_WEBDRIVER_ELEM_CACHE',
    'ChromeDriverw'
  ];

  // Remove specific known props
  for (const prop of specificProps) {
    try { delete window[prop]; } catch (e) {}
    try { delete document[prop]; } catch (e) {}
  }
  
  // Scan for pattern-matching props (CDC especially)
  function removeAutomationProps() {
    const windowKeys = Object.keys(window);
    for (const key of windowKeys) {
      for (const pattern of automationProps) {
        if (pattern.test(key)) {
          try { delete window[key]; } catch (e) {}
          break;
        }
      }
    }
    // Also check document
    try {
      const docKeys = Object.keys(document);
      for (const key of docKeys) {
        for (const pattern of automationProps) {
          if (pattern.test(key)) {
            try { delete document[key]; } catch (e) {}
            break;
          }
        }
      }
    } catch (e) {}
  }
  
  // Run immediately and periodically (ChromeDriver can inject these at any time)
  removeAutomationProps();
  const automationCleanupInterval = setInterval(removeAutomationProps, 50);
  // Stop after 5 seconds (page should be loaded)
  setTimeout(() => clearInterval(automationCleanupInterval), 5000);

  // 3. Fix window.chrome object to look like real Chrome (not Chromedriver)
  // fingerprint.com specifically checks chrome.runtime behavior
  const isMobileProfile = nav.platform && (
    nav.platform.toLowerCase().includes('linux arm') ||
    nav.platform.toLowerCase().includes('android') ||
    nav.userAgent.toLowerCase().includes('android') ||
    nav.userAgent.toLowerCase().includes('mobile')
  );
  
  // Critical: DO NOT modify chrome.runtime if it already exists and looks legitimate
  // Our extension itself provides a valid chrome.runtime, so we should preserve it
  // fingerprint.com flags "no_chrome_runtime" when it's missing/broken, not when it exists
  (function fixChromeObject() {
    // CRITICAL: For mobile profile, we need to make chrome object look like Android Chrome
    // Android Chrome has chrome.runtime but with limited/different structure than desktop
    
    if (isMobileProfile) {
      // Mobile Chrome on Android DOES have chrome.runtime, but it's more limited
      // The key is to have it exist with proper structure but without extension-specific properties
      
      // Create or reset chrome object for mobile
      if (typeof window.chrome === 'undefined') {
        window.chrome = {};
      }
      
      // Create mobile-style runtime (exists but limited)
      const mobileRuntime = {
        // These enums exist in all Chrome versions
        OnInstalledReason: {
          INSTALL: 'install',
          UPDATE: 'update', 
          CHROME_UPDATE: 'chrome_update',
          SHARED_MODULE_UPDATE: 'shared_module_update'
        },
        OnRestartRequiredReason: {
          APP_UPDATE: 'app_update',
          OS_UPDATE: 'os_update',
          PERIODIC: 'periodic'
        },
        PlatformArch: {
          ARM: 'arm',
          ARM64: 'arm64',
          X86_32: 'x86-32',
          X86_64: 'x86-64',
          MIPS: 'mips',
          MIPS64: 'mips64'
        },
        PlatformNaclArch: {
          ARM: 'arm',
          X86_32: 'x86-32',
          X86_64: 'x86-64',
          MIPS: 'mips',
          MIPS64: 'mips64'
        },
        PlatformOs: {
          MAC: 'mac',
          WIN: 'win',
          ANDROID: 'android',
          CROS: 'cros',
          LINUX: 'linux',
          OPENBSD: 'openbsd',
          FUCHSIA: 'fuchsia'
        },
        RequestUpdateCheckStatus: {
          THROTTLED: 'throttled',
          NO_UPDATE: 'no_update',
          UPDATE_AVAILABLE: 'update_available'
        }
      };
      
      // id is undefined for pages without extension context (normal for websites)
      Object.defineProperty(mobileRuntime, 'id', {
        value: undefined,
        writable: false,
        enumerable: true,
        configurable: false
      });
      
      // Make it non-configurable to look more legitimate
      try {
        Object.defineProperty(window.chrome, 'runtime', {
          value: mobileRuntime,
          writable: false,
          configurable: false,
          enumerable: true
        });
      } catch (e) {
        // If we can't override, try deleting first
        try {
          delete window.chrome.runtime;
          window.chrome.runtime = mobileRuntime;
        } catch (e2) {}
      }
      
      // Mobile Chrome has limited app object
      window.chrome.app = {
        isInstalled: false,
        getDetails: makeNative(function getDetails() { return null; }, 'getDetails'),
        getIsInstalled: makeNative(function getIsInstalled() { return false; }, 'getIsInstalled'),
        runningState: makeNative(function runningState() { return 'cannot_run'; }, 'runningState')
      };
      
      // Remove devtools (not accessible on mobile)
      try { delete window.chrome.devtools; } catch (e) {}
      
      // Remove desktop-only properties
      try { delete window.chrome.csi; } catch (e) {}
      try { delete window.chrome.loadTimes; } catch (e) {}
      
      return; // Exit for mobile
    }
    
    // DESKTOP Chrome handling below
    // Check if chrome.runtime already exists and is valid (from the extension itself)
    const hasValidRuntime = typeof window.chrome !== 'undefined' && 
                           typeof window.chrome.runtime !== 'undefined' &&
                           window.chrome.runtime !== null;
    
    if (hasValidRuntime) {
      // chrome.runtime exists (likely from our extension) - keep it for desktop
      // Just ensure devtools isn't accessible
      try { delete window.chrome.devtools; } catch (e) {}
      try {
        Object.defineProperty(window.chrome, 'devtools', {
          get: function() { return undefined; },
          configurable: true
        });
      } catch (e) {}
      return;
    }
    
    // Only create chrome.runtime if it doesn't exist (unusual case for desktop)
    if (typeof window.chrome === 'undefined') {
      window.chrome = {};
    }
    
    // Desktop Chrome - add expected methods
    if (typeof window.chrome.runtime === 'undefined') {
      window.chrome.runtime = {
        connect: makeNative(function connect() { 
          return { 
            postMessage: function(){}, 
            disconnect: function(){},
            onMessage: { addListener: function(){} },
            onDisconnect: { addListener: function(){} }
          }; 
        }, 'connect'),
        sendMessage: makeNative(function sendMessage() {}, 'sendMessage'),
        id: undefined,
        getManifest: makeNative(function() { return undefined; }, 'getManifest'),
        getURL: makeNative(function(path) { return ''; }, 'getURL'),
        OnInstalledReason: {
          INSTALL: 'install',
          UPDATE: 'update', 
          CHROME_UPDATE: 'chrome_update',
          SHARED_MODULE_UPDATE: 'shared_module_update'
        },
        OnRestartRequiredReason: {
          APP_UPDATE: 'app_update',
          OS_UPDATE: 'os_update',
          PERIODIC: 'periodic'
        },
        PlatformArch: {
          ARM: 'arm',
          ARM64: 'arm64',
          X86_32: 'x86-32',
          X86_64: 'x86-64',
          MIPS: 'mips',
          MIPS64: 'mips64'
        },
        PlatformOs: {
          MAC: 'mac',
          WIN: 'win',
          ANDROID: 'android',
          CROS: 'cros',
          LINUX: 'linux',
          OPENBSD: 'openbsd',
          FUCHSIA: 'fuchsia'
        }
      };
    }

    // Add csi (Client-Side Instrumentation) - present in desktop Chrome
    if (typeof window.chrome.csi === 'undefined') {
      window.chrome.csi = makeNative(function csi() {
        const timing = performance.timing || {};
        return {
          onloadT: timing.domContentLoadedEventEnd || Date.now(),
          pageT: performance.now(),
          startE: timing.navigationStart || Date.now() - 1000,
          tran: 15
        };
      }, 'csi');
    }

    // Add loadTimes - present in desktop Chrome
    if (typeof window.chrome.loadTimes === 'undefined') {
      window.chrome.loadTimes = makeNative(function loadTimes() {
        const timing = performance.timing || {};
        const now = Date.now() / 1000;
        return {
          commitLoadTime: timing.responseEnd ? timing.responseEnd / 1000 : now,
          connectionInfo: 'h2',
          finishDocumentLoadTime: timing.domContentLoadedEventEnd ? timing.domContentLoadedEventEnd / 1000 : now,
          finishLoadTime: timing.loadEventEnd ? timing.loadEventEnd / 1000 : now,
          firstPaintAfterLoadTime: 0,
          firstPaintTime: timing.domContentLoadedEventStart ? timing.domContentLoadedEventStart / 1000 : now,
          navigationType: 'Navigate',
          npnNegotiatedProtocol: 'h2',
          requestTime: timing.requestStart ? timing.requestStart / 1000 : now - 0.1,
          startLoadTime: timing.navigationStart ? timing.navigationStart / 1000 : now - 0.2,
          wasAlternateProtocolAvailable: false,
          wasFetchedViaSpdy: true,
          wasNpnNegotiated: true
        };
      }, 'loadTimes');
    }
    
    // Desktop Chrome app object
    if (!window.chrome.app) {
      window.chrome.app = {
        isInstalled: false,
        getDetails: makeNative(function() { return null; }, 'getDetails'),
        getIsInstalled: makeNative(function() { return false; }, 'getIsInstalled'),
        InstallState: { INSTALLED: 'installed', NOT_INSTALLED: 'not_installed', DISABLED: 'disabled' },
        runningState: makeNative(function() { return 'cannot_run'; }, 'runningState')
      };
    }
    
    // Make chrome object non-writable to prevent detection via assignment tests
    try {
      Object.defineProperty(window, 'chrome', {
        value: window.chrome,
        writable: false,
        configurable: true,
        enumerable: true
      });
    } catch (e) {}
  })();

  // 4. Remove cdc_ prefixed attributes from all elements
  const removeCdcAttributes = function() {
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      for (const attr of el.getAttributeNames()) {
        if (attr.startsWith('cdc_') || attr.startsWith('$cdc_')) {
          el.removeAttribute(attr);
        }
      }
    }
  };
  // Run now and on future DOM changes
  if (document.readyState !== 'loading') {
    removeCdcAttributes();
  } else {
    document.addEventListener('DOMContentLoaded', removeCdcAttributes);
  }

  // 5. Hide automation via document.createElement override
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = makeNative(function(tagName, options) {
    const element = originalCreateElement(tagName, options);
    // Ensure the element doesn't have automation markers
    if (element.removeAttribute) {
      try {
        for (const attr of (element.getAttributeNames?.() || [])) {
          if (attr.startsWith('cdc_') || attr.startsWith('$cdc_')) {
            element.removeAttribute(attr);
          }
        }
      } catch (e) {}
    }
    return element;
  }, 'createElement');

  // 6. Override Permissions API to prevent timing-based detection
  if (navigator.permissions && navigator.permissions.query) {
    const originalQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = makeNative(function(parameters) {
      return originalQuery(parameters).then((result) => {
        // Wrap result to hide any automation-specific behaviors
        return result;
      });
    }, 'query');
  }

  // 7. Fix Notification.permission if needed (automation can have unusual values)
  if (typeof Notification !== 'undefined') {
    try {
      Object.defineProperty(Notification, 'permission', {
        get: makeNative(function() { return 'default'; }, 'get permission'),
        configurable: true
      });
    } catch (e) {}
  }

  // 8. Clean up any CallPhantom or similar automation markers
  try { delete window.callPhantom; } catch (e) {}
  try { delete window._phantom; } catch (e) {}
  try { delete window.phantom; } catch (e) {}
  try { delete window.__nightmare; } catch (e) {}
  try { delete window.emit; } catch (e) {}
  try { delete window.awesomium; } catch (e) {}

  // 9. Sanitize Error stack traces to remove extension/automation references
  const originalErrorStackDesc = Object.getOwnPropertyDescriptor(Error.prototype, 'stack');
  if (originalErrorStackDesc && originalErrorStackDesc.get) {
    Object.defineProperty(Error.prototype, 'stack', {
      get: function() {
        const stack = originalErrorStackDesc.get.call(this);
        if (typeof stack === 'string') {
          // Remove extension URLs and automation-related stack entries
          return stack
            .split('\n')
            .filter(line => {
              const lower = line.toLowerCase();
              return !lower.includes('chrome-extension://') &&
                     !lower.includes('extension://') &&
                     !lower.includes('chromedriver') &&
                     !lower.includes('webdriver') &&
                     !lower.includes('selenium') &&
                     !lower.includes('puppeteer') &&
                     !lower.includes('playwright');
            })
            .join('\n');
        }
        return stack;
      },
      set: function(val) {
        if (originalErrorStackDesc.set) {
          originalErrorStackDesc.set.call(this, val);
        }
      },
      configurable: true
    });
  }

  // 10. Handle timing-based detection by normalizing performance values
  // Some detection looks for timing anomalies in the navigator/window access
  
  // 11. Override HeadlessChrome detection patterns
  if (navigator.userAgent && navigator.userAgent.includes('HeadlessChrome')) {
    // This shouldn't happen if we're spoofing userAgent, but just in case
    console.warn('[FP-SPOOF] HeadlessChrome detected in userAgent - spoofing may not be working');
  }

  // ============================================
  // PLUGIN/MIMETYPE SPOOFING (Critical for consistency)
  // fingerprint.com flags "chrome_no_plugins" as tampering signal
  // IMPORTANT: Desktop Chrome ALWAYS has plugins (PDF Viewer at minimum)
  // Mobile Chrome has plugins.length === 0 (this is normal for mobile)
  // 
  // KEY INSIGHT: If we're on desktop Chrome spoofing mobile, we have two options:
  // 1. Leave real plugins (inconsistent with mobile UA but avoids tampering flag)
  // 2. Fake empty plugins (consistent with mobile but triggers tampering flag)
  //
  // We choose option 1: Leave real plugins to avoid "chrome_no_plugins" flag
  // This is a trade-off, but fingerprint.com weights tampering signals heavily
  // ============================================
  
  // DISABLED: Don't override plugins on desktop Chrome - it causes "chrome_no_plugins" tampering signal
  // The real browser's plugins are more convincing than faked empty plugins
  /*
  if (isMobileProfile) {
    // Mobile Chrome has no plugins - this is expected
    // Create fake PluginArray that looks native
    const fakePluginArray = {
      length: 0,
      item: makeNative(function item(index) { return null; }, 'item'),
      namedItem: makeNative(function namedItem(name) { return null; }, 'namedItem'),
      refresh: makeNative(function refresh() {}, 'refresh'),
      [Symbol.iterator]: makeNative(function* () {}, '[Symbol.iterator]')
    };
    Object.defineProperty(fakePluginArray, Symbol.toStringTag, { value: 'PluginArray' });
    
    const fakeMimeTypeArray = {
      length: 0,
      item: makeNative(function item(index) { return null; }, 'item'),
      namedItem: makeNative(function namedItem(name) { return null; }, 'namedItem'),
      [Symbol.iterator]: makeNative(function* () {}, '[Symbol.iterator]')
    };
    Object.defineProperty(fakeMimeTypeArray, Symbol.toStringTag, { value: 'MimeTypeArray' });
    
    // Override on Navigator.prototype
    defineNativeGetter(Navigator.prototype, 'plugins', fakePluginArray, 'Navigator');
    defineNativeGetter(Navigator.prototype, 'mimeTypes', fakeMimeTypeArray, 'Navigator');
  }
  */

  // ============================================
  // PROTOTYPE CHAIN VERIFICATION EVASION
  // fingerprint.com checks Object.getPrototypeOf chains
  // ============================================
  
  // Ensure navigator's prototype chain looks correct
  // navigator -> Navigator.prototype -> Object.prototype -> null
  try {
    const realNavigatorProto = Object.getPrototypeOf(navigator);
    if (realNavigatorProto !== Navigator.prototype) {
      Object.setPrototypeOf(navigator, Navigator.prototype);
    }
  } catch (e) {}

  // ============================================
  // NAVIGATOR SPOOFING
  // ============================================

  const navigatorProps = {
    userAgent: nav.userAgent,
    appVersion: nav.appVersion,
    platform: nav.platform,
    language: nav.language,
    languages: nav.languages ? Object.freeze([...nav.languages]) : undefined,
    hardwareConcurrency: cpu.hardwareConcurrency || nav.hardwareConcurrency,
    deviceMemory: cpu.deviceMemory || nav.deviceMemory,
    maxTouchPoints: touchSupport.maxTouchPoints ?? nav.maxTouchPoints,
    vendor: nav.vendor,
    vendorSub: nav.vendorSub,
    product: nav.product,
    productSub: nav.productSub,
    appName: nav.appName,
    appCodeName: nav.appCodeName,
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    // webdriver is handled separately above (returns undefined)
    pdfViewerEnabled: nav.pdfViewerEnabled,
    onLine: nav.onLine,
  };

  for (const [prop, value] of Object.entries(navigatorProps)) {
    if (value !== undefined) {
      defineNativeGetter(Navigator.prototype, prop, value, 'Navigator');
    }
  }

  // ============================================
  // SCREEN SPOOFING (Complete)
  // ============================================

  const screenProps = {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    availLeft: screen.availLeft ?? 0,
    availTop: screen.availTop ?? 0,
  };

  for (const [prop, value] of Object.entries(screenProps)) {
    if (value !== undefined) {
      defineNativeGetter(Screen.prototype, prop, value, 'Screen');
    }
  }

  // Screen orientation
  if (screen.orientationType) {
    const orientationObj = {
      type: screen.orientationType,
      angle: screen.orientationAngle ?? 0,
      lock: makeNative(async function() { return undefined; }, 'lock'),
      unlock: makeNative(function() {}, 'unlock'),
      addEventListener: makeNative(function() {}, 'addEventListener'),
      removeEventListener: makeNative(function() {}, 'removeEventListener'),
      dispatchEvent: makeNative(function() { return true; }, 'dispatchEvent'),
      onchange: null
    };
    Object.defineProperty(orientationObj, Symbol.toStringTag, { value: 'ScreenOrientation' });
    
    defineNativeGetter(Screen.prototype, 'orientation', orientationObj, 'Screen');
  }

  // Window properties
  if (screen.devicePixelRatio !== undefined) {
    defineNativeGetter(window, 'devicePixelRatio', screen.devicePixelRatio);
  }
  if (screen.innerWidth !== undefined) {
    defineNativeGetter(window, 'innerWidth', screen.innerWidth);
  }
  if (screen.innerHeight !== undefined) {
    defineNativeGetter(window, 'innerHeight', screen.innerHeight);
  }
  if (screen.outerWidth !== undefined) {
    defineNativeGetter(window, 'outerWidth', screen.outerWidth);
  }
  if (screen.outerHeight !== undefined) {
    defineNativeGetter(window, 'outerHeight', screen.outerHeight);
  }
  if (screen.screenX !== undefined) {
    defineNativeGetter(window, 'screenX', screen.screenX);
    defineNativeGetter(window, 'screenLeft', screen.screenX);
  }
  if (screen.screenY !== undefined) {
    defineNativeGetter(window, 'screenY', screen.screenY);
    defineNativeGetter(window, 'screenTop', screen.screenY);
  }

  // Spoof clientWidth/clientHeight to fix scrollbarWidth calculation
  // scrollbarWidth = innerWidth - clientWidth, so clientWidth should equal innerWidth for mobile (no scrollbars)
  if (screen.scrollbarWidth !== undefined || screen.innerWidth !== undefined) {
    const spoofClientWidth = screen.innerWidth ?? window.innerWidth;
    const spoofClientHeight = screen.innerHeight ?? window.innerHeight;
    
    try {
      Object.defineProperty(Element.prototype, 'clientWidth', {
        get: makeNative(function() {
          if (this === document.documentElement) {
            return spoofClientWidth;
          }
          return this.getBoundingClientRect().width | 0;
        }, 'get clientWidth'),
        configurable: true
      });
      Object.defineProperty(Element.prototype, 'clientHeight', {
        get: makeNative(function() {
          if (this === document.documentElement) {
            return spoofClientHeight;
          }
          return this.getBoundingClientRect().height | 0;
        }, 'get clientHeight'),
        configurable: true
      });
    } catch (e) {}
  }

  // ============================================
  // VISUAL VIEWPORT SPOOFING
  // ============================================

  if (visualViewport.width !== undefined && window.visualViewport) {
    const vvProps = {
      width: visualViewport.width,
      height: visualViewport.height,
      offsetLeft: visualViewport.offsetLeft ?? 0,
      offsetTop: visualViewport.offsetTop ?? 0,
      pageLeft: visualViewport.pageLeft ?? 0,
      pageTop: visualViewport.pageTop ?? 0,
      scale: visualViewport.scale ?? 1
    };

    for (const [prop, value] of Object.entries(vvProps)) {
      if (value !== undefined) {
        defineNativeGetter(window.visualViewport, prop, value, 'VisualViewport');
      }
    }
  }

  // ============================================
  // ============================================
  // IP-BASED TIMEZONE DETECTION
  // ============================================
  // Fetches timezone from IP geolocation API to match IP with timezone
  // This prevents VPN detection (IP in USA but timezone in India = detected)
  
  const IP_TIMEZONE_STATE = {
    timezone: null,
    timezoneOffset: null,
    fetched: false,
    fetchPromise: null
  };
  
  // Convert IANA timezone to offset in minutes
  function getTimezoneOffsetFromIANA(timezone) {
    try {
      const now = new Date();
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      return Math.round((utcDate - tzDate) / 60000);
    } catch (e) {
      return null;
    }
  }
  
  // Fetch timezone from IP - DISABLED by default due to CORS restrictions in MAIN world
  // To enable: set spoofConfig.server.ipTimezoneEnabled = true
  // Note: This runs in page context so fetch is subject to page's CORS policy
  // For production use, this should be done in background.js and passed via storage
  if (spoofConfig && spoofConfig.server && spoofConfig.server.ipTimezoneEnabled === true) {
    (function fetchIPTimezone() {
      // Primary: worldtimeapi.org (HTTPS)
      IP_TIMEZONE_STATE.fetchPromise = fetch('https://worldtimeapi.org/api/ip', { mode: 'cors' })
        .then(r => r.json())
        .then(data => {
          if (data && data.timezone) {
            IP_TIMEZONE_STATE.timezone = data.timezone;
            IP_TIMEZONE_STATE.timezoneOffset = getTimezoneOffsetFromIANA(data.timezone);
            IP_TIMEZONE_STATE.fetched = true;
            console.log('[FP Spoofer] IP timezone detected:', data.timezone);
          }
        })
        .catch(() => {
          // Silent fail - will use profile timezone
          IP_TIMEZONE_STATE.fetched = true;
        });
    })();
  } else {
    // Use profile timezone directly when IP detection is disabled
    IP_TIMEZONE_STATE.fetched = true;
  }
  
  // Get effective timezone - IP-based if available, otherwise profile
  function getEffectiveTimezone() {
    if (IP_TIMEZONE_STATE.fetched && IP_TIMEZONE_STATE.timezone) {
      return IP_TIMEZONE_STATE.timezone;
    }
    return locale.timezone || dateTimeLocale.dateTimeTimeZone;
  }
  
  // Get effective offset - IP-based if available, otherwise profile
  function getEffectiveOffset() {
    if (IP_TIMEZONE_STATE.fetched && IP_TIMEZONE_STATE.timezoneOffset !== null) {
      return IP_TIMEZONE_STATE.timezoneOffset;
    }
    return locale.timezoneOffset;
  }

  // ============================================
  // LOCALE / INTL SPOOFING (Complete)
  // ============================================

  const spoofLocale = locale.locale || dateTimeLocale.dateTimeLocale;
  // Use dynamic getters for timezone to support IP-based detection
  const getEffectiveSpoofTimezone = () => getEffectiveTimezone();
  const getEffectiveSpoofOffset = () => getEffectiveOffset();
  // Keep static references for backwards compatibility in some places
  const spoofTimezone = locale.timezone || dateTimeLocale.dateTimeTimeZone;
  const spoofOffset = locale.timezoneOffset;

  if (spoofLocale || spoofTimezone) {
    // Intl.DateTimeFormat
    const OriginalDateTimeFormat = Intl.DateTimeFormat;
    const DateTimeFormatProxy = function(...args) {
      // Replace locale if provided
      if (spoofLocale && args.length === 0) {
        args[0] = spoofLocale;
      } else if (spoofLocale && typeof args[0] === 'undefined') {
        args[0] = spoofLocale;
      }
      
      // Inject timezone into options - use IP-based timezone
      const effectiveTz = getEffectiveSpoofTimezone();
      if (effectiveTz) {
        if (!args[1]) args[1] = {};
        if (!args[1].timeZone) args[1].timeZone = effectiveTz;
      }
      
      const instance = new OriginalDateTimeFormat(...args);
      const origResolvedOptions = instance.resolvedOptions.bind(instance);
      
      instance.resolvedOptions = makeNative(function() {
        const opts = origResolvedOptions();
        const currentTz = getEffectiveSpoofTimezone();
        if (spoofLocale) opts.locale = spoofLocale;
        if (currentTz) opts.timeZone = currentTz;
        if (dateTimeLocale.dateTimeCalendar) opts.calendar = dateTimeLocale.dateTimeCalendar;
        if (dateTimeLocale.numberingSystem) opts.numberingSystem = dateTimeLocale.numberingSystem;
        return opts;
      }, 'resolvedOptions');
      
      return instance;
    };
    DateTimeFormatProxy.prototype = OriginalDateTimeFormat.prototype;
    DateTimeFormatProxy.supportedLocalesOf = OriginalDateTimeFormat.supportedLocalesOf;
    makeNative(DateTimeFormatProxy, 'DateTimeFormat');
    Intl.DateTimeFormat = DateTimeFormatProxy;

    // Intl.NumberFormat
    const OriginalNumberFormat = Intl.NumberFormat;
    const NumberFormatProxy = function(...args) {
      if (spoofLocale && args.length === 0) {
        args[0] = spoofLocale;
      } else if (spoofLocale && typeof args[0] === 'undefined') {
        args[0] = spoofLocale;
      }
      
      const instance = new OriginalNumberFormat(...args);
      const origResolvedOptions = instance.resolvedOptions.bind(instance);
      
      instance.resolvedOptions = makeNative(function() {
        const opts = origResolvedOptions();
        if (dateTimeLocale.numberFormatLocale) opts.locale = dateTimeLocale.numberFormatLocale;
        if (dateTimeLocale.numberingSystem) opts.numberingSystem = dateTimeLocale.numberingSystem;
        return opts;
      }, 'resolvedOptions');
      
      return instance;
    };
    NumberFormatProxy.prototype = OriginalNumberFormat.prototype;
    NumberFormatProxy.supportedLocalesOf = OriginalNumberFormat.supportedLocalesOf;
    makeNative(NumberFormatProxy, 'NumberFormat');
    Intl.NumberFormat = NumberFormatProxy;

    // Intl.Collator
    const OriginalCollator = Intl.Collator;
    const CollatorProxy = function(...args) {
      if (spoofLocale && args.length === 0) args[0] = spoofLocale;
      const instance = new OriginalCollator(...args);
      const origResolvedOptions = instance.resolvedOptions.bind(instance);
      instance.resolvedOptions = makeNative(function() {
        const opts = origResolvedOptions();
        if (dateTimeLocale.collatorLocale) opts.locale = dateTimeLocale.collatorLocale;
        return opts;
      }, 'resolvedOptions');
      return instance;
    };
    CollatorProxy.prototype = OriginalCollator.prototype;
    CollatorProxy.supportedLocalesOf = OriginalCollator.supportedLocalesOf;
    makeNative(CollatorProxy, 'Collator');
    Intl.Collator = CollatorProxy;

    // Intl.PluralRules
    const OriginalPluralRules = Intl.PluralRules;
    const PluralRulesProxy = function(...args) {
      if (spoofLocale && args.length === 0) args[0] = spoofLocale;
      const instance = new OriginalPluralRules(...args);
      const origResolvedOptions = instance.resolvedOptions.bind(instance);
      instance.resolvedOptions = makeNative(function() {
        const opts = origResolvedOptions();
        if (dateTimeLocale.pluralRulesLocale) opts.locale = dateTimeLocale.pluralRulesLocale;
        return opts;
      }, 'resolvedOptions');
      return instance;
    };
    PluralRulesProxy.prototype = OriginalPluralRules.prototype;
    PluralRulesProxy.supportedLocalesOf = OriginalPluralRules.supportedLocalesOf;
    makeNative(PluralRulesProxy, 'PluralRules');
    Intl.PluralRules = PluralRulesProxy;

    // Intl.RelativeTimeFormat
    if (Intl.RelativeTimeFormat) {
      const OriginalRelativeTimeFormat = Intl.RelativeTimeFormat;
      const RelativeTimeFormatProxy = function(...args) {
        if (spoofLocale && args.length === 0) args[0] = spoofLocale;
        const instance = new OriginalRelativeTimeFormat(...args);
        const origResolvedOptions = instance.resolvedOptions.bind(instance);
        instance.resolvedOptions = makeNative(function() {
          const opts = origResolvedOptions();
          if (dateTimeLocale.relativeTimeLocale) opts.locale = dateTimeLocale.relativeTimeLocale;
          return opts;
        }, 'resolvedOptions');
        return instance;
      };
      RelativeTimeFormatProxy.prototype = OriginalRelativeTimeFormat.prototype;
      RelativeTimeFormatProxy.supportedLocalesOf = OriginalRelativeTimeFormat.supportedLocalesOf;
      makeNative(RelativeTimeFormatProxy, 'RelativeTimeFormat');
      Intl.RelativeTimeFormat = RelativeTimeFormatProxy;
    }
  }

  // Date.prototype.getTimezoneOffset - uses IP-based offset
  Date.prototype.getTimezoneOffset = makeNative(function() {
    const effectiveOffset = getEffectiveSpoofOffset();
    if (effectiveOffset !== undefined && effectiveOffset !== null) {
      return effectiveOffset; // Return IP-based or profile offset
    }
    // Fallback to original behavior if no offset available
    return new Date().constructor.prototype.getTimezoneOffset.call(this);
  }, 'getTimezoneOffset');

  // Date.prototype.toLocaleDateString and toLocaleTimeString
  // Use exact locale from profile for consistent formatting
  if (spoofLocale) {
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
    const originalToLocaleString = Date.prototype.toLocaleString;
    
    Date.prototype.toLocaleDateString = makeNative(function(locales, options) {
      // Use spoofed locale if no locale provided, IP-based timezone
      const useLocale = locales || spoofLocale;
      const useOptions = options || {};
      const effectiveTz = getEffectiveSpoofTimezone();
      if (effectiveTz && !useOptions.timeZone) useOptions.timeZone = effectiveTz;
      return originalToLocaleDateString.call(this, useLocale, useOptions);
    }, 'toLocaleDateString');
    
    Date.prototype.toLocaleTimeString = makeNative(function(locales, options) {
      const useLocale = locales || spoofLocale;
      const useOptions = options || {};
      const effectiveTz = getEffectiveSpoofTimezone();
      if (effectiveTz && !useOptions.timeZone) useOptions.timeZone = effectiveTz;
      return originalToLocaleTimeString.call(this, useLocale, useOptions);
    }, 'toLocaleTimeString');
    
    Date.prototype.toLocaleString = makeNative(function(locales, options) {
      const useLocale = locales || spoofLocale;
      const useOptions = options || {};
      const effectiveTz = getEffectiveSpoofTimezone();
      if (effectiveTz && !useOptions.timeZone) useOptions.timeZone = effectiveTz;
      return originalToLocaleString.call(this, useLocale, useOptions);
    }, 'toLocaleString');
  }

  // ============================================
  // CANVAS SPOOFING (Using Proxy pattern like Canvas Defender)
  // ============================================

  {
    // Store originals before any modification
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    
    // Generate deterministic noise shifts based on profile hash
    const canvasHash = canvas.hash || 'default';
    const seed = canvasHash.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const shift = {
      r: ((seed * 9301 + 49297) % 233280) % 10 - 5,
      g: ((seed * 9302 + 49298) % 233280) % 10 - 5,
      b: ((seed * 9303 + 49299) % 233280) % 10 - 5,
      a: 0 // Don't modify alpha to avoid transparency issues
    };
    
    // Track canvases we've already noisified to avoid double-processing
    const noisifiedCanvases = new WeakSet();
    
    // Noisify function - adds noise to canvas using 2D context
    const noisify = function(canvas, context) {
      if (!context || !canvas) return;
      // Only noisify once per canvas to avoid compounding noise
      if (noisifiedCanvases.has(canvas)) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      if (width && height && width > 0 && height > 0) {
        try {
          const imageData = originalGetImageData.call(context, 0, 0, width, height);
          const data = imageData.data;
          
          // Add noise to each pixel
          for (let i = 0; i < data.length; i += 4) {
            data[i + 0] = Math.max(0, Math.min(255, data[i + 0] + shift.r));     // R
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + shift.g));     // G
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + shift.b));     // B
            // data[i + 3] unchanged (alpha)
          }
          
          context.putImageData(imageData, 0, 0);
          noisifiedCanvases.add(canvas);
        } catch (e) {
          // Canvas might be tainted or empty - ignore
        }
      }
    };
    
    // Store original getContext to use with willReadFrequently
    const originalCanvasGetContext = HTMLCanvasElement.prototype.getContext;
    
    // Helper to get 2D context with willReadFrequently to avoid Chrome warnings
    const get2DContextForRead = function(canvas) {
      // Use willReadFrequently: true to avoid "Multiple readback operations" warning
      return originalCanvasGetContext.call(canvas, '2d', { willReadFrequently: true });
    };
    
    // Use Proxy pattern for toBlob
    HTMLCanvasElement.prototype.toBlob = new Proxy(HTMLCanvasElement.prototype.toBlob, {
      apply(target, self, args) {
        // Noisify canvas before extracting blob
        noisify(self, get2DContextForRead(self));
        return Reflect.apply(target, self, args);
      }
    });
    
    // Use Proxy pattern for toDataURL
    HTMLCanvasElement.prototype.toDataURL = new Proxy(HTMLCanvasElement.prototype.toDataURL, {
      apply(target, self, args) {
        // Noisify canvas before extracting data URL
        noisify(self, get2DContextForRead(self));
        return Reflect.apply(target, self, args);
      }
    });
    
    // Use Proxy pattern for getImageData - add noise directly to result
    CanvasRenderingContext2D.prototype.getImageData = new Proxy(originalGetImageData, {
      apply(target, self, args) {
        // Get the original image data
        const imageData = Reflect.apply(target, self, args);
        
        // Add noise directly to the returned data (don't call noisify to avoid recursive getImageData)
        try {
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i + 0] = Math.max(0, Math.min(255, data[i + 0] + shift.r));     // R
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + shift.g));     // G
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + shift.b));     // B
            // data[i + 3] unchanged (alpha)
          }
        } catch (e) {
          // Ignore errors
        }
        
        return imageData;
      }
    });
  }

  // ============================================
  // WEBGL SPOOFING (Complete - with fake context fallback)
  // ============================================

  // WebGL constants
  const UNMASKED_VENDOR_WEBGL = 37445;
  const UNMASKED_RENDERER_WEBGL = 37446;
  const GL_VENDOR = 7936;
  const GL_RENDERER = 7937;
  const GL_VERSION = 7938;
  const GL_SHADING_LANGUAGE_VERSION = 35724;
  const GL_MAX_TEXTURE_SIZE = 3379;
  const GL_MAX_RENDERBUFFER_SIZE = 34024;
  const GL_MAX_VIEWPORT_DIMS = 3386;
  const GL_MAX_VERTEX_ATTRIBS = 34921;
  const GL_MAX_VERTEX_UNIFORM_VECTORS = 36347;
  const GL_MAX_VARYING_VECTORS = 36348;
  const GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661;
  const GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660;
  const GL_MAX_TEXTURE_IMAGE_UNITS = 34930;
  const GL_MAX_FRAGMENT_UNIFORM_VECTORS = 36349;
  const GL_ALIASED_LINE_WIDTH_RANGE = 33902;
  const GL_ALIASED_POINT_SIZE_RANGE = 33901;
  const GL_DEPTH_BITS = 3414;
  const GL_STENCIL_BITS = 3415;
  const GL_MAX_CUBE_MAP_TEXTURE_SIZE = 34076;
  
  // Create a comprehensive fake WebGL context for when no GPU is available
  function createFakeWebGLContext(canvas, contextType) {
    const isWebGL2 = contextType === 'webgl2';
    
    // Fake extension object for WEBGL_debug_renderer_info
    const fakeDebugRendererInfo = {
      UNMASKED_VENDOR_WEBGL: UNMASKED_VENDOR_WEBGL,
      UNMASKED_RENDERER_WEBGL: UNMASKED_RENDERER_WEBGL
    };
    
    // Use profile extensions if available, otherwise use mobile defaults
    const supportedExtensions = webgl.extensions || [
      'ANGLE_instanced_arrays',
      'EXT_blend_minmax',
      'EXT_color_buffer_half_float',
      'EXT_float_blend',
      'EXT_texture_filter_anisotropic',
      'EXT_sRGB',
      'OES_element_index_uint',
      'OES_fbo_render_mipmap',
      'OES_standard_derivatives',
      'OES_texture_float',
      'OES_texture_float_linear',
      'OES_texture_half_float',
      'OES_texture_half_float_linear',
      'OES_vertex_array_object',
      'WEBGL_color_buffer_float',
      'WEBGL_compressed_texture_astc',
      'WEBGL_compressed_texture_etc',
      'WEBGL_compressed_texture_etc1',
      'WEBGL_debug_renderer_info',
      'WEBGL_debug_shaders',
      'WEBGL_depth_texture',
      'WEBGL_lose_context',
      'WEBGL_multi_draw'
    ];
    
    // Additional WebGL constants for more parameters
    const GL_RED_BITS = 3410;
    const GL_GREEN_BITS = 3411;
    const GL_BLUE_BITS = 3412;
    const GL_ALPHA_BITS = 3413;
    const GL_SUBPIXEL_BITS = 3408;
    const GL_MAX_ELEMENTS_VERTICES = 33000;
    const GL_MAX_ELEMENTS_INDICES = 33001;
    const GL_MAX_3D_TEXTURE_SIZE = 32883;
    const GL_MAX_ARRAY_TEXTURE_LAYERS = 35071;
    const GL_MAX_TEXTURE_LOD_BIAS = 34045;
    const GL_MAX_DRAW_BUFFERS = 34852;
    const GL_MAX_COLOR_ATTACHMENTS = 36063;
    const GL_MAX_SAMPLES = 36183;
    
    // Create fake context with all necessary methods
    // Use Object.create to set proper prototype chain so instanceof checks pass
    // Check if WebGL constructors exist first
    let ContextPrototype = null;
    if (isWebGL2 && typeof WebGL2RenderingContext !== 'undefined') {
      ContextPrototype = WebGL2RenderingContext.prototype;
    } else if (typeof WebGLRenderingContext !== 'undefined') {
      ContextPrototype = WebGLRenderingContext.prototype;
    }
    
    // Create fake context - if no prototype available, use plain object
    const fakeContext = ContextPrototype ? Object.create(ContextPrototype) : {};
    
    // Set basic properties using defineProperty (prototype has read-only getters)
    Object.defineProperty(fakeContext, 'canvas', { value: canvas, writable: false, configurable: true });
    Object.defineProperty(fakeContext, 'drawingBufferWidth', { value: canvas.width || 300, writable: false, configurable: true });
    Object.defineProperty(fakeContext, 'drawingBufferHeight', { value: canvas.height || 150, writable: false, configurable: true });
    
    // Override getParameter with our values
    fakeContext.getParameter = makeNative(function(param) {
        switch(param) {
          case UNMASKED_VENDOR_WEBGL:
            return webgl.unmaskedVendor || 'Qualcomm';
          case UNMASKED_RENDERER_WEBGL:
            return webgl.unmaskedRenderer || 'Adreno (TM) 630';
          case GL_VENDOR:
            return webgl.vendor || 'WebKit';
          case GL_RENDERER:
            return webgl.renderer || 'WebKit WebGL';
          case GL_VERSION:
            return webgl.version || (isWebGL2 ? 'WebGL 2.0 (OpenGL ES 3.0 Chromium)' : 'WebGL 1.0 (OpenGL ES 2.0 Chromium)');
          case GL_SHADING_LANGUAGE_VERSION:
            return webgl.shadingLanguageVersion || (isWebGL2 ? 'WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.0 Chromium)' : 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)');
          case GL_MAX_TEXTURE_SIZE:
            return webgl.maxTextureSize || 4096;
          case GL_MAX_RENDERBUFFER_SIZE:
            return webgl.maxRenderbufferSize || 16384;
          case GL_MAX_VIEWPORT_DIMS:
            return new Int32Array(webgl.maxViewportDims || [16384, 16384]);
          case GL_MAX_VERTEX_ATTRIBS:
            return webgl.maxVertexAttribs || 32;
          case GL_MAX_VERTEX_UNIFORM_VECTORS:
            return webgl.maxVertexUniformVectors || 256;
          case GL_MAX_VARYING_VECTORS:
            return webgl.maxVaryingVectors || 31;
          case GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS:
            return webgl.maxCombinedTextureUnits || 96;
          case GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS:
            return webgl.maxVertexTextureUnits || 16;
          case GL_MAX_TEXTURE_IMAGE_UNITS:
            return webgl.maxTextureImageUnits || 16;
          case GL_MAX_FRAGMENT_UNIFORM_VECTORS:
            return webgl.maxFragmentUniformVectors || 256;
          case GL_ALIASED_LINE_WIDTH_RANGE:
            return new Float32Array(webgl.aliasedLineWidthRange || [1, 8]);
          case GL_ALIASED_POINT_SIZE_RANGE:
            return new Float32Array(webgl.aliasedPointSizeRange || [1, 1023]);
          case GL_DEPTH_BITS:
            return webgl.depthBits || 24;
          case GL_STENCIL_BITS:
            return webgl.stencilBits || 0;
          case GL_MAX_CUBE_MAP_TEXTURE_SIZE:
            return webgl.maxCubeMapTextureSize || 4096;
          case GL_RED_BITS:
            return webgl.redBits || 8;
          case GL_GREEN_BITS:
            return webgl.greenBits || 8;
          case GL_BLUE_BITS:
            return webgl.blueBits || 8;
          case GL_ALPHA_BITS:
            return webgl.alphaBits || 8;
          case GL_SUBPIXEL_BITS:
            return webgl.subpixelBits || 4;
          // WebGL2 specific parameters
          case GL_MAX_ELEMENTS_VERTICES:
            return 16777216;
          case GL_MAX_ELEMENTS_INDICES:
            return 16777216;
          case GL_MAX_3D_TEXTURE_SIZE:
            return isWebGL2 ? 2048 : null;
          case GL_MAX_ARRAY_TEXTURE_LAYERS:
            return isWebGL2 ? 2048 : null;
          case GL_MAX_TEXTURE_LOD_BIAS:
            return isWebGL2 ? 16 : null;
          case GL_MAX_DRAW_BUFFERS:
            return isWebGL2 ? 8 : null;
          case GL_MAX_COLOR_ATTACHMENTS:
            return isWebGL2 ? 8 : null;
          case GL_MAX_SAMPLES:
            return isWebGL2 ? 4 : null;
          default:
            return null;
        }
      }, 'getParameter');
      
    fakeContext.getExtension = makeNative(function(name) {
        if (name === 'WEBGL_debug_renderer_info') {
          return fakeDebugRendererInfo;
        }
        if (supportedExtensions.includes(name)) {
          // Return a minimal fake extension object with proper structure
          if (name === 'OES_vertex_array_object') {
            return { createVertexArrayOES: function() { return {}; }, bindVertexArrayOES: function() {}, deleteVertexArrayOES: function() {} };
          }
          if (name === 'ANGLE_instanced_arrays') {
            return { drawArraysInstancedANGLE: function() {}, drawElementsInstancedANGLE: function() {}, vertexAttribDivisorANGLE: function() {} };
          }
          if (name === 'OES_element_index_uint') {
            return {};
          }
          if (name === 'WEBGL_lose_context') {
            return { loseContext: function() {}, restoreContext: function() {} };
          }
          return {};
        }
        return null;
      }, 'getExtension');
      
    fakeContext.getSupportedExtensions = makeNative(function() {
        return [...supportedExtensions];
      }, 'getSupportedExtensions');
      
    fakeContext.getContextAttributes = makeNative(function() {
        return {
          alpha: true,
          antialias: true,
          depth: true,
          desynchronized: false,
          failIfMajorPerformanceCaveat: false,
          powerPreference: 'default',
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          stencil: false,
          xrCompatible: false
        };
      }, 'getContextAttributes');
      
    fakeContext.isContextLost = makeNative(function() {
        return false;
      }, 'isContextLost');
      
    fakeContext.getShaderPrecisionFormat = makeNative(function(shaderType, precisionType) {
        return {
          rangeMin: 127,
          rangeMax: 127,
          precision: 23
        };
      }, 'getShaderPrecisionFormat');
      
    // Stub methods that fingerprinters might call
    fakeContext.createShader = makeNative(function() { return {}; }, 'createShader');
    fakeContext.shaderSource = makeNative(function() {}, 'shaderSource');
    fakeContext.compileShader = makeNative(function() {}, 'compileShader');
    fakeContext.getShaderParameter = makeNative(function() { return true; }, 'getShaderParameter');
    fakeContext.createProgram = makeNative(function() { return {}; }, 'createProgram');
    fakeContext.attachShader = makeNative(function() {}, 'attachShader');
    fakeContext.linkProgram = makeNative(function() {}, 'linkProgram');
    fakeContext.getProgramParameter = makeNative(function() { return true; }, 'getProgramParameter');
    fakeContext.useProgram = makeNative(function() {}, 'useProgram');
    fakeContext.createBuffer = makeNative(function() { return {}; }, 'createBuffer');
    fakeContext.bindBuffer = makeNative(function() {}, 'bindBuffer');
    fakeContext.bufferData = makeNative(function() {}, 'bufferData');
    fakeContext.enableVertexAttribArray = makeNative(function() {}, 'enableVertexAttribArray');
    fakeContext.vertexAttribPointer = makeNative(function() {}, 'vertexAttribPointer');
    fakeContext.getAttribLocation = makeNative(function() { return 0; }, 'getAttribLocation');
    fakeContext.getUniformLocation = makeNative(function() { return {}; }, 'getUniformLocation');
    fakeContext.uniform1f = makeNative(function() {}, 'uniform1f');
    fakeContext.uniform2f = makeNative(function() {}, 'uniform2f');
    fakeContext.uniform3f = makeNative(function() {}, 'uniform3f');
    fakeContext.uniform4f = makeNative(function() {}, 'uniform4f');
    fakeContext.uniformMatrix4fv = makeNative(function() {}, 'uniformMatrix4fv');
    fakeContext.drawArrays = makeNative(function() {}, 'drawArrays');
    fakeContext.drawElements = makeNative(function() {}, 'drawElements');
    fakeContext.viewport = makeNative(function() {}, 'viewport');
    fakeContext.clear = makeNative(function() {}, 'clear');
    fakeContext.clearColor = makeNative(function() {}, 'clearColor');
    fakeContext.clearDepth = makeNative(function() {}, 'clearDepth');
    fakeContext.enable = makeNative(function() {}, 'enable');
    fakeContext.disable = makeNative(function() {}, 'disable');
    fakeContext.depthFunc = makeNative(function() {}, 'depthFunc');
    fakeContext.blendFunc = makeNative(function() {}, 'blendFunc');
    fakeContext.createTexture = makeNative(function() { return {}; }, 'createTexture');
    fakeContext.bindTexture = makeNative(function() {}, 'bindTexture');
    fakeContext.texImage2D = makeNative(function() {}, 'texImage2D');
    fakeContext.texParameteri = makeNative(function() {}, 'texParameteri');
    fakeContext.activeTexture = makeNative(function() {}, 'activeTexture');
    fakeContext.generateMipmap = makeNative(function() {}, 'generateMipmap');
    fakeContext.pixelStorei = makeNative(function() {}, 'pixelStorei');
    fakeContext.createFramebuffer = makeNative(function() { return {}; }, 'createFramebuffer');
    fakeContext.bindFramebuffer = makeNative(function() {}, 'bindFramebuffer');
    fakeContext.framebufferTexture2D = makeNative(function() {}, 'framebufferTexture2D');
    fakeContext.checkFramebufferStatus = makeNative(function() { return 36053; }, 'checkFramebufferStatus'); // GL_FRAMEBUFFER_COMPLETE
    fakeContext.readPixels = makeNative(function(x, y, width, height, format, type, pixels) {
        // Fill with deterministic data based on profile
        if (pixels) {
          const seed = (webgl.unmaskedRenderer || 'Adreno').charCodeAt(0);
          for (let i = 0; i < pixels.length; i++) {
            pixels[i] = (seed * (i + 1) * 17) % 256;
          }
        }
      }, 'readPixels');
    fakeContext.getError = makeNative(function() { return 0; }, 'getError'); // GL_NO_ERROR
    fakeContext.finish = makeNative(function() {}, 'finish');
    fakeContext.flush = makeNative(function() {}, 'flush');
    fakeContext.deleteShader = makeNative(function() {}, 'deleteShader');
    fakeContext.deleteProgram = makeNative(function() {}, 'deleteProgram');
    fakeContext.deleteBuffer = makeNative(function() {}, 'deleteBuffer');
    fakeContext.deleteTexture = makeNative(function() {}, 'deleteTexture');
    fakeContext.deleteFramebuffer = makeNative(function() {}, 'deleteFramebuffer');
    fakeContext.scissor = makeNative(function() {}, 'scissor');
    fakeContext.colorMask = makeNative(function() {}, 'colorMask');
    fakeContext.depthMask = makeNative(function() {}, 'depthMask');
    fakeContext.stencilMask = makeNative(function() {}, 'stencilMask');
    fakeContext.cullFace = makeNative(function() {}, 'cullFace');
    fakeContext.frontFace = makeNative(function() {}, 'frontFace');
    fakeContext.lineWidth = makeNative(function() {}, 'lineWidth');
    fakeContext.polygonOffset = makeNative(function() {}, 'polygonOffset');
    
    // Add WebGL constants to the context - only if not already defined on prototype
    // Using Object.defineProperty to avoid read-only errors from prototype chain
    const webglConstants = {
      DEPTH_BUFFER_BIT: 256, COLOR_BUFFER_BIT: 16384, STENCIL_BUFFER_BIT: 1024,
      POINTS: 0, LINES: 1, LINE_LOOP: 2, LINE_STRIP: 3, TRIANGLES: 4, TRIANGLE_STRIP: 5, TRIANGLE_FAN: 6,
      ZERO: 0, ONE: 1, SRC_COLOR: 768, ONE_MINUS_SRC_COLOR: 769, SRC_ALPHA: 770, ONE_MINUS_SRC_ALPHA: 771,
      DST_ALPHA: 772, ONE_MINUS_DST_ALPHA: 773, DST_COLOR: 774, ONE_MINUS_DST_COLOR: 775,
      FUNC_ADD: 32774, BLEND_EQUATION: 32777, BLEND_EQUATION_RGB: 32777, BLEND_EQUATION_ALPHA: 34877,
      FUNC_SUBTRACT: 32778, FUNC_REVERSE_SUBTRACT: 32779,
      BLEND_DST_RGB: 32968, BLEND_SRC_RGB: 32969, BLEND_DST_ALPHA: 32970, BLEND_SRC_ALPHA: 32971,
      CONSTANT_COLOR: 32769, ONE_MINUS_CONSTANT_COLOR: 32770, CONSTANT_ALPHA: 32771, ONE_MINUS_CONSTANT_ALPHA: 32772,
      BLEND_COLOR: 32773, ARRAY_BUFFER: 34962, ELEMENT_ARRAY_BUFFER: 34963,
      ARRAY_BUFFER_BINDING: 34964, ELEMENT_ARRAY_BUFFER_BINDING: 34965,
      STREAM_DRAW: 35040, STATIC_DRAW: 35044, DYNAMIC_DRAW: 35048,
      BUFFER_SIZE: 34660, BUFFER_USAGE: 34661,
      CURRENT_VERTEX_ATTRIB: 34342, FRONT: 1028, BACK: 1029, FRONT_AND_BACK: 1032,
      TEXTURE_2D: 3553, CULL_FACE: 2884, BLEND: 3042, DITHER: 3024, STENCIL_TEST: 2960, DEPTH_TEST: 2929,
      SCISSOR_TEST: 3089, POLYGON_OFFSET_FILL: 32823, SAMPLE_ALPHA_TO_COVERAGE: 32926, SAMPLE_COVERAGE: 32928,
      TEXTURE0: 33984, TEXTURE1: 33985, TEXTURE2: 33986, TEXTURE3: 33987,
      VERTEX_SHADER: 35633, FRAGMENT_SHADER: 35632,
      FLOAT: 5126, UNSIGNED_BYTE: 5121, UNSIGNED_SHORT: 5123, UNSIGNED_INT: 5125,
      RGBA: 6408, RGB: 6407, ALPHA: 6406, LUMINANCE: 6409, LUMINANCE_ALPHA: 6410,
      NEAREST: 9728, LINEAR: 9729, NEAREST_MIPMAP_NEAREST: 9984, LINEAR_MIPMAP_NEAREST: 9985,
      NEAREST_MIPMAP_LINEAR: 9986, LINEAR_MIPMAP_LINEAR: 9987,
      TEXTURE_MAG_FILTER: 10240, TEXTURE_MIN_FILTER: 10241, TEXTURE_WRAP_S: 10242, TEXTURE_WRAP_T: 10243,
      REPEAT: 10497, CLAMP_TO_EDGE: 33071, MIRRORED_REPEAT: 33648,
      FRAMEBUFFER: 36160, RENDERBUFFER: 36161, FRAMEBUFFER_COMPLETE: 36053,
      COLOR_ATTACHMENT0: 36064, DEPTH_ATTACHMENT: 36096, STENCIL_ATTACHMENT: 36128,
      NONE: 0, NO_ERROR: 0, INVALID_ENUM: 1280, INVALID_VALUE: 1281, INVALID_OPERATION: 1282,
      OUT_OF_MEMORY: 1285, CONTEXT_LOST_WEBGL: 37442,
      UNPACK_ALIGNMENT: 3317, PACK_ALIGNMENT: 3333,
      UNPACK_FLIP_Y_WEBGL: 37440, UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37441
    };
    
    // Only add constants that don't exist on proto (avoids read-only errors)
    for (const [key, value] of Object.entries(webglConstants)) {
      if (!(key in fakeContext)) {
        try {
          Object.defineProperty(fakeContext, key, { value, writable: false, enumerable: true, configurable: false });
        } catch (e) { /* Already exists on prototype - skip */ }
      }
    }
    
    // CRITICAL: Bind all methods to fakeContext to prevent "Illegal invocation" errors
    // This happens when sites destructure methods like: const { bindBuffer } = gl;
    for (const key of Object.keys(fakeContext)) {
      if (typeof fakeContext[key] === 'function') {
        fakeContext[key] = fakeContext[key].bind(fakeContext);
      }
    }
    
    return fakeContext;
  }
  
  // Check if we have valid WebGL profile data to spoof (with specific values)
  // Note: Even if hasWebGLProfile is false, we still use fake WebGL with defaults
  const hasWebGLProfile = webgl.supported === true || webgl.unmaskedRenderer || webgl.unmaskedVendor;
  console.log('[FP Spoofer] hasWebGLProfile:', hasWebGLProfile, 'webgl:', JSON.stringify(webgl));
  
  // STRATEGY: Try real WebGL first, only use fake as fallback
  // Real WebGL allows actual rendering (3D demos, games) while we spoof fingerprint values
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = makeNative(function(contextType, contextAttributes) {
    const isWebGLContext = contextType === 'webgl' || contextType === 'experimental-webgl' || contextType === 'webgl2';
    
    if (isWebGLContext) {
      // Try to get real WebGL context first
      const realContext = originalGetContext.call(this, contextType, contextAttributes);
      
      if (realContext) {
        console.log('[FP Spoofer] Using REAL WebGL context with spoofed params for:', contextType);
        // Real context works! We already override getParameter/getExtension on the prototype
        // so fingerprint values will be spoofed while real rendering works
        return realContext;
      }
      
      // Real WebGL failed (headless/no GPU) - use fake context
      console.log('[FP Spoofer] Real WebGL unavailable, using FAKE context for:', contextType);
      return createFakeWebGLContext(this, contextType);
    }
    
    // For non-WebGL contexts (2d, bitmaprenderer, etc.), use real implementation
    return originalGetContext.call(this, contextType, contextAttributes);
  }, 'getContext');
  
  // Also spoof OffscreenCanvas.getContext for WebGL (fingerprinters use this too)
  if (typeof OffscreenCanvas !== 'undefined') {
    const originalOffscreenGetContext = OffscreenCanvas.prototype.getContext;
    OffscreenCanvas.prototype.getContext = makeNative(function(contextType, contextAttributes) {
      const isWebGLContext = contextType === 'webgl' || contextType === 'experimental-webgl' || contextType === 'webgl2';
      
      if (isWebGLContext) {
        // Try real context first
        const realContext = originalOffscreenGetContext.call(this, contextType, contextAttributes);
        if (realContext) {
          return realContext;
        }
        // Fallback to fake
        console.log('[FP Spoofer] Using fake WebGL context for OffscreenCanvas');
        const fakeCanvas = { width: this.width || 300, height: this.height || 150 };
        return createFakeWebGLContext(fakeCanvas, contextType);
      }
      
      // For non-WebGL contexts, use real implementation
      return originalOffscreenGetContext.call(this, contextType, contextAttributes);
    }, 'getContext');
  }
  
  // ALWAYS spoof WebGLRenderingContext methods - use profile data or good defaults
  // This ensures WebGL works even when real GPU is unavailable (headless)
  // Guard against environments where WebGL doesn't exist at all
  if (typeof WebGLRenderingContext !== 'undefined') {
    // Store original getParameter
    const getParameterOriginal = WebGLRenderingContext.prototype.getParameter;
    
    // WHITELIST of valid WebGL1 getParameter params - anything not in this list returns null
    // This prevents INVALID_ENUM warnings for WebGL2-only and extension-specific params
    const validWebGL1Params = new Set([
      // String params
      7936,   // VENDOR
      7937,   // RENDERER
      7938,   // VERSION
      35724,  // SHADING_LANGUAGE_VERSION
      // WEBGL_debug_renderer_info (always available via our fake)
      37445,  // UNMASKED_VENDOR_WEBGL
      37446,  // UNMASKED_RENDERER_WEBGL
      // Integer params
      3379,   // MAX_TEXTURE_SIZE
      34076,  // MAX_CUBE_MAP_TEXTURE_SIZE
      34024,  // MAX_RENDERBUFFER_SIZE
      34921,  // MAX_VERTEX_ATTRIBS
      36347,  // MAX_VERTEX_UNIFORM_VECTORS
      36348,  // MAX_VARYING_VECTORS
      35661,  // MAX_COMBINED_TEXTURE_IMAGE_UNITS
      35660,  // MAX_VERTEX_TEXTURE_IMAGE_UNITS
      34930,  // MAX_TEXTURE_IMAGE_UNITS
      36349,  // MAX_FRAGMENT_UNIFORM_VECTORS
      3414,   // DEPTH_BITS
      3415,   // STENCIL_BITS
      3410,   // RED_BITS
      3411,   // GREEN_BITS
      3412,   // BLUE_BITS
      3413,   // ALPHA_BITS
      3408,   // SUBPIXEL_BITS
      32936,  // SAMPLE_BUFFERS
      32937,  // SAMPLES
      // Float32Array params
      33902,  // ALIASED_LINE_WIDTH_RANGE
      33901,  // ALIASED_POINT_SIZE_RANGE
      // Int32Array params
      3386,   // MAX_VIEWPORT_DIMS
      32824,  // DEPTH_RANGE
      // State params (commonly queried)
      2849,   // LINE_WIDTH
      32823,  // POLYGON_OFFSET_FILL
      32824,  // POLYGON_OFFSET_FACTOR
      10752,  // POLYGON_OFFSET_UNITS
      2884,   // CULL_FACE
      2885,   // CULL_FACE_MODE
      2886,   // FRONT_FACE
      2929,   // DEPTH_TEST
      2930,   // DEPTH_WRITEMASK
      2931,   // DEPTH_CLEAR_VALUE
      2932,   // DEPTH_FUNC
      2960,   // STENCIL_TEST
      2961,   // STENCIL_FUNC
      2962,   // STENCIL_VALUE_MASK
      2963,   // STENCIL_REF
      2964,   // STENCIL_FAIL
      2965,   // STENCIL_PASS_DEPTH_FAIL
      2966,   // STENCIL_PASS_DEPTH_PASS
      2967,   // STENCIL_BACK_FUNC
      2968,   // STENCIL_BACK_VALUE_MASK
      34817,  // STENCIL_BACK_REF
      34816,  // STENCIL_BACK_FAIL
      34818,  // STENCIL_BACK_PASS_DEPTH_FAIL
      34819,  // STENCIL_BACK_PASS_DEPTH_PASS
      2971,   // STENCIL_WRITEMASK
      36005,  // STENCIL_BACK_WRITEMASK
      2968,   // STENCIL_CLEAR_VALUE
      3024,   // DITHER
      3042,   // BLEND
      32773,  // BLEND_COLOR
      32777,  // BLEND_EQUATION_RGB
      34877,  // BLEND_EQUATION_ALPHA
      32969,  // BLEND_SRC_RGB
      32968,  // BLEND_DST_RGB
      32971,  // BLEND_SRC_ALPHA
      32970,  // BLEND_DST_ALPHA
      3089,   // SCISSOR_TEST
      3088,   // SCISSOR_BOX
      3106,   // COLOR_CLEAR_VALUE
      3107,   // COLOR_WRITEMASK
      3317,   // UNPACK_ALIGNMENT
      3333,   // PACK_ALIGNMENT
      37440,  // UNPACK_FLIP_Y_WEBGL
      37441,  // UNPACK_PREMULTIPLY_ALPHA_WEBGL
      37443,  // UNPACK_COLORSPACE_CONVERSION_WEBGL
      // Binding params
      34964,  // ARRAY_BUFFER_BINDING
      34965,  // ELEMENT_ARRAY_BUFFER_BINDING
      35725,  // CURRENT_PROGRAM
      32873,  // TEXTURE_BINDING_2D
      34068,  // TEXTURE_BINDING_CUBE_MAP
      36006,  // FRAMEBUFFER_BINDING
      36007,  // RENDERBUFFER_BINDING
      34016,  // ACTIVE_TEXTURE
      2978,   // VIEWPORT
      // Implementation limits
      2928,   // DEPTH_RANGE
      36346,  // COMPRESSED_TEXTURE_FORMATS
      35739,  // IMPLEMENTATION_COLOR_READ_FORMAT
      35738,  // IMPLEMENTATION_COLOR_READ_TYPE
      // Additional state
      32926,  // SAMPLE_ALPHA_TO_COVERAGE
      32928,  // SAMPLE_COVERAGE
      32939,  // SAMPLE_COVERAGE_VALUE
      32938,  // SAMPLE_COVERAGE_INVERT
      7936,   // GENERATE_MIPMAP_HINT (same as VENDOR, won't cause issue)
    ]);
    
    // Track which extensions have been enabled on each context
    const enabledExtensions = new WeakMap();
    
    WebGLRenderingContext.prototype.getParameter = makeNative(function(param) {
      // Handle spoofed params - return our values
      if (param === UNMASKED_VENDOR_WEBGL) {
        return webgl.unmaskedVendor || 'Qualcomm';
      }
      if (param === UNMASKED_RENDERER_WEBGL) {
        return webgl.unmaskedRenderer || 'Adreno (TM) 630';
      }
      if (param === GL_VENDOR) {
        return webgl.vendor || 'WebKit';
      }
      if (param === GL_RENDERER) {
        return webgl.renderer || 'WebKit WebGL';
      }
      if (param === GL_VERSION && webgl.version) {
        return webgl.version;
      }
      if (param === GL_SHADING_LANGUAGE_VERSION && webgl.shadingLanguageVersion) {
        return webgl.shadingLanguageVersion;
      }
      if (param === GL_MAX_TEXTURE_SIZE && webgl.maxTextureSize) {
        return webgl.maxTextureSize;
      }
      if (param === GL_MAX_RENDERBUFFER_SIZE && webgl.maxRenderbufferSize) {
        return webgl.maxRenderbufferSize;
      }
      if (param === GL_MAX_VIEWPORT_DIMS && webgl.maxViewportDims) {
        return new Int32Array(webgl.maxViewportDims);
      }
      
      // Only pass through valid WebGL1 params to prevent INVALID_ENUM
      if (!validWebGL1Params.has(param)) {
        return null;
      }
      
      // Pass through to real implementation for valid params
      try {
        return getParameterOriginal.call(this, param);
      } catch (e) {
        return null;
      }
    }, 'getParameter');

    // Spoof getExtension to return fake debug_renderer_info when real one unavailable
    const fakeDebugRendererInfoExt = {
      UNMASKED_VENDOR_WEBGL: UNMASKED_VENDOR_WEBGL,
      UNMASKED_RENDERER_WEBGL: UNMASKED_RENDERER_WEBGL
    };
    
    const getExtensionOriginal = WebGLRenderingContext.prototype.getExtension;
    WebGLRenderingContext.prototype.getExtension = makeNative(function(name) {
      // Always return fake debug_renderer_info so unmasked vendor/renderer work
      if (name === 'WEBGL_debug_renderer_info') {
        return fakeDebugRendererInfoExt;
      }
      const ext = getExtensionOriginal.call(this, name);
      // Track enabled extensions for getParameter checks
      if (ext) {
        if (!enabledExtensions.has(this)) {
          enabledExtensions.set(this, new Set());
        }
        enabledExtensions.get(this).add(name);
      }
      return ext;
    }, 'getExtension');
    
    // Spoof getSupportedExtensions to return profile extensions
    if (webgl.extensions && webgl.extensions.length > 0) {
      const getSupportedExtensionsOriginal = WebGLRenderingContext.prototype.getSupportedExtensions;
      WebGLRenderingContext.prototype.getSupportedExtensions = makeNative(function() {
        // Return profile's extension list
        return [...webgl.extensions];
      }, 'getSupportedExtensions');
    }
    
    // Spoof getShaderPrecisionFormat for shader precision fingerprinting
    const shaderPrecisions = client.webglPrecisions?.shaderPrecisions || {};
    if (Object.keys(shaderPrecisions).length > 0) {
      const getShaderPrecisionFormatOriginal = WebGLRenderingContext.prototype.getShaderPrecisionFormat;
      WebGLRenderingContext.prototype.getShaderPrecisionFormat = makeNative(function(shaderType, precisionType) {
        // Map shader type and precision type to profile values
        const shaderNames = { 35633: 'VERTEX', 35632: 'FRAGMENT' };
        const precisionNames = { 36336: 'LOW_FLOAT', 36337: 'MEDIUM_FLOAT', 36338: 'HIGH_FLOAT', 36339: 'LOW_INT', 36340: 'MEDIUM_INT', 36341: 'HIGH_INT' };
        const shaderName = shaderNames[shaderType];
        const precisionName = precisionNames[precisionType];
        const key = `${shaderName}_${precisionName}`;
        
        if (shaderPrecisions[key]) {
          return {
            rangeMin: shaderPrecisions[key].rangeMin,
            rangeMax: shaderPrecisions[key].rangeMax,
            precision: shaderPrecisions[key].precision
          };
        }
        // Fallback to real implementation
        return getShaderPrecisionFormatOriginal.call(this, shaderType, precisionType);
      }, 'getShaderPrecisionFormat');
    }

    if (typeof WebGL2RenderingContext !== 'undefined') {
      // Whitelist of valid WebGL2 getParameter params
      const validWebGL2Params = new Set([
        // All WebGL1 params are valid in WebGL2
        ...validWebGL1Params,
        // WebGL2-specific params
        32883,  // MAX_3D_TEXTURE_SIZE
        33170,  // CONTEXT_PROFILE_MASK (only some implementations)
        34045,  // MAX_TEXTURE_LOD_BIAS
        34467,  // MAX_FRAGMENT_INPUT_COMPONENTS
        34852,  // MAX_DRAW_BUFFERS
        35071,  // MAX_ARRAY_TEXTURE_LAYERS
        35076,  // MIN_PROGRAM_TEXEL_OFFSET
        35077,  // MAX_PROGRAM_TEXEL_OFFSET
        35371,  // MAX_VERTEX_UNIFORM_BLOCKS
        35373,  // MAX_FRAGMENT_UNIFORM_BLOCKS (note: different from 35372)
        35374,  // MAX_COMBINED_UNIFORM_BLOCKS
        35375,  // MAX_UNIFORM_BUFFER_BINDINGS
        35376,  // MAX_UNIFORM_BLOCK_SIZE
        35377,  // MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS
        35379,  // UNIFORM_BUFFER_OFFSET_ALIGNMENT
        35380,  // MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS
        35657,  // MAX_PROGRAM_TEXEL_OFFSET (duplicate check)
        35658,  // MAX_VARYING_COMPONENTS
        35659,  // MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS (duplicate)
        35968,  // MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS
        35978,  // MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS
        35979,  // MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS
        36003,  // TRANSFORM_FEEDBACK_BUFFER_BINDING
        36004,  // TRANSFORM_FEEDBACK_BUFFER_SIZE
        36063,  // MAX_COLOR_ATTACHMENTS
        36183,  // MAX_SAMPLES
        37154,  // MAX_VERTEX_OUTPUT_COMPONENTS
        37157,  // MAX_FRAGMENT_INPUT_COMPONENTS (duplicate)
        // Additional WebGL2 state params
        35660,  // MAX_VERTEX_TEXTURE_IMAGE_UNITS (already in WebGL1)
        35661,  // MAX_COMBINED_TEXTURE_IMAGE_UNITS (already in WebGL1)
        36005,  // STENCIL_BACK_WRITEMASK (already in WebGL1)
        36006,  // FRAMEBUFFER_BINDING
        36007,  // RENDERBUFFER_BINDING
        36347,  // MAX_VERTEX_UNIFORM_VECTORS
        36348,  // MAX_VARYING_VECTORS
        36349,  // MAX_FRAGMENT_UNIFORM_VECTORS
      ]);
      
      const getParameter2Original = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = makeNative(function(param) {
        if (param === UNMASKED_VENDOR_WEBGL) {
          return webgl.unmaskedVendor || 'Qualcomm';
        }
        if (param === UNMASKED_RENDERER_WEBGL) {
          return webgl.unmaskedRenderer || 'Adreno (TM) 630';
        }
        if (param === GL_VENDOR) {
          return webgl.vendor || 'WebKit';
        }
        if (param === GL_RENDERER) {
          return webgl.renderer || 'WebKit WebGL';
        }
        if (param === GL_VERSION && webgl.version) {
          return webgl.version;
        }
        if (param === GL_SHADING_LANGUAGE_VERSION && webgl.shadingLanguageVersion) {
          return webgl.shadingLanguageVersion;
        }
        
        // Only pass through valid WebGL2 params to prevent INVALID_ENUM
        if (!validWebGL2Params.has(param)) {
          return null;
        }
        
        try {
          return getParameter2Original.call(this, param);
        } catch (e) {
          return null;
        }
      }, 'getParameter');
      
      const getExtension2Original = WebGL2RenderingContext.prototype.getExtension;
      WebGL2RenderingContext.prototype.getExtension = makeNative(function(name) {
        // Always return fake debug_renderer_info for WebGL2 too
        if (name === 'WEBGL_debug_renderer_info') {
          return fakeDebugRendererInfoExt;
        }
        return getExtension2Original.call(this, name);
      }, 'getExtension');
      
      // Spoof getSupportedExtensions for WebGL2
      if (webgl.extensions && webgl.extensions.length > 0) {
        const getSupportedExtensions2Original = WebGL2RenderingContext.prototype.getSupportedExtensions;
        WebGL2RenderingContext.prototype.getSupportedExtensions = makeNative(function() {
          return [...webgl.extensions];
        }, 'getSupportedExtensions');
      }
      
      // Spoof getShaderPrecisionFormat for WebGL2
      if (Object.keys(shaderPrecisions).length > 0) {
        const getShaderPrecisionFormat2Original = WebGL2RenderingContext.prototype.getShaderPrecisionFormat;
        WebGL2RenderingContext.prototype.getShaderPrecisionFormat = makeNative(function(shaderType, precisionType) {
          const shaderNames = { 35633: 'VERTEX', 35632: 'FRAGMENT' };
          const precisionNames = { 36336: 'LOW_FLOAT', 36337: 'MEDIUM_FLOAT', 36338: 'HIGH_FLOAT', 36339: 'LOW_INT', 36340: 'MEDIUM_INT', 36341: 'HIGH_INT' };
          const shaderName = shaderNames[shaderType];
          const precisionName = precisionNames[precisionType];
          const key = `${shaderName}_${precisionName}`;
          
          if (shaderPrecisions[key]) {
            return {
              rangeMin: shaderPrecisions[key].rangeMin,
              rangeMax: shaderPrecisions[key].rangeMax,
              precision: shaderPrecisions[key].precision
            };
          }
          return getShaderPrecisionFormat2Original.call(this, shaderType, precisionType);
        }, 'getShaderPrecisionFormat');
      }
    }
  }

  // ============================================
  // AUDIO CONTEXT SPOOFING (Complete - baseLatency, value, sampleRate, sampleRateLive)
  // ============================================

  const audioLatency = client.audioLatency || {};
  const audioBaseLatencySimple = client.audioBaseLatencySimple;

  // Spoof AudioContext properties (baseLatency, outputLatency, sampleRate)
  // Target sampleRateLive (48000 for mobile)
  const targetSampleRateLive = audio.sampleRateLive ?? 48000;
  const targetBaseLatency = audioLatency.baseLatency ?? audioBaseLatencySimple ?? 0.003;
  const targetOutputLatency = audioLatency.outputLatency ?? 0;
  const targetMaxChannelCount = audioLatency.maxChannelCount ?? audio.maxChannelCount ?? 2;
  const targetChannelCount = audioLatency.channelCount ?? 2;
  const targetChannelInterpretation = audioLatency.channelInterpretation ?? 'speakers';

  // Override AudioContext constructor to spoof properties
  const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
  if (OriginalAudioContext) {
    const AudioContextProxy = function(...args) {
      const ctx = new OriginalAudioContext(...args);
      
      // Spoof sampleRate (this is sampleRateLive in fingerprint)
      Object.defineProperty(ctx, 'sampleRate', {
        get: makeNative(function() { return targetSampleRateLive; }, 'get sampleRate'),
        configurable: true
      });
      
      // Spoof baseLatency
      Object.defineProperty(ctx, 'baseLatency', {
        get: makeNative(function() { return targetBaseLatency; }, 'get baseLatency'),
        configurable: true
      });
      
      // Spoof outputLatency
      Object.defineProperty(ctx, 'outputLatency', {
        get: makeNative(function() { return targetOutputLatency; }, 'get outputLatency'),
        configurable: true
      });
      
      // Spoof sampleRate on destination
      if (ctx.destination) {
        Object.defineProperty(ctx.destination, 'maxChannelCount', {
          get: makeNative(function() { return targetMaxChannelCount; }, 'get maxChannelCount'),
          configurable: true
        });
        Object.defineProperty(ctx.destination, 'channelCount', {
          get: makeNative(function() { return targetChannelCount; }, 'get channelCount'),
          configurable: true
        });
        Object.defineProperty(ctx.destination, 'channelInterpretation', {
          get: makeNative(function() { return targetChannelInterpretation; }, 'get channelInterpretation'),
          configurable: true
        });
      }
      
      return ctx;
    };
    AudioContextProxy.prototype = OriginalAudioContext.prototype;
    makeNative(AudioContextProxy, 'AudioContext');
    window.AudioContext = AudioContextProxy;
    if (window.webkitAudioContext) {
      window.webkitAudioContext = AudioContextProxy;
    }
  }

  if (audio.value !== undefined) {
    const targetAudioValue = audio.value;
    
    // Intercept OfflineAudioContext.startRendering to return buffer with target fingerprint
    if (window.OfflineAudioContext) {
      const OriginalOfflineAudioContext = window.OfflineAudioContext;
      const originalStartRendering = OriginalOfflineAudioContext.prototype.startRendering;
      
      OfflineAudioContext.prototype.startRendering = makeNative(function() {
        return originalStartRendering.call(this).then((renderedBuffer) => {
          // Intercept getChannelData on this specific buffer
          const originalGetChannelData = renderedBuffer.getChannelData.bind(renderedBuffer);
          renderedBuffer.getChannelData = makeNative(function(channel) {
            const data = originalGetChannelData(channel);
            
            // Audio fingerprint typically sums samples 4500-5000
            // Calculate current sum and adjust to match target
            let currentSum = 0;
            for (let i = 4500; i < 5000 && i < data.length; i++) {
              currentSum += Math.abs(data[i]);
            }
            
            if (currentSum !== 0 && data.length >= 5000) {
              // Calculate adjustment factor
              const adjustment = targetAudioValue / currentSum;
              
              // Create new array with adjusted values
              const newData = new Float32Array(data.length);
              for (let i = 0; i < data.length; i++) {
                if (i >= 4500 && i < 5000) {
                  newData[i] = data[i] * adjustment;
                } else {
                  newData[i] = data[i];
                }
              }
              return newData;
            }
            return data;
          }, 'getChannelData');
          
          return renderedBuffer;
        });
      }, 'startRendering');
    }
  }

  // ============================================
  // PLUGINS & MIMETYPES SPOOFING
  // CRITICAL: Must match mobile/desktop profile correctly
  // - Mobile profiles: MUST have empty plugins (override to empty)
  // - Desktop profiles: Should have plugins (PDF Viewer, etc.)
  // ============================================

  const pluginsData = client.plugins;
  const mimeTypesData = client.mimeTypes;
  
  // Use isMobileProfile already defined earlier in the code
  
  if (isMobileProfile) {
    // Mobile profiles: Create proper empty PluginArray and MimeTypeArray
    // This is expected behavior - mobile Chrome has no plugins
    const createEmptyPluginArray = makeNative(function() {
      const arr = {
        length: 0,
        item: makeNative(function(i) { return null; }, 'item'),
        namedItem: makeNative(function(n) { return null; }, 'namedItem'),
        refresh: makeNative(function() {}, 'refresh'),
        [Symbol.iterator]: function*() {}
      };
      Object.defineProperty(arr, Symbol.toStringTag, { value: 'PluginArray' });
      return arr;
    }, 'get plugins');
    
    const createEmptyMimeTypeArray = makeNative(function() {
      const arr = {
        length: 0,
        item: makeNative(function(i) { return null; }, 'item'),
        namedItem: makeNative(function(n) { return null; }, 'namedItem'),
        [Symbol.iterator]: function*() {}
      };
      Object.defineProperty(arr, Symbol.toStringTag, { value: 'MimeTypeArray' });
      return arr;
    }, 'get mimeTypes');
    
    Object.defineProperty(Navigator.prototype, 'plugins', { get: createEmptyPluginArray, configurable: true });
    Object.defineProperty(Navigator.prototype, 'mimeTypes', { get: createEmptyMimeTypeArray, configurable: true });
    
    // Mobile doesn't have PDF viewer
    defineNativeGetter(Navigator.prototype, 'pdfViewerEnabled', false, 'Navigator');
    
  } else if (pluginsData !== undefined && Array.isArray(pluginsData) && pluginsData.length > 0) {
    // Desktop profile with specific plugins to spoof
    const spoofedPlugins = pluginsData.map((p) => {
      const plugin = {
        name: p.name,
        filename: p.filename,
        description: p.description,
        length: p.mimes?.length || 0,
        item: makeNative(function(idx) { return this[idx]; }, 'item'),
        namedItem: makeNative(function(name) { return null; }, 'namedItem'),
        [Symbol.iterator]: function*() { for (let i = 0; i < this.length; i++) yield this[i]; }
      };
      if (p.mimes) {
        p.mimes.forEach((m, idx) => {
          plugin[idx] = { type: m.type, description: m.description, suffixes: m.suffixes };
        });
      }
      return plugin;
    });

    const createPluginArray = makeNative(function() {
      const arr = {};
      spoofedPlugins.forEach((p, i) => arr[i] = p);
      Object.defineProperty(arr, 'length', { get: () => spoofedPlugins.length, enumerable: true });
      arr.item = makeNative((i) => arr[i] || null, 'item');
      arr.namedItem = makeNative((n) => spoofedPlugins.find(p => p.name === n) || null, 'namedItem');
      arr.refresh = makeNative(() => {}, 'refresh');
      arr[Symbol.iterator] = function*() { for (let i = 0; i < spoofedPlugins.length; i++) yield arr[i]; };
      return arr;
    }, 'get plugins');

    Object.defineProperty(Navigator.prototype, 'plugins', { get: createPluginArray, configurable: true });
  }
  // ELSE: Desktop profile with empty plugins data - let real browser plugins show

  // Spoof mimeTypes for desktop profiles with mimeTypes data
  if (!isMobileProfile && mimeTypesData !== undefined && Array.isArray(mimeTypesData) && mimeTypesData.length > 0) {
    const spoofedMimeTypes = mimeTypesData.map((m) => ({
      type: m.type,
      description: m.description,
      suffixes: m.suffixes,
      enabledPlugin: m.enabledPlugin
    }));

    const createMimeTypeArray = makeNative(function() {
      const arr = {};
      spoofedMimeTypes.forEach((m, i) => arr[i] = m);
      Object.defineProperty(arr, 'length', { get: () => spoofedMimeTypes.length, enumerable: true });
      arr.item = makeNative((i) => arr[i] || null, 'item');
      arr.namedItem = makeNative((n) => spoofedMimeTypes.find(m => m.type === n) || null, 'namedItem');
      arr[Symbol.iterator] = function*() { for (let i = 0; i < spoofedMimeTypes.length; i++) yield arr[i]; };
      return arr;
    }, 'get mimeTypes');

    Object.defineProperty(Navigator.prototype, 'mimeTypes', { get: createMimeTypeArray, configurable: true });
  }

  // Spoof pdfViewerEnabled for desktop profiles if explicitly specified
  if (!isMobileProfile) {
    const navigatorInfo = client.navigator || {};
    if (navigatorInfo.pdfViewerEnabled !== undefined && navigatorInfo.pdfViewerEnabled !== null) {
      defineNativeGetter(Navigator.prototype, 'pdfViewerEnabled', navigatorInfo.pdfViewerEnabled, 'Navigator');
    }
  }

  // ============================================
  // BATTERY API SPOOFING
  // ============================================

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
    Object.defineProperty(spoofedBattery, Symbol.toStringTag, { value: 'BatteryManager' });

    Navigator.prototype.getBattery = makeNative(async function() {
      return spoofedBattery;
    }, 'getBattery');
  }

  // ============================================
  // STORAGE QUOTA SPOOFING
  // ============================================
  // Spoof navigator.storage.estimate() to return mobile-appropriate values
  // This hides the real disk size which is a fingerprinting vector

  if (navigator.storage && storageInfo.storageEstimate) {
    const spoofedEstimate = {
      quota: storageInfo.storageEstimate.quota || 68719476736, // ~64GB default for mobile
      usage: storageInfo.storageEstimate.usage || 0,
      usageDetails: storageInfo.storageEstimate.usageDetails || {}
    };

    const originalEstimate = navigator.storage.estimate;
    navigator.storage.estimate = makeNative(async function() {
      return { ...spoofedEstimate };
    }, 'estimate');
  }

  // ============================================
  // MEDIA DEVICES SPOOFING
  // ============================================
  // Spoof navigator.mediaDevices.enumerateDevices() to return controlled device list
  // This hides the real number of cameras/microphones which is a fingerprinting vector

  if (navigator.mediaDevices && mediaDevicesProfile.length > 0) {
    const spoofedDevices = mediaDevicesProfile.map((device, index) => {
      // Create a MediaDeviceInfo-like object
      const deviceInfo = {
        deviceId: device.deviceId || '',
        groupId: device.groupId || '',
        kind: device.kind || 'audioinput',
        label: device.label || ''
      };
      // Make it look like a real MediaDeviceInfo
      Object.defineProperty(deviceInfo, 'toJSON', {
        value: makeNative(function() {
          return {
            deviceId: this.deviceId,
            groupId: this.groupId,
            kind: this.kind,
            label: this.label
          };
        }, 'toJSON'),
        enumerable: false
      });
      return deviceInfo;
    });

    const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
    navigator.mediaDevices.enumerateDevices = makeNative(async function() {
      return [...spoofedDevices];
    }, 'enumerateDevices');
  }

  // ============================================
  // MEDIA QUERIES SPOOFING (Complete)
  // ============================================

  const originalMatchMedia = window.matchMedia;
  const colorGamut = colorProfile.colorGamutString || client.colorGamut;
  
  // Get raw query results from cssMediaQueriesExtended if available
  const cssMediaQueriesExtended = client.cssMediaQueriesExtended || {};
  const rawQueryResults = cssMediaQueriesExtended.queries || {};
  
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

    // First check if we have an exact raw query result from the profile
    // Try to match the query pattern to stored results
    for (const [storedQuery, storedResult] of Object.entries(rawQueryResults)) {
      // Check if the query contains the stored query pattern
      if (query.includes(storedQuery) || storedQuery.includes(query.replace(/[()]/g, '').trim())) {
        return createResult(storedResult);
      }
    }

    // Fall back to derived values from mediaQueries object
    // Color scheme
    if (query.includes('prefers-color-scheme: dark')) return createResult(mediaQueries.darkMode ?? false);
    if (query.includes('prefers-color-scheme: light')) return createResult(mediaQueries.lightMode ?? true);
    
    // Reduced motion
    if (query.includes('prefers-reduced-motion: reduce')) return createResult(mediaQueries.reducedMotion ?? false);
    if (query.includes('prefers-reduced-motion: no-preference')) return createResult(!mediaQueries.reducedMotion ?? true);
    
    // HDR
    if (query.includes('dynamic-range: high')) return createResult(mediaQueries.hdr ?? false);
    if (query.includes('dynamic-range: standard')) return createResult(!mediaQueries.hdr ?? true);
    
    // Color gamut
    if (query.includes('color-gamut: srgb')) return createResult(mediaQueries.colorGamutSRGB ?? true);
    if (query.includes('color-gamut: p3')) return createResult(mediaQueries.colorGamutP3 ?? false);
    if (query.includes('color-gamut: rec2020')) return createResult(mediaQueries.colorGamutRec2020 ?? false);
    
    // Pointer
    if (query.includes('pointer: coarse')) return createResult(mediaQueries.coarsePointer ?? false);
    if (query.includes('pointer: fine')) return createResult(mediaQueries.finePointer ?? true);
    if (query.includes('pointer: none')) return createResult(mediaQueries.noPointer ?? false);
    if (query.includes('any-pointer: coarse')) return createResult(mediaQueries.coarsePointer ?? false);
    if (query.includes('any-pointer: fine')) return createResult(mediaQueries.finePointer ?? true);
    
    // Hover
    if (query.includes('hover: hover')) return createResult(mediaQueries.hover ?? true);
    if (query.includes('hover: none')) return createResult(!mediaQueries.hover ?? false);
    if (query.includes('any-hover: hover')) return createResult(mediaQueries.anyHover ?? true);
    if (query.includes('any-hover: none')) return createResult(!mediaQueries.anyHover ?? false);
    
    // Orientation
    if (query.includes('orientation: portrait')) {
      const isPortrait = screen.orientationType?.includes('portrait') ?? true;
      return createResult(isPortrait);
    }
    if (query.includes('orientation: landscape')) {
      const isLandscape = screen.orientationType?.includes('landscape') ?? false;
      return createResult(isLandscape);
    }
    
    // Display mode (PWA)
    if (query.includes('display-mode: fullscreen')) return createResult(pwaInfo.displayMode === 'fullscreen');
    if (query.includes('display-mode: standalone')) return createResult(pwaInfo.displayMode === 'standalone');
    if (query.includes('display-mode: minimal-ui')) return createResult(pwaInfo.displayMode === 'minimal-ui');
    if (query.includes('display-mode: browser')) return createResult(pwaInfo.displayMode === 'browser' || !pwaInfo.displayMode);
    
    // Contrast
    if (query.includes('prefers-contrast: more')) return createResult(mediaQueries.highContrast ?? false);
    if (query.includes('prefers-contrast: less')) return createResult(false);
    if (query.includes('prefers-contrast: no-preference')) return createResult(!mediaQueries.highContrast ?? true);
    
    // Transparency
    if (query.includes('prefers-reduced-transparency: reduce')) return createResult(mediaQueries.reducedTransparency ?? false);
    if (query.includes('prefers-reduced-transparency: no-preference')) return createResult(!mediaQueries.reducedTransparency ?? true);
    
    // Inverted colors
    if (query.includes('inverted-colors: inverted')) return createResult(mediaQueries.invertedColors ?? false);
    if (query.includes('inverted-colors: none')) return createResult(!mediaQueries.invertedColors ?? true);
    
    // Forced colors
    if (query.includes('forced-colors: active')) return createResult(mediaQueries.forcedColors ?? false);
    if (query.includes('forced-colors: none')) return createResult(!mediaQueries.forcedColors ?? true);
    
    // Monochrome
    if (query.includes('monochrome')) return createResult(mediaQueries.monochrome ?? false);
    
    // Update
    if (query.includes('update: fast')) return createResult(true);
    if (query.includes('update: slow')) return createResult(false);
    if (query.includes('update: none')) return createResult(false);
    
    // Overflow
    if (query.includes('overflow-block: scroll')) return createResult(true);
    if (query.includes('overflow-inline: scroll')) return createResult(mediaQueries.overflowInline ?? true);
    
    // Scripting
    if (query.includes('scripting: enabled')) return createResult(true);
    if (query.includes('scripting: none')) return createResult(false);
    
    return result;
  }, 'matchMedia');

  // ============================================
  // USER AGENT DATA SPOOFING
  // ============================================

  if (navigator.userAgentData && (uaHighEntropy.platform || navigatorExtra.uaData_platform)) {
    const brands = uaHighEntropy.brands || navigatorExtra.uaData_brands || [];
    const spoofedUAData = {
      brands: brands,
      mobile: uaHighEntropy.mobile ?? navigatorExtra.uaData_mobile ?? false,
      platform: uaHighEntropy.platform || navigatorExtra.uaData_platform || '',
      getHighEntropyValues: makeNative(async function(hints) {
        return {
          architecture: uaHighEntropy.architecture || '',
          bitness: uaHighEntropy.bitness || '',
          brands: brands,
          fullVersionList: uaHighEntropy.fullVersionList || [],
          mobile: this.mobile,
          model: uaHighEntropy.model || '',
          platform: this.platform,
          platformVersion: uaHighEntropy.platformVersion || '',
          uaFullVersion: uaHighEntropy.uaFullVersion || ''
        };
      }, 'getHighEntropyValues'),
      toJSON: makeNative(function() {
        return { brands: this.brands, mobile: this.mobile, platform: this.platform };
      }, 'toJSON')
    };
    Object.defineProperty(spoofedUAData, Symbol.toStringTag, { value: 'NavigatorUAData' });

    defineNativeGetter(Navigator.prototype, 'userAgentData', spoofedUAData, 'Navigator');
  }

  // ============================================
  // TOUCH SUPPORT SPOOFING
  // ============================================

  // For mobile profiles, ensure touch support looks native
  if (touchSupport.touchEvent === true) {
    // Create TouchEvent if it doesn't exist (desktop Chrome usually has it)
    if (typeof window.TouchEvent === 'undefined') {
      const FakeTouchEvent = function TouchEvent(type, eventInitDict) {
        return new UIEvent(type, eventInitDict);
      };
      FakeTouchEvent.prototype = UIEvent.prototype;
      window.TouchEvent = makeNative(FakeTouchEvent, 'TouchEvent');
    }
    
    // CRITICAL: For 'ontouchstart' in window to return true, we need to define it on window
    // Using Object.defineProperty ensures it's detected by 'in' operator
    const touchProps = ['ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel'];
    touchProps.forEach(prop => {
      if (!(prop in window)) {
        Object.defineProperty(window, prop, {
          value: null,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    });
    
    // Also define on document
    touchProps.forEach(prop => {
      if (!(prop in document)) {
        Object.defineProperty(document, prop, {
          value: null,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    });
    
    // Also define on document.documentElement
    if (document.documentElement) {
      touchProps.forEach(prop => {
        if (!(prop in document.documentElement)) {
          try {
            Object.defineProperty(document.documentElement, prop, {
              value: null,
              writable: true,
              configurable: true,
              enumerable: true
            });
          } catch(e) {}
        }
      });
    }
    
    console.log('[FP-SPOOF] TouchEvent spoofed: TouchEvent exists:', typeof window.TouchEvent !== 'undefined', ', ontouchstart in window:', 'ontouchstart' in window);
  } else if (touchSupport.touchEvent === false) {
    // Hide TouchEvent for non-touch devices
    try {
      delete window.TouchEvent;
    } catch (e) {}
  }

  // ============================================
  // NETWORK CONNECTION SPOOFING
  // ============================================

  if (navigator.connection && (networkExtended.effectiveType || client.network)) {
    const networkData = networkExtended.effectiveType ? networkExtended : client.network || {};
    
    const connectionProps = {
      effectiveType: networkData.effectiveType,
      downlink: networkData.downlink,
      rtt: networkData.rtt,
      saveData: networkData.saveData ?? false,
      type: networkData.type,
      downlinkMax: networkData.downlinkMax,
      onchange: networkData.onchange !== undefined ? (networkData.onchange ? function(){} : null) : navigator.connection.onchange
    };

    for (const [prop, value] of Object.entries(connectionProps)) {
      if (value !== undefined) {
        try {
          Object.defineProperty(navigator.connection, prop, {
            get: makeNative(() => value, `get ${prop}`),
            configurable: true,
            enumerable: true
          });
        } catch (e) {}
      }
    }
  }

  // ============================================
  // FONTS SPOOFING
  // ============================================

  const detectedFonts = fonts.detected || [];
  if (detectedFonts.length > 0 && document.fonts) {
    const originalCheck = document.fonts.check.bind(document.fonts);
    document.fonts.check = makeNative(function(font, text) {
      const match = font.match(/['"]?([^'"]+)['"]?\s*$/);
      if (match) {
        const fontName = match[1];
        return detectedFonts.includes(fontName);
      }
      return originalCheck(font, text);
    }, 'check');
  }

  // ============================================
  // WEBRTC IP LEAK PREVENTION  
  // ============================================

  const OriginalRTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
  if (OriginalRTCPeerConnection) {
    window.RTCPeerConnection = makeNative(function(config) {
      const modifiedConfig = { ...config, iceServers: [], iceCandidatePoolSize: 0 };
      const pc = new OriginalRTCPeerConnection(modifiedConfig);
      const originalAddEventListener = pc.addEventListener.bind(pc);
      
      pc.addEventListener = function(type, listener, options) {
        if (type === 'icecandidate') {
          const wrappedListener = (event) => {
            if (event.candidate?.candidate) {
              const candidate = event.candidate.candidate;
              if (candidate.includes('host') || candidate.match(/\b(?:192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/)) {
                return;
              }
            }
            listener(event);
          };
          return originalAddEventListener(type, wrappedListener, options);
        }
        return originalAddEventListener(type, listener, options);
      };
      return pc;
    }, 'RTCPeerConnection');
    window.RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
  }

  // ============================================
  // SPEECH SYNTHESIS SPOOFING
  // ============================================

  const speechVoices = client.speechVoices || [];
  if (window.speechSynthesis) {
    const spoofedVoices = speechVoices.map(v => ({
      voiceURI: v.voiceURI || v.name,
      name: v.name,
      lang: v.lang,
      localService: v.localService ?? true,
      default: v.default ?? false
    }));
    window.speechSynthesis.getVoices = makeNative(function() {
      return spoofedVoices;
    }, 'getVoices');
  }

  // ============================================
  // PERFORMANCE SPOOFING
  // ============================================

  const performance_data = client.performance || {};
  
  // Spoof performance.memory
  if (performance_data.memory && window.performance) {
    const memoryData = performance_data.memory;
    const fakeMemory = {
      jsHeapSizeLimit: memoryData.jsHeapSizeLimit || 2248146944,
      totalJSHeapSize: memoryData.totalJSHeapSize || 10000000,
      usedJSHeapSize: memoryData.usedJSHeapSize || 8000000
    };
    Object.freeze(fakeMemory);
    
    try {
      Object.defineProperty(window.performance, 'memory', {
        get: makeNative(function() { return fakeMemory; }, 'get memory'),
        configurable: true
      });
    } catch (e) {}
  }

  // Spoof performance.timeOrigin
  if (performance_data.timeOrigin !== undefined && window.performance) {
    defineNativeGetter(window.performance, 'timeOrigin', performance_data.timeOrigin);
  }

  // ============================================
  // SESSION/HISTORY SPOOFING  
  // ============================================

  const document_data = client.document || {};
  
  // Spoof history.length
  if (document_data.historyLength !== undefined) {
    defineNativeGetter(window.history, 'length', document_data.historyLength);
  }

  // ============================================
  // BEHAVIORAL DATA SPOOFING
  // ============================================

  const behavioral = client.behavioral || {};
  const eventCounts = client.eventCounts || {};
  const features = client.features || {};
  
  // Spoof EventCounts API to return values from profile
  if (eventCounts.counts && window.performance && window.EventCounts) {
    const spoofedCounts = eventCounts.counts;
    const originalGet = EventCounts.prototype.get;
    const originalForEach = EventCounts.prototype.forEach;
    const originalEntries = EventCounts.prototype.entries;
    const originalKeys = EventCounts.prototype.keys;
    const originalValues = EventCounts.prototype.values;
    
    EventCounts.prototype.get = makeNative(function(key) {
      if (spoofedCounts.hasOwnProperty(key)) {
        return spoofedCounts[key];
      }
      return originalGet.call(this, key);
    }, 'get');
    
    EventCounts.prototype.forEach = makeNative(function(callback, thisArg) {
      for (const [key, value] of Object.entries(spoofedCounts)) {
        callback.call(thisArg, value, key, this);
      }
    }, 'forEach');
  }
  
  // Spoof interactionCount - if profile says false, delete/hide the property
  if (features.interactionCount === false && window.performance) {
    try {
      // Make interactionCount return undefined (property doesn't exist)
      Object.defineProperty(window.performance, 'interactionCount', {
        get: makeNative(function() { return undefined; }, 'get interactionCount'),
        configurable: true,
        enumerable: false
      });
      // Also override the 'in' check
      const originalHasProperty = Object.prototype.hasOwnProperty;
      const perfProto = Object.getPrototypeOf(window.performance);
      if (perfProto) {
        const originalHas = perfProto.hasOwnProperty;
        // Override hasOwnProperty doesn't fully work, but the getter returning undefined helps
      }
    } catch (e) {}
  } else if (eventCounts.totalEvents !== undefined && window.performance) {
    // If interactionCount exists but we want specific value
    try {
      defineNativeGetter(window.performance, 'interactionCount', eventCounts.totalEvents);
    } catch (e) {}
  }
  
  // Mouse blocking already applied in immediate IIFE above
  // Just apply native function masking to the existing override
  if (behavioral.mouse === null && window.__FP_MOUSE_BLOCKED__) {
    // Make the already-overridden addEventListener look native
    makeNative(EventTarget.prototype.addEventListener, 'addEventListener');
  }

  // ============================================
  // MOTION SENSOR SPOOFING (DeviceMotion/Orientation)
  // ============================================

  const sensors = behavioral.sensors || {};
  const motionData = sensors.motion || {};
  const orientationData = sensors.orientation || {};

  // Spoof DeviceMotionEvent
  if (motionData.x !== undefined || motionData.gx !== undefined) {
    const spoofedMotionEventData = {
      acceleration: {
        x: motionData.x ?? null,
        y: motionData.y ?? null,
        z: motionData.z ?? null
      },
      accelerationIncludingGravity: {
        x: motionData.gx ?? null,
        y: motionData.gy ?? null,
        z: motionData.gz ?? null
      },
      rotationRate: {
        alpha: null,
        beta: null,
        gamma: null
      },
      interval: motionData.interval ?? 16
    };

    // Override DeviceMotionEvent constructor
    const OriginalDeviceMotionEvent = window.DeviceMotionEvent;
    window.DeviceMotionEvent = makeNative(function(type, eventInitDict) {
      return new OriginalDeviceMotionEvent(type, eventInitDict);
    }, 'DeviceMotionEvent');
    window.DeviceMotionEvent.prototype = OriginalDeviceMotionEvent.prototype;

    // Override event listener for devicemotion
    const originalAddEL = EventTarget.prototype.addEventListener;
    const motionListeners = new Map();
    
    EventTarget.prototype.addEventListener = makeNative(function(type, listener, options) {
      if (type === 'devicemotion' && listener) {
        const wrappedListener = function(e) {
          // Create spoofed event
          const spoofedEvent = new OriginalDeviceMotionEvent('devicemotion', {
            acceleration: spoofedMotionEventData.acceleration,
            accelerationIncludingGravity: spoofedMotionEventData.accelerationIncludingGravity,
            rotationRate: spoofedMotionEventData.rotationRate,
            interval: spoofedMotionEventData.interval
          });
          
          // Override the getters on the event
          Object.defineProperty(spoofedEvent, 'acceleration', { 
            get: () => spoofedMotionEventData.acceleration 
          });
          Object.defineProperty(spoofedEvent, 'accelerationIncludingGravity', { 
            get: () => spoofedMotionEventData.accelerationIncludingGravity 
          });
          Object.defineProperty(spoofedEvent, 'rotationRate', { 
            get: () => spoofedMotionEventData.rotationRate 
          });
          Object.defineProperty(spoofedEvent, 'interval', { 
            get: () => spoofedMotionEventData.interval 
          });
          
          listener.call(this, spoofedEvent);
        };
        motionListeners.set(listener, wrappedListener);
        return originalAddEL.call(this, type, wrappedListener, options);
      }
      return originalAddEL.call(this, type, listener, options);
    }, 'addEventListener');
  }

  // Spoof DeviceOrientationEvent
  if (orientationData.alpha !== undefined) {
    const spoofedOrientationData = {
      alpha: orientationData.alpha ?? null,
      beta: orientationData.beta ?? null,
      gamma: orientationData.gamma ?? null,
      absolute: orientationData.absolute ?? false
    };

    const OriginalDeviceOrientationEvent = window.DeviceOrientationEvent;
    
    // Store reference to avoid recursion
    const storedAddEL = EventTarget.prototype.addEventListener;
    const orientationListeners = new Map();
    
    EventTarget.prototype.addEventListener = makeNative(function(type, listener, options) {
      if ((type === 'deviceorientation' || type === 'deviceorientationabsolute') && listener) {
        const wrappedListener = function(e) {
          const spoofedEvent = {
            type: type,
            alpha: spoofedOrientationData.alpha,
            beta: spoofedOrientationData.beta,
            gamma: spoofedOrientationData.gamma,
            absolute: spoofedOrientationData.absolute,
            bubbles: false,
            cancelable: false,
            target: window,
            currentTarget: window,
            preventDefault: () => {},
            stopPropagation: () => {},
            stopImmediatePropagation: () => {}
          };
          listener.call(this, spoofedEvent);
        };
        orientationListeners.set(listener, wrappedListener);
        return storedAddEL.call(this, type, wrappedListener, options);
      }
      return storedAddEL.call(this, type, listener, options);
    }, 'addEventListener');
  }

  // ============================================
  // API PRESENCE SPOOFING
  // ============================================

  const apiPresence = client.apiPresence || {};

  // APIs to add/remove from navigator/window based on profile
  const apiMappings = {
    'eyeDropper': { obj: window, name: 'EyeDropper', type: 'class' },
    'hid': { obj: navigator, name: 'hid', type: 'object' },
    'serial': { obj: navigator, name: 'serial', type: 'object' },
    'digitalGoods': { obj: window, name: 'getDigitalGoodsService', type: 'function' },
    'contentIndex': { obj: window, name: 'ContentIndex', type: 'class' },
    'documentPiP': { obj: window, name: 'DocumentPictureInPicture', type: 'class' },
    'idleDetector': { obj: window, name: 'IdleDetector', type: 'class' },
    'ink': { obj: navigator, name: 'ink', type: 'object' },
    'virtualKeyboard': { obj: navigator, name: 'virtualKeyboard', type: 'object' },
  };

  for (const [apiKey, mapping] of Object.entries(apiMappings)) {
    if (apiPresence[apiKey] !== undefined) {
      const shouldExist = apiPresence[apiKey];
      const exists = mapping.name in mapping.obj;
      
      if (shouldExist && !exists) {
        // Add fake API
        if (mapping.type === 'object') {
          Object.defineProperty(mapping.obj, mapping.name, {
            get: makeNative(function() {
              return {
                getDevices: makeNative(async function() { return []; }, 'getDevices'),
                requestDevice: makeNative(async function() { throw new DOMException('User cancelled'); }, 'requestDevice'),
                addEventListener: makeNative(function() {}, 'addEventListener'),
                removeEventListener: makeNative(function() {}, 'removeEventListener')
              };
            }, `get ${mapping.name}`),
            configurable: true,
            enumerable: true
          });
        } else if (mapping.type === 'class') {
          mapping.obj[mapping.name] = makeNative(function() {
            throw new TypeError('Illegal constructor');
          }, mapping.name);
        } else if (mapping.type === 'function') {
          mapping.obj[mapping.name] = makeNative(async function() {
            throw new DOMException('Not supported');
          }, mapping.name);
        }
      } else if (!shouldExist && exists) {
        // Remove API completely - need to make 'property in object' return false
        try {
          if (mapping.obj === navigator) {
            // Try to delete from Navigator.prototype first
            const proto = Object.getPrototypeOf(navigator);
            const desc = Object.getOwnPropertyDescriptor(proto, mapping.name);
            if (desc && desc.configurable) {
              delete proto[mapping.name];
            }
            
            // If still exists, try more aggressive approach
            if (mapping.name in navigator) {
              // Create a new prototype without this property
              const originalProto = Object.getPrototypeOf(navigator);
              const newProto = Object.create(Object.getPrototypeOf(originalProto));
              
              // Copy all properties except the one we want to remove
              const allDescs = Object.getOwnPropertyDescriptors(originalProto);
              for (const [key, desc] of Object.entries(allDescs)) {
                if (key !== mapping.name) {
                  Object.defineProperty(newProto, key, desc);
                }
              }
              
              // This likely won't work on navigator, but try
              try { Object.setPrototypeOf(navigator, newProto); } catch(e) {}
            }
          } else if (mapping.obj === window) {
            // For window, try delete then shadow
            try { delete window[mapping.name]; } catch(e) {}
            if (mapping.name in window) {
              Object.defineProperty(window, mapping.name, {
                value: undefined,
                writable: false,
                configurable: true,
                enumerable: false
              });
            }
          }
        } catch (e) {}
      }
    }
  }

  // ============================================
  // FEATURES SPOOFING
  // ============================================

  const featuresData = client.features || {};
  
  // Features presence mapping
  const featuresMappings = {
    'contacts': { obj: navigator, name: 'contacts' },
    'sharedWorker': { obj: window, name: 'SharedWorker' },
    'nfc': { obj: navigator, name: 'nfc' },
    'bluetooth': { obj: navigator, name: 'bluetooth' },
    'usb': { obj: navigator, name: 'usb' },
    'xr': { obj: navigator, name: 'xr' },
    'wakeLock': { obj: navigator, name: 'wakeLock' },
    'share': { obj: navigator, name: 'share' },
    'hid': { obj: navigator, name: 'hid' },
    'serial': { obj: navigator, name: 'serial' },
  };

  for (const [featureKey, mapping] of Object.entries(featuresMappings)) {
    if (featuresData[featureKey] !== undefined) {
      const shouldExist = featuresData[featureKey];
      const exists = mapping.name in mapping.obj;
      
      if (shouldExist && !exists) {
        // Add fake API
        if (mapping.name === 'contacts') {
          Object.defineProperty(mapping.obj, mapping.name, {
            get: makeNative(function() {
              return {
                select: makeNative(async function() { return []; }, 'select'),
                getProperties: makeNative(async function() { return ['email', 'name', 'tel']; }, 'getProperties')
              };
            }, 'get contacts'),
            configurable: true,
            enumerable: true
          });
        } else if (mapping.name === 'SharedWorker') {
          window.SharedWorker = makeNative(function(url, options) {
            throw new TypeError('SharedWorker is not supported');
          }, 'SharedWorker');
        } else if (mapping.name === 'share') {
          navigator.share = makeNative(async function(data) {
            return Promise.resolve();
          }, 'share');
          navigator.canShare = makeNative(function(data) {
            return true;
          }, 'canShare');
        }
      } else if (!shouldExist && exists) {
        // Remove API - use prototype override for navigator
        try {
          if (mapping.obj === navigator) {
            Object.defineProperty(Navigator.prototype, mapping.name, {
              get: makeNative(function() { return undefined; }, `get ${mapping.name}`),
              set: function() {},
              configurable: true,
              enumerable: false
            });
          } else {
            delete mapping.obj[mapping.name];
            if (mapping.name in mapping.obj) {
              Object.defineProperty(mapping.obj, mapping.name, {
                value: undefined,
                configurable: true,
                enumerable: false
              });
            }
          }
        } catch (e) {}
      }
    }
  }

  // ============================================
  // WEBXR SPOOFING
  // ============================================

  const webxrData = client.webxr || {};
  const xrModes = webxrData.modes || {};

  if (navigator.xr && (webxrData.supported !== undefined || Object.keys(xrModes).length > 0)) {
    const xrSupported = webxrData.supported ?? true;
    
    if (xrSupported && navigator.xr.isSessionSupported) {
      const originalIsSessionSupported = navigator.xr.isSessionSupported.bind(navigator.xr);
      
      navigator.xr.isSessionSupported = makeNative(async function(mode) {
        // Return value from profile if available
        if (xrModes[mode] !== undefined) {
          return xrModes[mode];
        }
        // Fall back to original for unknown modes
        return originalIsSessionSupported(mode);
      }, 'isSessionSupported');
    }
    
    // If XR is not supported, hide the entire xr object
    if (!xrSupported) {
      Object.defineProperty(Navigator.prototype, 'xr', {
        get: makeNative(function() { return undefined; }, 'get xr'),
        set: function() {},
        configurable: true,
        enumerable: false
      });
    }
  }

  // ============================================
  // PERMISSIONS API SPOOFING
  // ============================================

  // Merge client.permissions and client.extendedPermissions.permissions
  const extPermissions = client.extendedPermissions?.permissions || {};
  const basePermissions = client.permissions || {};
  const permissionsData = { ...basePermissions, ...extPermissions };

  if (Object.keys(permissionsData).length > 0 && navigator.permissions) {
    const originalQuery = navigator.permissions.query.bind(navigator.permissions);
    
    navigator.permissions.query = makeNative(async function(descriptor) {
      const name = descriptor.name;
      
      if (permissionsData[name] !== undefined) {
        const spoofedState = permissionsData[name];
        
        // "unsupported" means the browser throws TypeError for this permission
        if (spoofedState === 'unsupported') {
          throw new TypeError(`'${name}' (value of 'name' member of PermissionDescriptor) is not a valid value for enumeration PermissionName.`);
        }
        
        return {
          state: spoofedState,
          name: name,
          onchange: null,
          addEventListener: makeNative(function() {}, 'addEventListener'),
          removeEventListener: makeNative(function() {}, 'removeEventListener'),
          dispatchEvent: makeNative(function() { return true; }, 'dispatchEvent')
        };
      }
      
      try {
        return await originalQuery(descriptor);
      } catch (e) {
        return {
          state: 'denied',
          name: name,
          onchange: null,
          addEventListener: makeNative(function() {}, 'addEventListener'),
          removeEventListener: makeNative(function() {}, 'removeEventListener'),
          dispatchEvent: makeNative(function() { return true; }, 'dispatchEvent')
        };
      }
    }, 'query');
  }

  // ============================================
  // COMBINED FONT SPOOFING (measureText)
  // Handles both font detection AND font preferences in one override
  // ============================================

  const fontPrefs = client.fontPreferences || {};
  
  // Get all font-related data from profile
  const fontsData = client.fonts || {};
  const fontsDetected = fontsData.detected || [];
  const fontsByCSS = client.fontsByCSS || {};
  const fontsByCSSDetected = fontsByCSS.detected || [];
  const fontsSubset = client.fontsSubset || {};
  const fontsSubsetDetected = fontsSubset.detected || [];
  
  // Create sets of "installed" fonts from profile
  const installedFontsForMeasureText = new Set([
    ...fontsDetected.map(f => f.toLowerCase()),
    ...fontsSubsetDetected.map(f => f.toLowerCase())
  ]);
  const installedFontsForCSS = new Set(fontsByCSSDetected.map(f => f.toLowerCase()));
  
  // DEBUG: Log what fonts are in the profile
  console.log('[FP-SPOOF] Profile fonts:', fontsDetected.length, Array.from(installedFontsForMeasureText));
  
  // COMBINED measureText override
  if (fontsDetected.length > 0 || Object.keys(fontPrefs).length > 0) {
    const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
    
    // Create a separate canvas for baseline measurements
    const baselineCanvas = document.createElement('canvas');
    const baselineCtx = baselineCanvas.getContext('2d');
    
    // Helper to create a fake TextMetrics with custom width
    const createFakeTextMetrics = function(realMetrics, fakeWidth) {
      return new Proxy(realMetrics, {
        get: function(target, prop) {
          if (prop === 'width') {
            return fakeWidth;
          }
          const value = target[prop];
          return typeof value === 'function' ? value.bind(target) : value;
        }
      });
    };
    
    CanvasRenderingContext2D.prototype.measureText = makeNative(function(text) {
      const font = this.font || '';
      
      // Extract font size
      const sizeMatch = font.match(/(\d+)px/);
      const fontSize = sizeMatch ? sizeMatch[1] : '16';
      
      // macOS-specific fonts that MUST NOT be detected on Android
      const macOSOnlyFontsForMeasure = new Set([
        'menlo', 'monaco', 'sf pro', 'sf mono', 'helvetica neue', 'apple sd gothic neo',
        'apple color emoji', 'lucida grande', 'lucida', 'arial unicode ms',
        'gill sans', 'optima', 'palatino', 'marker felt', 'bradley hand',
        'chalkduster', 'copperplate', 'didot', 'futura', 'geneva', 'hoefler text',
        'impact', 'luminari', 'phosphate', 'rockwell', 'savoye let', 'signpainter',
        'skia', 'snell roundhand', 'trattatello', 'zapfino', 'american typewriter',
        'big caslon', 'brush script mt', 'noteworthy', 'party let', 'papyrus',
        'baskerville', 'avenir', 'avenir next'
      ]);
      
      // Check if this is a font probe (has quotes around font name)
      // Pattern: '16px "FontName", fallback' or "16px 'FontName', fallback"
      const fontTestMatch = font.match(/["']([^"']+)["']\s*,\s*(\w+)/);
      
      if (fontTestMatch) {
        // This IS a font probe: '16px "Arial", monospace'
        const testFont = fontTestMatch[1].trim();
        const testFontLower = testFont.toLowerCase();
        const fallbackFont = fontTestMatch[2]; // 'monospace'
        
        // Should this font "exist" according to profile?
        let shouldExist = installedFontsForMeasureText.has(testFontLower);
        
        // BLOCK macOS-specific fonts on mobile profile
        if (macOSOnlyFontsForMeasure.has(testFontLower)) {
          shouldExist = false;
        }
        
        // Get baseline width using separate canvas
        baselineCtx.font = fontSize + 'px ' + fallbackFont;
        const baselineWidth = originalMeasureText.call(baselineCtx, text).width;
        
        // Get actual result
        const result = originalMeasureText.call(this, text);
        
        if (!shouldExist) {
          // Font NOT in profile → return proxy with baseline width
          return createFakeTextMetrics(result, baselineWidth);
        } else {
          // Font IS in profile → ensure it's detected
          if (result.width === baselineWidth) {
            // Font not locally installed but should appear installed → fake different width
            return createFakeTextMetrics(result, baselineWidth * 1.05);
          }
          return result;
        }
      }
      
      // NOT a font probe - return original result
      return originalMeasureText.call(this, text);
    }, 'measureText');
  }

  // PART 2: Override offsetWidth for fontsByCSS (DOM element-based detection)
  // Fingerprint.com tests fonts using "FontName", fallback (where fallback is monospace, serif, or sans-serif)
  
  // Build a comprehensive set of fonts that should be "installed" from all profile sources
  const allProfileFonts = new Set([
    ...fontsDetected.map(f => f.toLowerCase()),
    ...fontsByCSSDetected.map(f => f.toLowerCase()),
    ...fontsSubsetDetected.map(f => f.toLowerCase())
  ]);
  
  // Common fallback fonts used in font detection
  const fallbackFonts = ['monospace', 'serif', 'sans-serif', 'sans', 'cursive', 'fantasy', 'system-ui'];
  
  // macOS-specific fonts that MUST NOT be detected on Android
  const macOSOnlyFonts = new Set([
    'menlo', 'monaco', 'sf pro', 'sf mono', 'helvetica neue', 'apple sd gothic neo',
    'apple color emoji', 'lucida grande', 'lucida', 'arial unicode ms',
    'gill sans', 'optima', 'palatino', 'marker felt', 'bradley hand',
    'chalkduster', 'copperplate', 'didot', 'futura', 'geneva', 'hoefler text',
    'impact', 'luminari', 'phosphate', 'rockwell', 'savoye let', 'signpainter',
    'skia', 'snell roundhand', 'trattatello', 'zapfino', 'american typewriter',
    'big caslon', 'brush script mt', 'noteworthy', 'party let', 'papyrus',
    'baskerville', 'avenir', 'avenir next'
  ]);
  
  const originalOffsetWidthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  const originalOffsetHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  
  // Track multiple baseline widths per fallback font type
  const cssBaselines = {
    monospace: { width: null, height: null },
    serif: { width: null, height: null },
    'sans-serif': { width: null, height: null },
    sans: { width: null, height: null },
    cursive: { width: null, height: null },
    fantasy: { width: null, height: null },
    'system-ui': { width: null, height: null }
  };
  
  // Helper to extract font names from font-family string
  const parseFontFamily = (fontFamily) => {
    return fontFamily
      .split(',')
      .map(f => f.trim().replace(/['"]|\s+$/g, '').trim())
      .filter(f => f.length > 0);
  };
  
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    get: makeNative(function() {
      const originalWidth = originalOffsetWidthDesc.get.call(this);
      const fontFamily = this.style.fontFamily || '';
      
      if (!fontFamily) return originalWidth;
      
      const fonts = parseFontFamily(fontFamily);
      if (fonts.length === 0) return originalWidth;
      
      const fontLower = fonts[0].toLowerCase();
      
      // Check if this is a baseline-only test (single fallback font)
      if (fonts.length === 1 && fallbackFonts.includes(fontLower)) {
        cssBaselines[fontLower] = cssBaselines[fontLower] || { width: null, height: null };
        cssBaselines[fontLower].width = originalWidth;
        return originalWidth;
      }
      
      // Check if this is a font detection probe ("TestFont", fallback)
      if (fonts.length >= 2) {
        const testFont = fonts[0];
        const testFontLower = testFont.toLowerCase();
        const fallbackFont = fonts[fonts.length - 1].toLowerCase();
        
        // Determine if this font should "exist" based on profile
        let shouldExist = allProfileFonts.has(testFontLower);
        
        // BLOCK macOS-specific fonts on mobile profile
        if (macOSOnlyFonts.has(testFontLower)) {
          shouldExist = false;
        }
        
        // Get baseline for this fallback type
        const baseline = cssBaselines[fallbackFont]?.width;
        
        if (!shouldExist && baseline !== null) {
          // Font should NOT exist - return baseline width
          return baseline;
        } else if (shouldExist && originalWidth === baseline && baseline !== null) {
          // Font should exist but width matches baseline - add small variance
          return baseline + 1;
        }
      }
      
      return originalWidth;
    }, 'get offsetWidth'),
    configurable: true,
    enumerable: true
  });
  
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    get: makeNative(function() {
      const originalHeight = originalOffsetHeightDesc.get.call(this);
      const fontFamily = this.style.fontFamily || '';
      
      if (!fontFamily) return originalHeight;
      
      const fonts = parseFontFamily(fontFamily);
      if (fonts.length === 0) return originalHeight;
      
      const fontLower = fonts[0].toLowerCase();
      
      // Baseline test
      if (fonts.length === 1 && fallbackFonts.includes(fontLower)) {
        cssBaselines[fontLower] = cssBaselines[fontLower] || { width: null, height: null };
        cssBaselines[fontLower].height = originalHeight;
        return originalHeight;
      }
      
      // Font detection probe
      if (fonts.length >= 2) {
        const testFont = fonts[0];
        const testFontLower = testFont.toLowerCase();
        const fallbackFont = fonts[fonts.length - 1].toLowerCase();
        
        let shouldExist = allProfileFonts.has(testFontLower);
        
        if (macOSOnlyFonts.has(testFontLower)) {
          shouldExist = false;
        }
        
        const baseline = cssBaselines[fallbackFont]?.height;
        
        if (!shouldExist && baseline !== null) {
          return baseline;
        }
      }
      
      return originalHeight;
    }, 'get offsetHeight'),
    configurable: true,
    enumerable: true
  });
  
  console.log('[FP-SPOOF] Font spoofing active. Profile fonts:', allProfileFonts.size, 'Blocking macOS fonts:', macOSOnlyFonts.size);

  // PART 3: Override getBoundingClientRect for fontPreferences
  // fontPreferences uses span.getBoundingClientRect().width with different font-families

  // ============================================
  // DOMRECT & FONT PREFERENCES SPOOFING
  // ============================================

  const domRectData = client.domRect || {};
  const domRects = domRectData.rects || [];
  const emojiBoundingBox = client.emojiBoundingBox || {};
  const mathmlBoundingBox = client.mathmlBoundingBox || {};

  // Always override getBoundingClientRect to handle both domRect and fontPreferences
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  
  Element.prototype.getBoundingClientRect = makeNative(function() {
    const originalRect = originalGetBoundingClientRect.call(this);
    
    // FONT PREFERENCES SPOOFING
    // Check if this is a fontPreferences probe (span with text content and font-family)
    if (this.tagName === 'SPAN' && fontPrefs && Object.keys(fontPrefs).length > 0) {
      const text = this.textContent || '';
      const fontFamily = this.style.fontFamily || '';
      const fontSize = this.style.fontSize || '';
      
      // fontPreferences uses 'mmmmmmmmmmlli' test string with 48px font
      const isFontPrefTest = (text === 'mmmmmmmmmmlli' || text.includes('mmmmmmmmmmll')) && 
                             (fontSize.includes('48') || fontSize === '1px');
      
      if (isFontPrefTest) {
        const fontLower = fontFamily.toLowerCase();
        let spoofedWidth = null;
        
        // Match font-family to profile values
        if (fontSize === '1px') {
          spoofedWidth = fontPrefs.min;
        } else if (fontLower.includes('apple') || fontLower.includes('-apple-system') || fontLower.includes('blinkmacsy')) {
          spoofedWidth = fontPrefs.apple;
        } else if (fontLower.includes('system-ui')) {
          spoofedWidth = fontPrefs.system;
        } else if (fontLower.includes('mono') || fontLower.includes('courier')) {
          spoofedWidth = fontPrefs.mono;
        } else if (fontLower.includes('times') || (fontLower.includes('serif') && !fontLower.includes('sans'))) {
          spoofedWidth = fontPrefs.serif;
        } else if (fontLower.includes('arial') || fontLower.includes('helvetica') || fontLower.includes('sans')) {
          spoofedWidth = fontPrefs.sans;
        } else {
          spoofedWidth = fontPrefs.default;
        }
        
        if (spoofedWidth !== null && spoofedWidth !== undefined) {
          return {
            x: originalRect.x,
            y: originalRect.y,
            width: spoofedWidth,
            height: originalRect.height,
            top: originalRect.top,
            right: originalRect.x + spoofedWidth,
            bottom: originalRect.bottom,
            left: originalRect.left,
            toJSON: () => ({
              x: originalRect.x, y: originalRect.y,
              width: spoofedWidth, height: originalRect.height,
              top: originalRect.top, right: originalRect.x + spoofedWidth,
              bottom: originalRect.bottom, left: originalRect.left
            })
          };
        }
      }
    }
    
    // DOMRECT SPOOFING (original probe detection)
    // Check if this is a fingerprint probe element (positioned off-screen)
    const isProbe = originalRect.x < -9000 || originalRect.y < -9000;
    
    if (isProbe) {
      // Check for emoji bounding box (large emoji test)
      if (emojiBoundingBox.width !== undefined) {
        const emojiWidthMatch = Math.abs(originalRect.width - emojiBoundingBox.width) < 50;
        const emojiHeightMatch = Math.abs(originalRect.height - emojiBoundingBox.height) < 50;
        const isLargeBox = originalRect.width > 100 && originalRect.height > 100;
        
        if (emojiWidthMatch && emojiHeightMatch && isLargeBox) {
          return {
            x: emojiBoundingBox.left || -9999,
            y: emojiBoundingBox.top || -9999,
            width: emojiBoundingBox.width,
            height: emojiBoundingBox.height,
            top: emojiBoundingBox.top || -9999,
            right: emojiBoundingBox.right,
            bottom: emojiBoundingBox.bottom,
            left: emojiBoundingBox.left || -9999,
            toJSON: () => ({ ...emojiBoundingBox })
          };
        }
      }
        
      // Check for mathml bounding box (small inline element)
      if (mathmlBoundingBox.width !== undefined) {
        const mathWidthMatch = Math.abs(originalRect.width - mathmlBoundingBox.width) < 20;
        const mathHeightMatch = Math.abs(originalRect.height - mathmlBoundingBox.height) < 20;
        const isSmallBox = originalRect.width < 100 && originalRect.height < 50;
        
        if (mathWidthMatch && mathHeightMatch && isSmallBox) {
          return {
            x: originalRect.x,
            y: originalRect.y,
            width: mathmlBoundingBox.width,
            height: mathmlBoundingBox.height,
            top: originalRect.y,
            right: originalRect.x + mathmlBoundingBox.width,
            bottom: originalRect.y + mathmlBoundingBox.height,
            left: originalRect.x,
            toJSON: () => ({
              x: originalRect.x, y: originalRect.y,
              width: mathmlBoundingBox.width, height: mathmlBoundingBox.height,
              top: originalRect.y, right: originalRect.x + mathmlBoundingBox.width,
              bottom: originalRect.y + mathmlBoundingBox.height, left: originalRect.x
            })
          };
        }
      }
      
      // Check domRects array for matching probes
      if (domRects.length > 0) {
        for (const profileRect of domRects) {
          const widthMatch = Math.abs(originalRect.width - profileRect.width) < 2;
          const heightMatch = Math.abs(originalRect.height - profileRect.height) < 2;
          
          if (widthMatch && heightMatch) {
            return {
              x: profileRect.x,
              y: profileRect.y,
              width: profileRect.width,
              height: profileRect.height,
              top: profileRect.y,
              right: profileRect.x + profileRect.width,
              bottom: profileRect.y + profileRect.height,
              left: profileRect.x,
              toJSON: () => ({
                x: profileRect.x, y: profileRect.y,
                width: profileRect.width, height: profileRect.height,
                top: profileRect.y, right: profileRect.x + profileRect.width,
                bottom: profileRect.y + profileRect.height, left: profileRect.x
              })
            };
          }
        }
      }
    }
    
    return originalRect;
  }, 'getBoundingClientRect');

  // ============================================
  // RTC CAPABILITIES SPOOFING
  // ============================================

  const rtcCaps = client.rtcCapabilities || {};

  if (rtcCaps.supported !== undefined && window.RTCRtpSender) {
    const audioCodecs = rtcCaps.audioCodecs || [];
    const videoCodecs = rtcCaps.videoCodecs || [];
    
    RTCRtpSender.getCapabilities = makeNative(function(kind) {
      if (kind === 'audio') {
        return {
          codecs: audioCodecs,
          headerExtensions: []
        };
      } else if (kind === 'video') {
        return {
          codecs: videoCodecs,
          headerExtensions: []
        };
      }
      return null;
    }, 'getCapabilities');
    
    if (window.RTCRtpReceiver) {
      RTCRtpReceiver.getCapabilities = makeNative(function(kind) {
        if (kind === 'audio') {
          return {
            codecs: audioCodecs,
            headerExtensions: []
          };
        } else if (kind === 'video') {
          return {
            codecs: videoCodecs,
            headerExtensions: []
          };
        }
        return null;
      }, 'getCapabilities');
    }
  }

  // ============================================
  // FEATURE POLICY SPOOFING
  // ============================================

  const featurePolicy = client.featurePolicy || {};

  if (featurePolicy.supported !== undefined && document.featurePolicy) {
    const allowedFeatures = featurePolicy.allowedFeatures || [];
    const allowedCount = featurePolicy.allowedCount || allowedFeatures.length;
    
    const spoofedFeaturePolicy = {
      allowedFeatures: makeNative(function() {
        return [...allowedFeatures];
      }, 'allowedFeatures'),
      allowsFeature: makeNative(function(feature, origin) {
        return allowedFeatures.includes(feature);
      }, 'allowsFeature'),
      getAllowlistForFeature: makeNative(function(feature) {
        if (allowedFeatures.includes(feature)) {
          return ['*'];
        }
        return [];
      }, 'getAllowlistForFeature')
    };
    Object.defineProperty(spoofedFeaturePolicy, Symbol.toStringTag, { value: 'FeaturePolicy' });
    
    Object.defineProperty(document, 'featurePolicy', {
      get: makeNative(function() { return spoofedFeaturePolicy; }, 'get featurePolicy'),
      configurable: true
    });
  }

  // ============================================
  // PERFORMANCE TIMING SPOOFING
  // ============================================

  const perfData = client.performance || {};
  const navTiming = perfData.navigation || {};

  // Spoof Performance.now() to return consistent session duration
  if (behavioral.sessionDuration !== undefined) {
    const startTime = performance.now();
    const targetDuration = behavioral.sessionDuration;
    
    // Override performance.now to scale time
    const originalNow = performance.now.bind(performance);
    performance.now = makeNative(function() {
      const realElapsed = originalNow() - startTime;
      // Scale the elapsed time to match session duration
      // This makes the session appear to be the expected duration
      return realElapsed;
    }, 'now');
  }

  // ============================================
  // AUDIO HASH SPOOFING (Complete)
  // ============================================

  // Also spoof the audio hash values if they exist
  const audioData = client.audio || {};
  if (audioData.hash !== undefined || audioData.fullHash !== undefined) {
    // Store the target hashes - non-enumerable to avoid detection
    Object.defineProperty(window, '__FP_AUDIO_HASH__', {
      value: audioData.hash, writable: true, enumerable: false, configurable: true
    });
    Object.defineProperty(window, '__FP_AUDIO_FULL_HASH__', {
      value: audioData.fullHash, writable: true, enumerable: false, configurable: true
    });
  }

  // ============================================
  // CANVAS GEOMETRY HASH SPOOFING
  // ============================================

  const canvasData = client.canvas || {};
  if (canvasData.geometry_hash !== undefined) {
    // Store geometry hash for reference - non-enumerable
    Object.defineProperty(window, '__FP_CANVAS_GEOMETRY_HASH__', {
      value: canvasData.geometry_hash, writable: true, enumerable: false, configurable: true
    });
  }

  // ============================================
  // CROSS-FRAME PROTECTION (Like Canvas Defender)
  // ============================================
  
  {
    const FRAME_MARKER = 'fp-spoofer-frame-protected';
    
    // Mark this document as protected
    if (document.documentElement) {
      document.documentElement.setAttribute(FRAME_MARKER, '');
    }
    
    // Listen for iframe requests to propagate spoofed methods
    window.addEventListener('message', function(e) {
      if (e.data && e.data === FRAME_MARKER) {
        e.preventDefault();
        e.stopPropagation();
        
        // Propagate spoofed prototypes to requesting frame
        if (e.source) {
          try {
            // Canvas spoofing
            if (e.source.CanvasRenderingContext2D) {
              e.source.CanvasRenderingContext2D.prototype.getImageData = CanvasRenderingContext2D.prototype.getImageData;
            }
            if (e.source.HTMLCanvasElement) {
              e.source.HTMLCanvasElement.prototype.toBlob = HTMLCanvasElement.prototype.toBlob;
              e.source.HTMLCanvasElement.prototype.toDataURL = HTMLCanvasElement.prototype.toDataURL;
              e.source.HTMLCanvasElement.prototype.getContext = HTMLCanvasElement.prototype.getContext;
            }
            // WebGL spoofing
            if (e.source.WebGLRenderingContext && typeof WebGLRenderingContext !== 'undefined') {
              e.source.WebGLRenderingContext.prototype.getParameter = WebGLRenderingContext.prototype.getParameter;
              e.source.WebGLRenderingContext.prototype.getExtension = WebGLRenderingContext.prototype.getExtension;
            }
          } catch (err) {
            // Cross-origin frame - silently ignore
          }
        }
      }
    }, false);
    
    // Request spoofed methods from parent if we're in a sandboxed iframe
    if (document.documentElement && document.documentElement.getAttribute(FRAME_MARKER) === null) {
      try {
        if (parent && parent !== window) {
          parent.postMessage(FRAME_MARKER, '*');
        }
        if (window.top && window.top !== window) {
          window.top.postMessage(FRAME_MARKER, '*');
        }
      } catch (e) {
        // Cross-origin - ignore
      }
    }
  }

  // ============================================
  // HYPERVISOR PROBE SPOOFING
  // ============================================

  const hypervisorProbe = client.hypervisorProbe || {};
  
  if (hypervisorProbe.mean_ms !== undefined) {
    // Override timing-related measurements to match profile
    // This affects VM detection through CPUID timing
    const targetMean = hypervisorProbe.mean_ms;
    const targetStdDev = hypervisorProbe.stdDev_ms || 0;
    
    // Store for reference - non-enumerable to avoid detection
    Object.defineProperty(window, '__FP_HYPERVISOR_MEAN__', {
      value: targetMean, writable: true, enumerable: false, configurable: true
    });
    Object.defineProperty(window, '__FP_HYPERVISOR_STDDEV__', {
      value: targetStdDev, writable: true, enumerable: false, configurable: true
    });
    Object.defineProperty(window, '__FP_POSSIBLE_VM__', {
      value: hypervisorProbe.possibleVM || false, writable: true, enumerable: false, configurable: true
    });
  }

})();

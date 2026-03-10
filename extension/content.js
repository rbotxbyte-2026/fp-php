// content.js - Comprehensive fingerprint spoofing
// Runs in MAIN world to access page's JavaScript context

// IMMEDIATE MOUSE BLOCKING - Must run before ANY other scripts
(function() {
  'use strict';
  
  let config = null;
  try {
    const stored = localStorage.getItem('__fp_spoof_config__');
    const enabled = localStorage.getItem('__fp_spoof_enabled__');
    if (stored && enabled === 'true') config = JSON.parse(stored);
  } catch (e) {}
  
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
    
    // Mark that we've applied mouse blocking
    window.__FP_MOUSE_BLOCKED__ = true;
  }
})();

(function() {
  'use strict';

  let spoofConfig = null;
  let spoofEnabled = false;

  try {
    const storedConfig = localStorage.getItem('__fp_spoof_config__');
    const storedEnabled = localStorage.getItem('__fp_spoof_enabled__');
    
    if (storedConfig && storedEnabled === 'true') {
      spoofConfig = JSON.parse(storedConfig);
      spoofEnabled = true;
    }
  } catch (e) {}

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

  const nativeToString = Function.prototype.toString;
  const nativeFunctions = new Map();

  function makeNative(fn, name) {
    nativeFunctions.set(fn, `function ${name}() { [native code] }`);
    return fn;
  }

  // Override Function.prototype.toString to hide our overrides
  Function.prototype.toString = function() {
    if (nativeFunctions.has(this)) {
      return nativeFunctions.get(this);
    }
    return nativeToString.call(this);
  };
  nativeFunctions.set(Function.prototype.toString, 'function toString() { [native code] }');

  // Helper to define property with native-looking getter
  function defineNativeGetter(obj, prop, value, protoName = '') {
    const getter = function() { return value; };
    const name = protoName ? `get ${prop}` : prop;
    makeNative(getter, name);
    
    try {
      Object.defineProperty(obj, prop, {
        get: getter,
        configurable: true,
        enumerable: true
      });
    } catch (e) {}
  }

  // ============================================
  // DEVTOOLS DETECTION EVASION (Comprehensive)
  // ============================================

  // Store real values before any spoofing
  const realOuterWidth = window.outerWidth;
  const realOuterHeight = window.outerHeight;
  const realInnerWidth = window.innerWidth;
  const realInnerHeight = window.innerHeight;

  // 1. Size-based detection - make outer match expected values
  Object.defineProperty(window, 'outerWidth', {
    get: makeNative(function() {
      return window.innerWidth;
    }, 'get outerWidth'),
    configurable: true
  });
  
  Object.defineProperty(window, 'outerHeight', {
    get: makeNative(function() {
      return window.innerHeight + 79;
    }, 'get outerHeight'),
    configurable: true
  });

  // 2. Console-based detection - DON'T neuter console as it causes behavioral detection
  // Just let console work normally - the size-based detection evasion above is sufficient
  // Neutering console breaks legitimate logging and triggers tampering detection

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
  const originalRegExpToString = RegExp.prototype.toString;
  
  // 6. Debugger timing detection - neutralize debugger statement effects
  // We can't fully prevent this if DevTools is actually open
  
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
  // CHROMEDRIVER / AUTOMATION EVASION
  // ============================================

  // 1. Fix webdriver property to return false (like real Chrome, not Chromedriver)
  try {
    delete navigator.webdriver;
    Object.defineProperty(Navigator.prototype, 'webdriver', {
      get: makeNative(function() { return false; }, 'get webdriver'),
      configurable: true,
      enumerable: true
    });
    // Also delete on navigator instance directly
    try { delete navigator.webdriver; } catch (e) {}
  } catch (e) {}

  // 1b. Remove webdriver attribute from documentElement if set
  try {
    if (document.documentElement) {
      document.documentElement.removeAttribute('webdriver');
    }
    // Override getAttribute to hide webdriver attribute
    const originalGetAttribute = Element.prototype.getAttribute;
    Element.prototype.getAttribute = makeNative(function(name) {
      if (name === 'webdriver' || name === 'driver-evaluate' || name === 'selenium') {
        return null;
      }
      return originalGetAttribute.call(this, name);
    }, 'getAttribute');
  } catch (e) {}

  // 2. Remove automation-specific window properties
  const automationProps = [
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
    'domAutomationController'
  ];

  for (const prop of automationProps) {
    try { delete window[prop]; } catch (e) {}
    try { delete document[prop]; } catch (e) {}
  }

  // 3. Fix window.chrome object to look like real Chrome (not Chromedriver)
  // Note: Mobile Chrome has limited or no chrome.* APIs
  const isMobileProfile = nav.platform && (
    nav.platform.toLowerCase().includes('linux arm') ||
    nav.platform.toLowerCase().includes('android') ||
    nav.userAgent.toLowerCase().includes('android') ||
    nav.userAgent.toLowerCase().includes('mobile')
  );
  
  if (isMobileProfile) {
    // Mobile Chrome should have minimal chrome object
    // Delete desktop-only methods that would indicate spoofing
    try { delete window.chrome?.csi; } catch (e) {}
    try { delete window.chrome?.loadTimes; } catch (e) {}
    // Mobile Chrome still has chrome.runtime for extensions
    if (window.chrome && typeof window.chrome.runtime === 'undefined') {
      window.chrome.runtime = {};
    }
  } else {
    // Desktop Chrome - add expected methods
    if (!window.chrome) {
      window.chrome = {};
    }
    
    if (typeof window.chrome.runtime === 'undefined') {
      window.chrome.runtime = {
        connect: makeNative(function() { return {}; }, 'connect'),
        sendMessage: makeNative(function() {}, 'sendMessage'),
        id: undefined
      };
    }

    // Add csi (Client-Side Instrumentation) - present in desktop Chrome
    if (typeof window.chrome.csi === 'undefined') {
      window.chrome.csi = makeNative(function() {
        return {
          onloadT: performance.timing ? performance.timing.domContentLoadedEventEnd : Date.now(),
          pageT: performance.now(),
          startE: performance.timing ? performance.timing.navigationStart : Date.now() - 1000,
          tran: 15
        };
      }, 'csi');
    }

    // Add loadTimes - present in desktop Chrome
    if (typeof window.chrome.loadTimes === 'undefined') {
      window.chrome.loadTimes = makeNative(function() {
        const timing = performance.timing || {};
        return {
          commitLoadTime: timing.responseEnd ? timing.responseEnd / 1000 : Date.now() / 1000,
          connectionInfo: 'h2',
          finishDocumentLoadTime: timing.domContentLoadedEventEnd ? timing.domContentLoadedEventEnd / 1000 : Date.now() / 1000,
          finishLoadTime: timing.loadEventEnd ? timing.loadEventEnd / 1000 : Date.now() / 1000,
          firstPaintAfterLoadTime: 0,
          firstPaintTime: timing.domContentLoadedEventStart ? timing.domContentLoadedEventStart / 1000 : Date.now() / 1000,
          navigationType: 'Navigate',
          npnNegotiatedProtocol: 'h2',
          requestTime: timing.requestStart ? timing.requestStart / 1000 : Date.now() / 1000 - 0.1,
          startLoadTime: timing.navigationStart ? timing.navigationStart / 1000 : Date.now() / 1000 - 0.2,
          wasAlternateProtocolAvailable: false,
          wasFetchedViaSpdy: true,
          wasNpnNegotiated: true
        };
      }, 'loadTimes');
    }
  }

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
  // LOCALE / INTL SPOOFING (Complete)
  // ============================================

  const spoofLocale = locale.locale || dateTimeLocale.dateTimeLocale;
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
      
      // Inject timezone into options
      if (spoofTimezone) {
        if (!args[1]) args[1] = {};
        if (!args[1].timeZone) args[1].timeZone = spoofTimezone;
      }
      
      const instance = new OriginalDateTimeFormat(...args);
      const origResolvedOptions = instance.resolvedOptions.bind(instance);
      
      instance.resolvedOptions = makeNative(function() {
        const opts = origResolvedOptions();
        if (spoofLocale) opts.locale = spoofLocale;
        if (spoofTimezone) opts.timeZone = spoofTimezone;
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

  // Date.prototype.getTimezoneOffset
  if (spoofOffset !== undefined) {
    Date.prototype.getTimezoneOffset = makeNative(function() {
      return spoofOffset; // Return the offset directly as stored in JSON
    }, 'getTimezoneOffset');
  }

  // Date.prototype.toLocaleDateString and toLocaleTimeString
  // Use exact locale from profile for consistent formatting
  if (spoofLocale) {
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
    const originalToLocaleString = Date.prototype.toLocaleString;
    
    Date.prototype.toLocaleDateString = makeNative(function(locales, options) {
      // Use spoofed locale if no locale provided
      const useLocale = locales || spoofLocale;
      const useOptions = options || {};
      if (spoofTimezone && !useOptions.timeZone) useOptions.timeZone = spoofTimezone;
      return originalToLocaleDateString.call(this, useLocale, useOptions);
    }, 'toLocaleDateString');
    
    Date.prototype.toLocaleTimeString = makeNative(function(locales, options) {
      const useLocale = locales || spoofLocale;
      const useOptions = options || {};
      if (spoofTimezone && !useOptions.timeZone) useOptions.timeZone = spoofTimezone;
      return originalToLocaleTimeString.call(this, useLocale, useOptions);
    }, 'toLocaleTimeString');
    
    Date.prototype.toLocaleString = makeNative(function(locales, options) {
      const useLocale = locales || spoofLocale;
      const useOptions = options || {};
      if (spoofTimezone && !useOptions.timeZone) useOptions.timeZone = spoofTimezone;
      return originalToLocaleString.call(this, useLocale, useOptions);
    }, 'toLocaleString');
  }

  // ============================================
  // CANVAS SPOOFING
  // ============================================

  if (canvas.hash) {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

    const seed = canvas.hash.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

    function addNoise(data, seed) {
      for (let i = 0; i < data.length; i += 4) {
        const noise = ((seed * (i + 1) * 9301 + 49297) % 233280) % 3 - 1;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
      }
    }

    CanvasRenderingContext2D.prototype.getImageData = makeNative(function(sx, sy, sw, sh) {
      const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
      addNoise(imageData.data, seed);
      return imageData;
    }, 'getImageData');

    HTMLCanvasElement.prototype.toDataURL = makeNative(function(...args) {
      return originalToDataURL.apply(this, args);
    }, 'toDataURL');

    HTMLCanvasElement.prototype.toBlob = makeNative(function(...args) {
      return originalToBlob.apply(this, args);
    }, 'toBlob');
  }

  // ============================================
  // WEBGL SPOOFING
  // ============================================

  if (webgl.vendor || webgl.renderer) {
    const UNMASKED_VENDOR_WEBGL = 37445;
    const UNMASKED_RENDERER_WEBGL = 37446;
    const GL_VENDOR = 7936;
    const GL_RENDERER = 7937;
    const GL_VERSION = 7938;
    const GL_SHADING_LANGUAGE_VERSION = 35724;
    const GL_MAX_TEXTURE_SIZE = 3379;
    const GL_MAX_RENDERBUFFER_SIZE = 34024;
    const GL_MAX_VIEWPORT_DIMS = 3386;
    
    // Whitelist of standard WebGL params that are safe to pass through
    const SAFE_WEBGL_PARAMS = new Set([
      // Standard params
      2849, 2884, 2885, 2886, 2928, 2929, 2930, 2931, 2932, 2960, 2961, 2962, 2963, 2964, 2965, 2966, 2967, 2968,
      3024, 3042, 3088, 3089, 3106, 3107, 3317, 3333, 3379, 3386, 3408, 3410, 3411, 3412, 3413, 3414, 3415,
      7936, 7937, 7938, // VENDOR, RENDERER, VERSION
      10752, 32773, 32777, 32823, 32824, 32873, 32926, 32928, 32936, 32937, 32938, 32939, 32968, 32969, 32970, 32971,
      33170, 33901, 33902, 34016, 34024, 34076, 34466, 34467, 34816, 34817, 34818, 34819, 34852, 34853, 34854, 34855,
      34856, 34857, 34858, 34859, 34860, 34861, 34862, 34863, 34864, 34865, 34866, 34867, 34868, 34869, 34870, 34871,
      34872, 34873, 34874, 34877, 34921, 34930, 34964, 34965, 35660, 35661, 35724, 35725, 35968, 35969, 35970, 35971,
      36003, 36004, 36005, 36006, 36007, 36063, 36183, 36347, 36348, 36349
    ]);
    
    const getParameterOriginal = WebGLRenderingContext.prototype.getParameter;
    
    WebGLRenderingContext.prototype.getParameter = makeNative(function(param) {
      // Handle spoofed params first
      if (param === UNMASKED_VENDOR_WEBGL) {
        return webgl.unmaskedVendor || webgl.vendor || null;
      }
      if (param === UNMASKED_RENDERER_WEBGL) {
        return webgl.unmaskedRenderer || webgl.renderer || null;
      }
      if (param === GL_VENDOR && webgl.vendor) return webgl.vendor;
      if (param === GL_RENDERER && webgl.renderer) return webgl.renderer;
      if (param === GL_VERSION && webgl.version) return webgl.version;
      if (param === GL_SHADING_LANGUAGE_VERSION && webgl.shadingLanguageVersion) return webgl.shadingLanguageVersion;
      if (param === GL_MAX_TEXTURE_SIZE && webgl.maxTextureSize) return webgl.maxTextureSize;
      if (param === GL_MAX_RENDERBUFFER_SIZE && webgl.maxRenderbufferSize) return webgl.maxRenderbufferSize;
      if (param === GL_MAX_VIEWPORT_DIMS && webgl.maxViewportDims) return new Int32Array(webgl.maxViewportDims);
      
      // Only pass through known-safe standard WebGL params
      // Extension params require getExtension() to be called first
      if (!SAFE_WEBGL_PARAMS.has(param)) {
        return null;
      }
      
      return getParameterOriginal.call(this, param);
    }, 'getParameter');

    if (typeof WebGL2RenderingContext !== 'undefined') {
      const getParameter2Original = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = makeNative(function(param) {
        if (param === UNMASKED_VENDOR_WEBGL) {
          return webgl.unmaskedVendor || webgl.vendor || null;
        }
        if (param === UNMASKED_RENDERER_WEBGL) {
          return webgl.unmaskedRenderer || webgl.renderer || null;
        }
        if (param === GL_VENDOR && webgl.vendor) return webgl.vendor;
        if (param === GL_RENDERER && webgl.renderer) return webgl.renderer;
        
        // For WebGL2, also filter unknown params
        if (!SAFE_WEBGL_PARAMS.has(param)) {
          return null;
        }
        
        return getParameter2Original.call(this, param);
      }, 'getParameter');
    }
  }

  // ============================================
  // AUDIO CONTEXT SPOOFING (Complete - baseLatency, value, sampleRate)
  // ============================================

  const audioLatency = client.audioLatency || {};
  const audioBaseLatencySimple = client.audioBaseLatencySimple;

  // Spoof AudioContext properties (baseLatency, outputLatency, sampleRate)
  if (audioLatency.baseLatency !== undefined || audioBaseLatencySimple !== undefined) {
    const targetBaseLatency = audioLatency.baseLatency ?? audioBaseLatencySimple ?? 0.003;
    const targetOutputLatency = audioLatency.outputLatency ?? 0;
    const targetSampleRate = audioLatency.sampleRate ?? audio.sampleRateLive ?? 48000;
    const targetMaxChannelCount = audioLatency.maxChannelCount ?? audio.maxChannelCount ?? 2;
    const targetChannelCount = audioLatency.channelCount ?? 2;
    const targetChannelInterpretation = audioLatency.channelInterpretation ?? 'speakers';
    const targetState = audioLatency.state ?? audio.contextState ?? 'suspended';

    // Override AudioContext constructor to spoof properties
    const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
    if (OriginalAudioContext) {
      const AudioContextProxy = function(...args) {
        const ctx = new OriginalAudioContext(...args);
        
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
  // ============================================

  // Spoof plugins - both when there are plugins AND when empty (mobile)
  const pluginsData = client.plugins;
  const mimeTypesData = client.mimeTypes;
  
  if (pluginsData !== undefined) {
    const spoofedPlugins = (pluginsData || []).map((p) => {
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

  // Spoof mimeTypes
  if (mimeTypesData !== undefined) {
    const spoofedMimeTypes = (mimeTypesData || []).map((m) => ({
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

  // Spoof pdfViewerEnabled based on plugins/mimeTypes presence
  const navigatorInfo = client.navigator || {};
  if (navigatorInfo.pdfViewerEnabled !== undefined) {
    defineNativeGetter(Navigator.prototype, 'pdfViewerEnabled', navigatorInfo.pdfViewerEnabled, 'Navigator');
  } else if (pluginsData !== undefined && pluginsData.length === 0) {
    // Mobile devices without plugins should have pdfViewerEnabled = false or null
    defineNativeGetter(Navigator.prototype, 'pdfViewerEnabled', false, 'Navigator');
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

  if (touchSupport.touchEvent !== undefined) {
    if (touchSupport.touchEvent) {
      // Ensure TouchEvent exists for touch-enabled devices
      if (typeof TouchEvent === 'undefined') {
        window.TouchEvent = makeNative(function TouchEvent(type, eventInitDict) {
          return new UIEvent(type, eventInitDict);
        }, 'TouchEvent');
      }
      // Set touch handlers
      window.ontouchstart = null;
      window.ontouchend = null;
      window.ontouchmove = null;
      window.ontouchcancel = null;
    } else {
      // Hide TouchEvent for non-touch devices
      try {
        delete window.TouchEvent;
      } catch (e) {}
    }
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
      
      // Check if this is a font probe (has quotes around font name)
      // Pattern: '16px "FontName", fallback' or "16px 'FontName', fallback"
      const fontTestMatch = font.match(/["']([^"']+)["']\s*,\s*(\w+)/);
      
      if (fontTestMatch) {
        // This IS a font probe: '16px "Arial", monospace'
        const testFont = fontTestMatch[1].trim();
        const testFontLower = testFont.toLowerCase();
        const fallbackFont = fontTestMatch[2]; // 'monospace'
        
        // Should this font "exist" according to profile?
        const shouldExist = installedFontsForMeasureText.has(testFontLower);
        
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
  
  if (fontsByCSSDetected.length > 0 || fontsByCSS.count !== undefined) {
    const originalOffsetWidthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    const originalOffsetHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    
    // Track baseline widths
    let cssBaselineWidth = null;
    let cssBaselineHeight = null;
    
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      get: makeNative(function() {
        const originalWidth = originalOffsetWidthDesc.get.call(this);
        const fontFamily = this.style.fontFamily || '';
        const fontLower = fontFamily.toLowerCase().trim();
        
        // Check if this is the baseline test (just "monospace" without comma)
        if (fontLower === 'monospace') {
          cssBaselineWidth = originalWidth;
          return originalWidth;
        }
        
        // Check if this is a font detection probe ("Font",monospace)
        if (fontFamily.includes(',') && fontLower.includes('monospace')) {
          const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
          const testFont = fonts[0]; // First font is the one being tested
          const testFontLower = testFont.toLowerCase();
          
          // Check if this font should "exist"
          const shouldExist = installedFontsForCSS.has(testFontLower);
          
          if (!shouldExist && cssBaselineWidth !== null) {
            // Font not in profile - return baseline width (font "not found")
            return cssBaselineWidth;
          } else if (shouldExist && originalWidth === cssBaselineWidth && cssBaselineWidth !== null) {
            // Font should exist but renders same as baseline - vary slightly
            return cssBaselineWidth + 1;
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
        const fontLower = fontFamily.toLowerCase().trim();
        
        // Baseline test
        if (fontLower === 'monospace') {
          cssBaselineHeight = originalHeight;
          return originalHeight;
        }
        
        if (fontFamily.includes(',') && fontLower.includes('monospace')) {
          const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
          const testFont = fonts[0];
          const testFontLower = testFont.toLowerCase();
          
          const shouldExist = installedFontsForCSS.has(testFontLower);
          
          if (!shouldExist && cssBaselineHeight !== null) {
            return cssBaselineHeight;
          }
        }
        
        return originalHeight;
      }, 'get offsetHeight'),
      configurable: true,
      enumerable: true
    });
  }

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
    // Store the target hashes - these will be compared by fingerprinting libraries
    window.__FP_AUDIO_HASH__ = audioData.hash;
    window.__FP_AUDIO_FULL_HASH__ = audioData.fullHash;
  }

  // ============================================
  // CANVAS GEOMETRY HASH SPOOFING
  // ============================================

  const canvasData = client.canvas || {};
  if (canvasData.geometry_hash !== undefined) {
    // Store geometry hash for reference
    window.__FP_CANVAS_GEOMETRY_HASH__ = canvasData.geometry_hash;
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
    
    // Store for reference - timing probes can't easily be spoofed at JS level
    window.__FP_HYPERVISOR_MEAN__ = targetMean;
    window.__FP_HYPERVISOR_STDDEV__ = targetStdDev;
    window.__FP_POSSIBLE_VM__ = hypervisorProbe.possibleVM || false;
  }

})();

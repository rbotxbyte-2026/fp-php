"""
mitmproxy addon: COMPLETE API Monitor (200+ APIs)

Monitors ALL browser APIs that websites can access for fingerprinting.
Uses Proxy for dynamic interception - captures ANY property access.

Usage:
    mitmdump -s addon.py -p 8082

Console commands:
    __FP_CSV__()      - Export CSV
    __FP_JSON__()     - Export JSON  
    __FP_SUMMARY__()  - Show summary
    __FP_SAVE__()     - Save to file (auto-saves on page leave)

Output:
    fp_captured.json  - Auto-saved fingerprint data
"""

import re
import json
import os
from datetime import datetime
from mitmproxy import http

JS_MONITOR = r"""
(function() {
  'use strict';
  if (window.__FP_MONITOR__) return;
  window.__FP_MONITOR__ = true;
  
  const log = [];
  const unique = new Map();
  const src = location.hostname || location.host || 'unknown';
  
  function ser(v) {
    try {
      if (v === null) return 'null';
      if (v === undefined) return 'undefined';
      if (typeof v === 'function') return '[fn]';
      if (typeof v === 'symbol') return v.toString();
      if (Array.isArray(v)) return JSON.stringify(v.slice(0,5));
      if (typeof v === 'object') {
        if (v instanceof DOMRect) return JSON.stringify({x:v.x,y:v.y,w:v.width,h:v.height});
        if (v instanceof PluginArray) return '[Plugins:'+v.length+']';
        if (v instanceof MimeTypeArray) return '[MimeTypes:'+v.length+']';
        try { return JSON.stringify(v).substring(0,100); } catch { return '[obj]'; }
      }
      return String(v).substring(0,100);
    } catch { return '[err]'; }
  }
  
  function track(cat, prop, val) {
    const k = cat + '.' + String(prop);
    const s = ser(val);
    const t = val === null ? 'null' : typeof val;
    if (!unique.has(k)) unique.set(k, {c:0,t:t,v:new Set(),src:new Set()});
    const e = unique.get(k);
    e.c++;
    if (e.v.size < 3) e.v.add(s);
    e.src.add(src);
    log.push({ts:Date.now(),cat,prop:String(prop),t,v:s,src});

    console.log('%c[FP:'+src+'] %c'+cat+'%c.'+prop+' = '+s.substring(0,40),
      'color:#f66;font-weight:bold','color:#e74c3c','color:#333');
  }
  
  // ═══════════════════════════════════════════════════════════════════
  // PROXY: navigator (50+ props)
  // ═══════════════════════════════════════════════════════════════════
  const nav = window.navigator;
  try {
    Object.defineProperty(window, 'navigator', {
      get: () => new Proxy(nav, {
        get(t, p) {
          const v = Reflect.get(t, p);
          track('navigator', p, v);
          return typeof v === 'function' ? v.bind(t) : v;
        }
      }),
      configurable: true
    });
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // PROXY: screen (15+ props)
  // ═══════════════════════════════════════════════════════════════════
  const scr = window.screen;
  try {
    Object.defineProperty(window, 'screen', {
      get: () => new Proxy(scr, {
        get(t, p) {
          const v = Reflect.get(t, p);
          track('screen', p, v);
          return typeof v === 'function' ? v.bind(t) : v;
        }
      }),
      configurable: true
    });
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // PROXY: location (10 props)
  // ═══════════════════════════════════════════════════════════════════
  const loc = window.location;
  try {
    const locProxy = new Proxy(loc, {
      get(t, p) {
        const v = Reflect.get(t, p);
        track('location', p, v);
        return typeof v === 'function' ? v.bind(t) : v;
      }
    });
    Object.defineProperty(window, 'location', {
      get: () => locProxy,
      set: (v) => { loc.href = v; },
      configurable: true
    });
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // PROXY: history (5 props)
  // ═══════════════════════════════════════════════════════════════════
  const hist = window.history;
  try {
    Object.defineProperty(window, 'history', {
      get: () => new Proxy(hist, {
        get(t, p) {
          const v = Reflect.get(t, p);
          track('history', p, v);
          return typeof v === 'function' ? v.bind(t) : v;
        }
      }),
      configurable: true
    });
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // PROXY: performance (20+ props)
  // ═══════════════════════════════════════════════════════════════════
  const perf = window.performance;
  try {
    Object.defineProperty(window, 'performance', {
      get: () => new Proxy(perf, {
        get(t, p) {
          const v = Reflect.get(t, p);
          if (p !== 'now' || unique.get('performance.now')?.c < 3) {
            track('performance', p, typeof v === 'function' ? '[fn]' : v);
          }
          return typeof v === 'function' ? v.bind(t) : v;
        }
      }),
      configurable: true
    });
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // WINDOW PROPERTIES (50+ fingerprint-relevant)
  // ═══════════════════════════════════════════════════════════════════
  const winProps = [
    'innerWidth','innerHeight','outerWidth','outerHeight',
    'screenX','screenY','screenLeft','screenTop',
    'scrollX','scrollY','pageXOffset','pageYOffset',
    'devicePixelRatio','visualViewport',
    'localStorage','sessionStorage','indexedDB','caches',
    'crypto','speechSynthesis','webkitStorageInfo',
    'chrome','opera','safari','external','clientInformation',
    'styleMedia','customElements','trustedTypes',
    'crossOriginIsolated','originAgentCluster','isSecureContext',
    'name','closed','frames','length','opener','parent','self','top',
    'locationbar','menubar','personalbar','scrollbars','statusbar','toolbar',
    'scheduler','navigation'
  ];
  winProps.forEach(p => {
    try {
      const d = Object.getOwnPropertyDescriptor(window, p);
      if (d?.get) {
        const orig = d.get;
        Object.defineProperty(window, p, {
          get() { const v = orig.call(this); track('window', p, v); return v; },
          configurable: true
        });
      } else if (p in window) {
        let cur = window[p];
        Object.defineProperty(window, p, {
          get() { track('window', p, cur); return cur; },
          set(v) { cur = v; },
          configurable: true
        });
      }
    } catch(e) {}
  });
  
  // ═══════════════════════════════════════════════════════════════════
  // DOCUMENT PROPERTIES (30+ props)
  // ═══════════════════════════════════════════════════════════════════
  const docProps = [
    'cookie','referrer','domain','URL','documentURI','baseURI',
    'characterSet','charset','inputEncoding','contentType',
    'compatMode','hidden','visibilityState','hasFocus',
    'fullscreenEnabled','pictureInPictureEnabled',
    'designMode','lastModified','readyState','title','dir',
    'plugins','embeds','scripts','images','links','forms','anchors'
  ];
  docProps.forEach(p => {
    try {
      const d = Object.getOwnPropertyDescriptor(Document.prototype, p) ||
                Object.getOwnPropertyDescriptor(document, p);
      if (d?.get) {
        const orig = d.get;
        Object.defineProperty(document, p, {
          get() { const v = orig.call(this); track('document', p, v); return v; },
          set: d.set,
          configurable: true
        });
      }
    } catch(e) {}
  });
  
  // ═══════════════════════════════════════════════════════════════════
  // CANVAS API
  // ═══════════════════════════════════════════════════════════════════
  const canvasProto = HTMLCanvasElement.prototype;
  const origCtx = canvasProto.getContext;
  canvasProto.getContext = function(t,...a) {
    track('canvas','getContext',t);
    return origCtx.call(this,t,...a);
  };
  const origDataURL = canvasProto.toDataURL;
  canvasProto.toDataURL = function(...a) {
    track('canvas','toDataURL','[FP]');
    return origDataURL.call(this,...a);
  };
  const origBlob = canvasProto.toBlob;
  canvasProto.toBlob = function(...a) {
    track('canvas','toBlob','[FP]');
    return origBlob.call(this,...a);
  };
  
  // CanvasRenderingContext2D
  const ctx2d = CanvasRenderingContext2D.prototype;
  const origGetImage = ctx2d.getImageData;
  ctx2d.getImageData = function(...a) {
    track('canvas','getImageData','[FP]');
    return origGetImage.call(this,...a);
  };
  const origMeasure = ctx2d.measureText;
  const fontsSeen = new Set();
  ctx2d.measureText = function(txt) {
    if (this.font && !fontsSeen.has(this.font)) {
      fontsSeen.add(this.font);
      track('fonts','measureText',this.font.substring(0,30));
    }
    return origMeasure.call(this,txt);
  };
  const origFillText = ctx2d.fillText;
  ctx2d.fillText = function(t,...a) {
    track('canvas','fillText',t?.substring(0,20));
    return origFillText.call(this,t,...a);
  };
  
  // ═══════════════════════════════════════════════════════════════════
  // WEBGL API
  // ═══════════════════════════════════════════════════════════════════
  ['WebGLRenderingContext','WebGL2RenderingContext'].forEach(n => {
    try {
      const C = window[n];
      if (!C) return;
      const origParam = C.prototype.getParameter;
      C.prototype.getParameter = function(p) {
        const v = origParam.call(this,p);
        track('webgl','getParameter('+p+')',v);
        return v;
      };
      const origExt = C.prototype.getExtension;
      C.prototype.getExtension = function(name) {
        const v = origExt.call(this,name);
        track('webgl','getExtension',name+':'+(v?'yes':'no'));
        return v;
      };
      const origSupp = C.prototype.getSupportedExtensions;
      C.prototype.getSupportedExtensions = function() {
        const v = origSupp.call(this);
        track('webgl','getSupportedExtensions',v?.length+' ext');
        return v;
      };
      const origShader = C.prototype.getShaderPrecisionFormat;
      C.prototype.getShaderPrecisionFormat = function(s,p) {
        const v = origShader.call(this,s,p);
        track('webgl','getShaderPrecisionFormat',s+','+p);
        return v;
      };
    } catch(e) {}
  });
  
  // WEBGL_debug_renderer_info
  try {
    const origParam = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(p) {
      const v = origParam.call(this,p);
      if (p === 37445 || p === 37446) track('webgl','RENDERER/VENDOR',v);
      return v;
    };
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // AUDIO API
  // ═══════════════════════════════════════════════════════════════════
  try {
    const Orig = window.AudioContext || window.webkitAudioContext;
    if (Orig) {
      const AC = function(...a) {
        track('audio','AudioContext','new');
        const ctx = new Orig(...a);
        // Proxy audio context
        ['sampleRate','baseLatency','outputLatency','state','currentTime'].forEach(p => {
          try {
            const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(ctx), p);
            if (d?.get) {
              Object.defineProperty(ctx, p, {
                get() { const v = d.get.call(this); track('audio',p,v); return v; }
              });
            }
          } catch(e) {}
        });
        const origOsc = ctx.createOscillator.bind(ctx);
        ctx.createOscillator = function() {
          track('audio','createOscillator','[FP]');
          return origOsc();
        };
        const origAnalyser = ctx.createAnalyser.bind(ctx);
        ctx.createAnalyser = function() {
          track('audio','createAnalyser','[FP]');
          return origAnalyser();
        };
        const origDest = ctx.createDynamicsCompressor?.bind(ctx);
        if (origDest) {
          ctx.createDynamicsCompressor = function() {
            track('audio','createDynamicsCompressor','[FP]');
            return origDest();
          };
        }
        return ctx;
      };
      AC.prototype = Orig.prototype;
      window.AudioContext = window.webkitAudioContext = AC;
    }
  } catch(e) {}
  
  // AnalyserNode
  try {
    const an = AnalyserNode.prototype;
    const origFloat = an.getFloatFrequencyData;
    an.getFloatFrequencyData = function(a) {
      track('audio','getFloatFrequencyData','[FP]');
      return origFloat.call(this,a);
    };
    const origByte = an.getByteFrequencyData;
    an.getByteFrequencyData = function(a) {
      track('audio','getByteFrequencyData','[FP]');
      return origByte.call(this,a);
    };
  } catch(e) {}
  
  // AudioBuffer
  try {
    const origChan = AudioBuffer.prototype.getChannelData;
    AudioBuffer.prototype.getChannelData = function(c) {
      track('audio','getChannelData',c);
      return origChan.call(this,c);
    };
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // DATE / TIMEZONE / INTL
  // ═══════════════════════════════════════════════════════════════════
  const origTZ = Date.prototype.getTimezoneOffset;
  Date.prototype.getTimezoneOffset = function() {
    const v = origTZ.call(this);
    track('Date','getTimezoneOffset',v);
    return v;
  };
  
  const origToStr = Date.prototype.toString;
  let dateStrCount = 0;
  Date.prototype.toString = function() {
    const v = origToStr.call(this);
    if (dateStrCount++ < 2) track('Date','toString',v.substring(0,30));
    return v;
  };
  
  const origResolved = Intl.DateTimeFormat.prototype.resolvedOptions;
  Intl.DateTimeFormat.prototype.resolvedOptions = function() {
    const v = origResolved.call(this);
    track('Intl','resolvedOptions',v?.timeZone);
    return v;
  };
  
  const origNumResolved = Intl.NumberFormat.prototype.resolvedOptions;
  Intl.NumberFormat.prototype.resolvedOptions = function() {
    const v = origNumResolved.call(this);
    track('Intl','NumberFormat.resolvedOptions',v?.locale);
    return v;
  };
  
  // ═══════════════════════════════════════════════════════════════════
  // MEDIA DEVICES
  // ═══════════════════════════════════════════════════════════════════
  try {
    const md = navigator.mediaDevices;
    if (md?.enumerateDevices) {
      const orig = md.enumerateDevices;
      md.enumerateDevices = function() {
        track('media','enumerateDevices','[FP]');
        return orig.call(this);
      };
    }
    if (md?.getUserMedia) {
      const orig = md.getUserMedia;
      md.getUserMedia = function(c) {
        track('media','getUserMedia',JSON.stringify(c));
        return orig.call(this,c);
      };
    }
    if (md?.getDisplayMedia) {
      const orig = md.getDisplayMedia;
      md.getDisplayMedia = function(c) {
        track('media','getDisplayMedia','[FP]');
        return orig.call(this,c);
      };
    }
  } catch(e) {}
  
  // MediaCapabilities
  try {
    if (navigator.mediaCapabilities?.decodingInfo) {
      const orig = navigator.mediaCapabilities.decodingInfo;
      navigator.mediaCapabilities.decodingInfo = function(c) {
        track('media','decodingInfo',JSON.stringify(c).substring(0,50));
        return orig.call(this,c);
      };
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // WEBRTC
  // ═══════════════════════════════════════════════════════════════════
  try {
    const ORTC = window.RTCPeerConnection || window.webkitRTCPeerConnection;
    if (ORTC) {
      const RTC = function(c) {
        track('webrtc','RTCPeerConnection','new');
        const pc = new ORTC(c);
        const origLocal = pc.createDataChannel?.bind(pc);
        if (origLocal) {
          pc.createDataChannel = function(l) {
            track('webrtc','createDataChannel',l);
            return origLocal(l);
          };
        }
        return pc;
      };
      RTC.prototype = ORTC.prototype;
      window.RTCPeerConnection = RTC;
      if (window.webkitRTCPeerConnection) window.webkitRTCPeerConnection = RTC;
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // BATTERY
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (navigator.getBattery) {
      const orig = navigator.getBattery;
      navigator.getBattery = function() {
        track('battery','getBattery','[FP]');
        return orig.call(this).then(b => {
          track('battery','level',b.level);
          track('battery','charging',b.charging);
          return b;
        });
      };
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // NETWORK INFO
  // ═══════════════════════════════════════════════════════════════════
  try {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      ['effectiveType','rtt','downlink','saveData','type'].forEach(p => {
        try {
          const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(conn), p);
          if (d?.get) {
            const orig = d.get;
            Object.defineProperty(conn, p, {
              get() { const v = orig.call(this); track('network',p,v); return v; }
            });
          }
        } catch(e) {}
      });
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // STORAGE APIs
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (navigator.storage?.estimate) {
      const orig = navigator.storage.estimate;
      navigator.storage.estimate = function() {
        track('storage','estimate','[FP]');
        return orig.call(this);
      };
    }
    if (navigator.storage?.persist) {
      const orig = navigator.storage.persist;
      navigator.storage.persist = function() {
        track('storage','persist','[FP]');
        return orig.call(this);
      };
    }
  } catch(e) {}
  
  // localStorage/sessionStorage
  try {
    const origLS = Storage.prototype.getItem;
    Storage.prototype.getItem = function(k) {
      track('storage','getItem',k);
      return origLS.call(this,k);
    };
    const origLSSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k,v) {
      track('storage','setItem',k);
      return origLSSet.call(this,k,v);
    };
  } catch(e) {}
  
  // IndexedDB
  try {
    const origOpen = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function(name) {
      track('storage','indexedDB.open',name);
      return origOpen.call(this,name);
    };
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // SPEECH SYNTHESIS (Voices)
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (window.speechSynthesis?.getVoices) {
      const orig = window.speechSynthesis.getVoices;
      window.speechSynthesis.getVoices = function() {
        const v = orig.call(this);
        track('speech','getVoices',v?.length+' voices');
        return v;
      };
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // GAMEPAD
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (navigator.getGamepads) {
      const orig = navigator.getGamepads;
      navigator.getGamepads = function() {
        track('gamepad','getGamepads','[FP]');
        return orig.call(this);
      };
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // PERMISSIONS
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (navigator.permissions?.query) {
      const orig = navigator.permissions.query;
      navigator.permissions.query = function(p) {
        track('permissions','query',p?.name);
        return orig.call(this,p);
      };
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // USER AGENT DATA (Client Hints)
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const orig = navigator.userAgentData.getHighEntropyValues;
      navigator.userAgentData.getHighEntropyValues = function(hints) {
        track('uaData','getHighEntropyValues',hints.join(','));
        return orig.call(this,hints);
      };
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // SENSORS
  // ═══════════════════════════════════════════════════════════════════
  ['Accelerometer','Gyroscope','Magnetometer','AbsoluteOrientationSensor',
   'RelativeOrientationSensor','LinearAccelerationSensor','GravitySensor'].forEach(s => {
    try {
      const Orig = window[s];
      if (Orig) {
        window[s] = function(...a) {
          track('sensor',s,'new');
          return new Orig(...a);
        };
        window[s].prototype = Orig.prototype;
      }
    } catch(e) {}
  });
  
  // ═══════════════════════════════════════════════════════════════════
  // BLUETOOTH / USB / SERIAL / HID
  // ═══════════════════════════════════════════════════════════════════
  ['bluetooth','usb','serial','hid'].forEach(api => {
    try {
      const obj = navigator[api];
      if (obj?.requestDevice) {
        const orig = obj.requestDevice;
        obj.requestDevice = function(o) {
          track(api,'requestDevice','[FP]');
          return orig.call(this,o);
        };
      }
      if (obj?.getDevices) {
        const orig = obj.getDevices;
        obj.getDevices = function() {
          track(api,'getDevices','[FP]');
          return orig.call(this);
        };
      }
    } catch(e) {}
  });
  
  // ═══════════════════════════════════════════════════════════════════
  // GEOLOCATION
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (navigator.geolocation) {
      const origPos = navigator.geolocation.getCurrentPosition;
      navigator.geolocation.getCurrentPosition = function(s,e,o) {
        track('geo','getCurrentPosition','[FP]');
        return origPos.call(this,s,e,o);
      };
      const origWatch = navigator.geolocation.watchPosition;
      navigator.geolocation.watchPosition = function(s,e,o) {
        track('geo','watchPosition','[FP]');
        return origWatch.call(this,s,e,o);
      };
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // CSS / FONTS
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (document.fonts?.check) {
      const orig = document.fonts.check;
      const checked = new Set();
      document.fonts.check = function(f,t) {
        if (!checked.has(f)) {
          checked.add(f);
          track('fonts','check',f);
        }
        return orig.call(this,f,t);
      };
    }
  } catch(e) {}
  
  try {
    if (CSS.supports) {
      const orig = CSS.supports;
      CSS.supports = function(...a) {
        track('css','supports',a.join(',').substring(0,30));
        return orig.apply(CSS,a);
      };
    }
  } catch(e) {}
  
  try {
    const origMatch = window.matchMedia;
    const matched = new Set();
    window.matchMedia = function(q) {
      if (!matched.has(q)) {
        matched.add(q);
        track('css','matchMedia',q);
      }
      return origMatch.call(this,q);
    };
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // CRYPTO
  // ═══════════════════════════════════════════════════════════════════
  try {
    const origRandom = crypto.getRandomValues;
    let randomCount = 0;
    crypto.getRandomValues = function(a) {
      if (randomCount++ < 2) track('crypto','getRandomValues',a?.length);
      return origRandom.call(this,a);
    };
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // PLUGINS (legacy)
  // ═══════════════════════════════════════════════════════════════════
  try {
    if (navigator.plugins) {
      const origPlugins = Object.getOwnPropertyDescriptor(Navigator.prototype, 'plugins');
      if (origPlugins?.get) {
        Object.defineProperty(navigator, 'plugins', {
          get() {
            const v = origPlugins.get.call(this);
            track('plugins','plugins',v?.length+' plugins');
            return v;
          }
        });
      }
    }
    if (navigator.mimeTypes) {
      const origMime = Object.getOwnPropertyDescriptor(Navigator.prototype, 'mimeTypes');
      if (origMime?.get) {
        Object.defineProperty(navigator, 'mimeTypes', {
          get() {
            const v = origMime.get.call(this);
            track('plugins','mimeTypes',v?.length+' types');
            return v;
          }
        });
      }
    }
  } catch(e) {}
  
  // ═══════════════════════════════════════════════════════════════════
  // EXPORT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════
  window.__FP_CSV__ = function() {
    let csv = 'category,property,type,count,value,source' + String.fromCharCode(10);
    unique.forEach((d,k) => {
      const [cat,...pp] = k.split('.');
      const val = ([...d.v][0]||'').replace(/"/g,'""');
      const sources = [...(d.src||[])].join(';');
      csv += `"${cat}","${pp.join('.')}","${d.t}",${d.c},"${val}","${sources}"` + String.fromCharCode(10);
    });
    navigator.clipboard?.writeText(csv);
    console.log('%c[FP] CSV copied! ('+unique.size+' APIs)','color:#2ecc71;font-weight:bold');
    return csv;
  };
  
  window.__FP_JSON__ = function() {
    const data = {url:location.href,source:src,ts:new Date().toISOString(),total:log.length,unique:unique.size,apis:{}};
    unique.forEach((e,k) => { data.apis[k] = {t:e.t,c:e.c,v:[...e.v],src:[...(e.src||[])]}; });
    const json = JSON.stringify(data,null,2);
    navigator.clipboard?.writeText(json);
    console.log('%c[FP] JSON copied!','color:#2ecc71;font-weight:bold');
    return data;
  };
  
  // Save via proxy endpoint (same protocol - no mixed content)
  window.__FP_SAVE__ = function(useBeacon) {
    if (unique.size === 0) { console.log('[FP] No APIs to save'); return; }
    const data = {url:location.href,source:src,ts:new Date().toISOString(),total:log.length,unique:unique.size,apis:{}};
    unique.forEach((e,k) => { data.apis[k] = {t:e.t,c:e.c,v:[...e.v],src:[...(e.src||[])]}; });
    const json = JSON.stringify(data);
    // Use same-origin proxy endpoint to avoid mixed content block
    const saveUrl = location.protocol + '//' + location.host + '/__fp_save__';
    console.log('[FP] Saving ' + unique.size + ' APIs to ' + saveUrl);
    try {
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(saveUrl, new Blob([json], {type: 'application/json'}));
        console.log('%c[FP] Beacon sent','color:#2ecc71;font-weight:bold');
      } else {
        fetch(saveUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: json
        }).then(r => r.text()).then(r => {
          console.log('%c[FP] Saved! ' + unique.size + ' APIs','color:#2ecc71;font-weight:bold');
        }).catch(e => console.log('[FP] Save error:', e));
      }
    } catch(e) { console.log('[FP] Save error:', e); }
    return data;
  };
  
  // Auto-save on page leave
  let saved = false;
  function autoSave() {
    if (saved || unique.size === 0) return;
    saved = true;
    window.__FP_SAVE__(true); // use beacon for reliability
  }
  window.addEventListener('beforeunload', autoSave);
  window.addEventListener('pagehide', autoSave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') autoSave();
  });
  // Also save after 5 seconds of inactivity
  let saveTimer;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { if (unique.size > 0 && !saved) window.__FP_SAVE__(false); }, 5000);
  }
  document.addEventListener('click', scheduleSave);
  document.addEventListener('scroll', scheduleSave);
  setTimeout(scheduleSave, 5000);
  
  window.__FP_SUMMARY__ = function() {
    console.log('%c═══════════════════════════════════════════════════════','color:#e74c3c');
    console.log('%c  API ACCESS SUMMARY ('+src+')','color:#e74c3c;font-weight:bold;font-size:14px');
    console.log('%c═══════════════════════════════════════════════════════','color:#e74c3c');
    const byCat = {};
    unique.forEach((d,k) => {
      const [cat] = k.split('.');
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push({k,...d});
    });
    Object.keys(byCat).sort().forEach(cat => {
      const apis = byCat[cat];
      console.log('%c['+cat.toUpperCase()+'] %c('+apis.length+')','color:#3498db;font-weight:bold','color:#888');
      apis.sort((a,b)=>b.c-a.c).forEach(a => {
        const sources = [...(a.src||[])].join(',');
        console.log('  '+a.k+': '+([...a.v][0]||'').substring(0,40)+' ('+a.c+'x) ['+sources+']');
      });
    });
    console.log('%c═══════════════════════════════════════════════════════','color:#e74c3c');
    console.log('%cTOTAL: '+unique.size+' unique APIs from '+src,'color:#2ecc71;font-weight:bold');
    return byCat;
  };
  
  console.log('%c[FP MONITOR] Active - 200+ APIs tracked','color:#ff6b6b;font-weight:bold;font-size:14px');
  console.log('%c  __FP_CSV__() __FP_JSON__() __FP_SUMMARY__() __FP_SAVE__()','color:#888');
  
  // ═══════════════════════════════════════════════════════════════════
  // MOBILE: BIG Floating save button
  // ═══════════════════════════════════════════════════════════════════
  function createSaveButton() {
    if (document.getElementById('fp-save-btn')) return;
    var btn = document.createElement('div');
    btn.id = 'fp-save-btn';
    btn.innerHTML = '<span style="font-size:40px">💾</span><br>SAVE';
    btn.style.cssText = 'position:fixed !important;top:0 !important;left:0 !important;background:#e74c3c !important;color:#fff !important;padding:25px 35px !important;border-radius:0 0 20px 0 !important;font-weight:bold !important;font-size:24px !important;z-index:2147483647 !important;cursor:pointer !important;box-shadow:0 8px 30px rgba(0,0,0,0.5) !important;text-align:center !important;border:4px solid #fff !important;min-width:100px !important;';
    btn.onclick = function() {
      btn.innerHTML = '<span style="font-size:40px">⏳</span><br>SAVING...';
      window.__FP_SAVE__(false);
      setTimeout(function() { btn.innerHTML = '<span style="font-size:40px">✅</span><br>' + unique.size + ' APIs'; }, 1000);
      setTimeout(function() { btn.innerHTML = '<span style="font-size:40px">💾</span><br>SAVE'; }, 3000);
    };
    (document.body || document.documentElement).appendChild(btn);
    console.log('[FP] Save button added!');
  }
  
  // Try multiple times to add button
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createSaveButton();
  }
  document.addEventListener('DOMContentLoaded', createSaveButton);
  window.addEventListener('load', createSaveButton);
  setTimeout(createSaveButton, 1000);
  setTimeout(createSaveButton, 3000);
  setTimeout(createSaveButton, 5000);
  
  // Update button with count
  setInterval(function() {
    var btn = document.getElementById('fp-save-btn');
    if (btn && unique.size > 0 && btn.innerHTML.indexOf('SAVE') > -1) {
      btn.innerHTML = '<span style="font-size:40px">💾</span><br>' + unique.size + ' APIs';
    }
  }, 3000);
  
  // Auto-save every 15 seconds if there's data
  setInterval(function() {
    if (unique.size > 0) {
      window.__FP_SAVE__(false);
      console.log('%c[FP] Auto-saved ' + unique.size + ' APIs','color:#2ecc71');
    }
  }, 15000);
})();
"""

# HTML button - single line to avoid JS newline issues
SAVE_BUTTON_HTML = '<div id="fp-debug-container" style="position:fixed !important;top:0 !important;left:0 !important;z-index:2147483647 !important;font-family:monospace !important;"><button onclick="if(window.__FP_SAVE__){window.__FP_SAVE__(false);this.innerText=\'SAVED!\';setTimeout(function(){document.getElementById(\'fp-save-btn\').innerText=\'SAVE\'}.bind(this),2000)}else{alert(\'Not ready\')}" id="fp-save-btn" style="background:#e74c3c !important;color:#fff !important;padding:20px 30px !important;font-weight:bold !important;font-size:20px !important;cursor:pointer !important;border:3px solid #fff !important;border-radius:8px !important;">SAVE</button></div>'

def _inject(html: bytes, enc: str = "utf-8") -> bytes:
    script_tag = f"<script>/*FP*/{JS_MONITOR}</script>"
    dec = html.decode(enc, errors="replace")
    
    # Remove CSP meta tags that block inline scripts
    dec = re.sub(r'<meta[^>]*content-security-policy[^>]*>', '', dec, flags=re.I)
    dec = re.sub(r'<meta[^>]*http-equiv=["\']?Content-Security-Policy["\']?[^>]*>', '', dec, flags=re.I)
    
    # Inject script in head
    inj, n = re.subn(r"(<head[^>]*>)", r"\1" + script_tag, dec, count=1, flags=re.I)
    if n == 0:
        inj, n = re.subn(r"(<script)", script_tag + r"\1", dec, count=1, flags=re.I)
    if n == 0:
        inj = script_tag + dec
    
    # Inject button HTML at end of body or before </html> or at very end
    inj, m = re.subn(r"(</body>)", SAVE_BUTTON_HTML + r"\1", inj, count=1, flags=re.I)
    if m == 0:
        inj, m = re.subn(r"(</html>)", SAVE_BUTTON_HTML + r"\1", inj, count=1, flags=re.I)
    if m == 0:
        # No closing tags, add at end
        inj = inj + SAVE_BUTTON_HTML
    
    return inj.encode(enc, errors="replace")


# Output file path
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fp_captured.json")


class FPMonitor:
    def __init__(self):
        self.captured = {}
        print("[FP] 200+ API Monitor loaded")
        print(f"[FP] Output: {OUTPUT_FILE}")

    def request(self, flow: http.HTTPFlow):
        # Handle CORS preflight
        if "/__fp_save__" in flow.request.path:
            print(f"[FP] Intercepted: {flow.request.method} {flow.request.path}")
            
            if flow.request.method == "OPTIONS":
                flow.response = http.Response.make(
                    200, b"",
                    {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                    }
                )
                return
            
            if flow.request.method == "POST":
                try:
                    content = flow.request.content
                    print(f"[FP] Content length: {len(content) if content else 0}")
                    
                    if not content:
                        print("[FP] Empty content!")
                        flow.response = http.Response.make(400, b"empty", {"Access-Control-Allow-Origin": "*"})
                        return
                    
                    data = json.loads(content)
                    url = data.get("url", "unknown")
                    apis = data.get("apis", {})
                    
                    print(f"[FP] Got {len(apis)} APIs from {url[:50]}")
                    
                    # Load existing data
                    existing = {"captures": [], "merged_apis": {}}
                    if os.path.exists(OUTPUT_FILE):
                        try:
                            with open(OUTPUT_FILE, "r") as f:
                                existing = json.load(f)
                        except Exception as e:
                            print(f"[FP] Load error: {e}")
                    
                    # Ensure structure
                    if "captures" not in existing:
                        existing["captures"] = []
                    if "merged_apis" not in existing:
                        existing["merged_apis"] = {}
                    
                    # Add capture record
                    source = data.get("source", url.split("/")[2] if "/" in url else "unknown")
                    existing["captures"].append({
                        "url": url,
                        "source": source,
                        "ts": data.get("ts"),
                        "unique": data.get("unique", 0),
                        "total": data.get("total", 0)
                    })
                    
                    # Merge APIs
                    for k, v in apis.items():
                        if k not in existing["merged_apis"]:
                            existing["merged_apis"][k] = v
                        else:
                            existing["merged_apis"][k]["c"] = existing["merged_apis"][k].get("c", 0) + v.get("c", 0)
                            vals = set(existing["merged_apis"][k].get("v", []))
                            vals.update(v.get("v", []))
                            existing["merged_apis"][k]["v"] = list(vals)[:5]
                            # Merge sources
                            srcs = set(existing["merged_apis"][k].get("src", []))
                            srcs.update(v.get("src", []))
                            existing["merged_apis"][k]["src"] = list(srcs)
                    
                    existing["last_updated"] = datetime.now().isoformat()
                    existing["total_apis"] = len(existing["merged_apis"])
                    
                    # Save
                    with open(OUTPUT_FILE, "w") as f:
                        json.dump(existing, f, indent=2)
                    
                    print(f"[FP] ✓ SAVED {len(apis)} APIs to {OUTPUT_FILE}")
                    
                    flow.response = http.Response.make(
                        200, b"saved",
                        {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "text/plain"
                        }
                    )
                except Exception as e:
                    print(f"[FP] Save error: {e}")
                    import traceback
                    traceback.print_exc()
                    flow.response = http.Response.make(
                        500, str(e).encode(),
                        {"Access-Control-Allow-Origin": "*"}
                    )
                return

    def response(self, flow: http.HTTPFlow):
        # Skip our save endpoint
        if "/__fp_save__" in flow.request.path:
            return
        
        # Strip CSP headers that block inline scripts
        for header in ["content-security-policy", "content-security-policy-report-only", "x-content-security-policy"]:
            if header in flow.response.headers:
                del flow.response.headers[header]
                print(f"[FP] Stripped CSP header from {flow.request.host}")
            
        ct = flow.response.headers.get("content-type", "")
        if "text/html" not in ct:
            return
        try:
            enc = "utf-8"
            m = re.search(r"charset=([^\s;]+)", ct, re.I)
            if m:
                enc = m.group(1).strip('"')
            flow.response.content = _inject(flow.response.content, enc)
            flow.response.headers["x-fp"] = "1"
            print(f"[FP] {flow.request.pretty_url}")
        except Exception as e:
            print(f"[FP] ERR: {e}")


addons = [FPMonitor()]
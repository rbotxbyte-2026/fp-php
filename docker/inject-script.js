/**
 * inject-script.js
 * Standalone spoofing script that can be injected via CDP or browser console
 * This file is a template - the actual script is generated from original.json
 */

// This will be populated by cdp-inject.js with values from original.json
const CONFIG = {
    // These are placeholder values - real values come from original.json
    navigator: {
        hardwareConcurrency: 8,
        deviceMemory: 8,
        maxTouchPoints: 5,
    },
    screen: {
        width: 384,
        height: 832,
        devicePixelRatio: 2.8125,
    },
    webgl: {
        unmaskedVendor: 'Qualcomm',
        unmaskedRenderer: 'Adreno (TM) 630',
    },
    battery: {
        charging: false,
        level: 0.85,
    },
    webrtc: {
        block: true,
    },
};

(function() {
    'use strict';
    
    // Native function masking
    const nativeToString = Function.prototype.toString;
    const nativeFunctions = new Map();
    
    function makeNative(fn, name) {
        nativeFunctions.set(fn, `function ${name}() { [native code] }`);
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
        makeNative(getter, `get ${prop}`);
        try {
            Object.defineProperty(obj, prop, {
                get: getter,
                configurable: true,
                enumerable: true
            });
        } catch (e) {}
    }
    
    // Apply spoofs from CONFIG
    // This is a simplified version - the full version is in cdp-inject.js
    
    console.log('[FP-SPOOF] Template script loaded');
    console.log('[FP-SPOOF] Use cdp-inject.js to generate the full script from original.json');
})();

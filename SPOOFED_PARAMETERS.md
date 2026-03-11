# FP Spoofer - Spoofed Parameters Documentation

**Extension Version:** 1.7.0  
**Last Updated:** March 11, 2026

This document lists all fingerprint parameters that are spoofed by the FP Spoofer Chrome extension from the profile data in `spoof.json`.

---

## Summary Statistics

| Category | Parameter Count | Status |
|----------|-----------------|--------|
| Navigator | 18 | ✅ Spoofed |
| Screen & Window | 20 | ✅ Spoofed |
| WebGL | 35+ | ✅ Spoofed |
| WebGL2 | 10 | ✅ Spoofed |
| Canvas | 3 | ✅ Spoofed (with noise) |
| Audio | 9 | ✅ Spoofed |
| Locale/Timezone | 7 | ✅ Spoofed |
| Plugins & MimeTypes | 2 | ✅ Spoofed |
| Fonts | 3 | ✅ Spoofed |
| Features | 50+ | ✅ Spoofed |
| Battery | 4 | ✅ Spoofed |
| Network | 5 | ✅ Spoofed |
| Media Queries | 18 | ✅ Spoofed |
| Permissions | 20+ | ✅ Spoofed |
| UserAgentData | 10 | ✅ Spoofed |
| Performance | 10+ | ✅ Spoofed |
| WebRTC | 3 | ✅ Spoofed |
| Media Devices | 1 | ✅ Spoofed |
| **TOTAL** | **200+** | ✅ |

---

## Detailed Parameter List

### 1. Navigator Properties

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| userAgent | `client.navigator.userAgent` | ✅ |
| appVersion | `client.navigator.appVersion` | ✅ |
| appName | `client.navigator.appName` | ✅ |
| appCodeName | `client.navigator.appCodeName` | ✅ |
| product | `client.navigator.product` | ✅ |
| productSub | `client.navigator.productSub` | ✅ |
| platform | `client.navigator.platform` | ✅ |
| vendor | `client.navigator.vendor` | ✅ |
| vendorSub | `client.navigator.vendorSub` | ✅ |
| language | `client.navigator.language` | ✅ |
| languages | `client.navigator.languages` | ✅ |
| cookieEnabled | `client.navigator.cookieEnabled` | ✅ |
| doNotTrack | `client.navigator.doNotTrack` | ✅ |
| hardwareConcurrency | `client.navigator.hardwareConcurrency` | ✅ |
| deviceMemory | `client.navigator.deviceMemory` | ✅ |
| maxTouchPoints | `client.navigator.maxTouchPoints` | ✅ |
| pdfViewerEnabled | `client.navigator.pdfViewerEnabled` | ✅ |
| webdriver | (forced false) | ✅ |
| javaEnabled() | `client.navigator.javaEnabled` | ✅ |

### 2. Screen & Window Properties

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| screen.width | `client.screen.width` | ✅ |
| screen.height | `client.screen.height` | ✅ |
| screen.availWidth | `client.screen.availWidth` | ✅ |
| screen.availHeight | `client.screen.availHeight` | ✅ |
| screen.colorDepth | `client.screen.colorDepth` | ✅ |
| screen.pixelDepth | `client.screen.pixelDepth` | ✅ |
| devicePixelRatio | `client.screen.devicePixelRatio` | ✅ |
| screen.orientation.type | `client.screen.orientationType` | ✅ |
| screen.orientation.angle | `client.screen.orientationAngle` | ✅ |
| innerWidth | `client.screen.innerWidth` | ✅ |
| innerHeight | `client.screen.innerHeight` | ✅ |
| outerWidth | `client.screen.outerWidth` | ✅ |
| outerHeight | `client.screen.outerHeight` | ✅ |
| screenX | `client.screen.screenX` | ✅ |
| screenY | `client.screen.screenY` | ✅ |
| pageXOffset | `client.screen.pageXOffset` | ✅ |
| pageYOffset | `client.screen.pageYOffset` | ✅ |
| scrollX | `client.screen.pageXOffset` | ✅ |
| scrollY | `client.screen.pageYOffset` | ✅ |
| isFullscreen | `client.screen.isFullscreen` | ✅ |

### 3. WebGL Parameters

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| vendor | `client.webgl.vendor` | ✅ |
| renderer | `client.webgl.renderer` | ✅ |
| version | `client.webgl.version` | ✅ |
| shadingLanguageVersion | `client.webgl.shadingLanguageVersion` | ✅ |
| UNMASKED_VENDOR_WEBGL | `client.webgl.unmaskedVendor` | ✅ |
| UNMASKED_RENDERER_WEBGL | `client.webgl.unmaskedRenderer` | ✅ |
| MAX_TEXTURE_SIZE | `client.webgl.maxTextureSize` | ✅ |
| MAX_CUBE_MAP_TEXTURE_SIZE | `client.webgl.maxCubeMapTextureSize` | ✅ |
| MAX_VIEWPORT_DIMS | `client.webgl.maxViewportDims` | ✅ |
| MAX_VERTEX_ATTRIBS | `client.webgl.maxVertexAttribs` | ✅ |
| MAX_VERTEX_UNIFORM_VECTORS | `client.webgl.maxVertexUniformVectors` | ✅ |
| MAX_FRAGMENT_UNIFORM_VECTORS | `client.webgl.maxFragmentUniformVectors` | ✅ |
| MAX_COMBINED_TEXTURE_IMAGE_UNITS | `client.webgl.maxCombinedTextureUnits` | ✅ |
| MAX_VERTEX_TEXTURE_IMAGE_UNITS | `client.webgl.maxVertexTextureUnits` | ✅ |
| MAX_TEXTURE_IMAGE_UNITS | `client.webgl.maxTextureImageUnits` | ✅ |
| MAX_RENDERBUFFER_SIZE | `client.webgl.maxRenderbufferSize` | ✅ |
| MAX_VARYING_VECTORS | `client.webgl.maxVaryingVectors` | ✅ |
| ALIASED_LINE_WIDTH_RANGE | `client.webgl.aliasedLineWidthRange` | ✅ |
| ALIASED_POINT_SIZE_RANGE | `client.webgl.aliasedPointSizeRange` | ✅ |
| RED_BITS | `client.webgl.redBits` | ✅ |
| GREEN_BITS | `client.webgl.greenBits` | ✅ |
| BLUE_BITS | `client.webgl.blueBits` | ✅ |
| ALPHA_BITS | `client.webgl.alphaBits` | ✅ |
| DEPTH_BITS | `client.webgl.depthBits` | ✅ |
| STENCIL_BITS | `client.webgl.stencilBits` | ✅ |
| SUBPIXEL_BITS | `client.webgl.subpixelBits` | ✅ |
| extensions | `client.webgl.extensions` | ✅ |
| extensionHash | `client.webgl.extensionHash` | ✅ |
| shaderRenderHash | `client.webgl.shaderRenderHash` | ✅ |

### 4. WebGL2 Parameters

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| supported | `client.webgl2.supported` | ✅ |
| MAX_SAMPLES | `client.webgl2.maxSamples` | ✅ |
| MAX_UNIFORM_BUFFER_BINDINGS | `client.webgl2.maxUniformBufferBindings` | ✅ |
| MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS | `client.webgl2.maxTransformFeedbackSeparateComponents` | ✅ |
| MAX_ELEMENT_INDEX | `client.webgl2.maxElementsVertices` | ✅ |
| MAX_3D_TEXTURE_SIZE | `client.webgl2.max3DTextureSize` | ✅ |
| MAX_ARRAY_TEXTURE_LAYERS | `client.webgl2.maxArrayTextureLayers` | ✅ |
| MAX_COLOR_ATTACHMENTS | `client.webgl2.maxColorAttachments` | ✅ |
| MAX_DRAW_BUFFERS | `client.webgl2.maxDrawBuffers` | ✅ |

### 5. Canvas Fingerprinting

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| Canvas 2D rendering | Noise added | ✅ |
| Canvas geometry hash | `client.canvas.geometry_hash` | ✅ |
| Winding rule | `client.canvas.winding_rule` | ✅ |
| toDataURL() | Noise injected | ✅ |
| getImageData() | Noise injected | ✅ |

### 6. Audio Fingerprinting

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| sampleRate | `client.audio.sampleRate` | ✅ |
| sampleRateLive | `client.audio.sampleRateLive` | ✅ |
| maxChannelCount | `client.audio.maxChannelCount` | ✅ |
| contextState | `client.audio.contextState` | ✅ |
| numberOfChannels | `client.audio.numberOfChannels` | ✅ |
| duration | `client.audio.duration` | ✅ |
| Audio processing output | Noise added | ✅ |
| BaseLatency | `client.audioLatency.baseLatency` | ✅ |
| OutputLatency | `client.audioLatency.outputLatency` | ✅ |

### 7. Locale & Timezone

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| Intl.DateTimeFormat().resolvedOptions().timeZone | `client.locale.timezone` | ✅ |
| Date.getTimezoneOffset() | `client.locale.timezoneOffset` | ✅ |
| Intl.NumberFormat locale | `client.locale.locale` | ✅ |
| Calendar | `client.locale.calendar` | ✅ |
| Numbering system | `client.locale.numberingSystem` | ✅ |
| toLocaleDateString() | `client.locale.localeDateString` | ✅ |
| toLocaleTimeString() | `client.locale.localeTimeString` | ✅ |

### 8. Plugins & MimeTypes

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| navigator.plugins | `client.plugins` | ✅ |
| navigator.mimeTypes | `client.mimeTypes` | ✅ |
| plugins.length | Derived from array | ✅ |
| mimeTypes.length | Derived from array | ✅ |

### 9. Fonts

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| Detected fonts | `client.fonts.detected` | ✅ |
| Font count | `client.fonts.count` | ✅ |
| Font metrics hash | `client.fonts.metricsHash` | ✅ |

### 10. Feature Detection

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| localStorage | `client.features.localStorage` | ✅ |
| sessionStorage | `client.features.sessionStorage` | ✅ |
| indexedDB | `client.features.indexedDB` | ✅ |
| openDatabase | `client.features.openDatabase` | ✅ |
| serviceWorker | `client.features.serviceWorker` | ✅ |
| webWorker | `client.features.webWorker` | ✅ |
| sharedWorker | `client.features.sharedWorker` | ✅ |
| webSocket | `client.features.webSocket` | ✅ |
| webRTC | `client.features.webRTC` | ✅ |
| bluetooth | `client.features.bluetooth` | ✅ |
| usb | `client.features.usb` | ✅ |
| nfc | `client.features.nfc` | ✅ |
| gamepad | `client.features.gamepad` | ✅ |
| geolocation | `client.features.geolocation` | ✅ |
| deviceMotion | `client.features.deviceMotion` | ✅ |
| deviceOrientation | `client.features.deviceOrientation` | ✅ |
| notifications | `client.features.notifications` | ✅ |
| speechSynthesis | `client.features.speechSynthesis` | ✅ |
| speechRecognition | `client.features.speechRecognition` | ✅ |
| touchEvents | `client.features.touchEvents` | ✅ |
| pointerEvents | `client.features.pointerEvents` | ✅ |
| wasm | `client.features.wasm` | ✅ |
| cryptoSubtle | `client.features.cryptoSubtle` | ✅ |
| (50+ more features) | Various | ✅ |

### 11. Battery API

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| charging | `client.battery.charging` | ✅ |
| chargingTime | `client.battery.chargingTime` | ✅ |
| dischargingTime | `client.battery.dischargingTime` | ✅ |
| level | `client.battery.level` | ✅ |

### 12. Network Information

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| effectiveType | `client.network.effectiveType` | ✅ |
| downlink | `client.network.downlink` | ✅ |
| rtt | `client.network.rtt` | ✅ |
| saveData | `client.network.saveData` | ✅ |
| type | `client.network.type` | ✅ |

### 13. Media Queries

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| prefers-color-scheme | `client.mediaQueries.darkMode/lightMode` | ✅ |
| prefers-reduced-motion | `client.mediaQueries.reducedMotion` | ✅ |
| prefers-reduced-transparency | `client.mediaQueries.reducedTransparency` | ✅ |
| prefers-contrast | `client.mediaQueries.highContrast` | ✅ |
| inverted-colors | `client.mediaQueries.invertedColors` | ✅ |
| color-gamut | `client.mediaQueries.colorGamut*` | ✅ |
| pointer (coarse/fine) | `client.mediaQueries.*Pointer` | ✅ |
| hover | `client.mediaQueries.hover` | ✅ |
| hdr | `client.mediaQueries.hdr` | ✅ |
| (10+ more queries) | Various | ✅ |

### 14. Permissions API

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| geolocation | `client.permissions.geolocation` | ✅ |
| notifications | `client.permissions.notifications` | ✅ |
| camera | `client.permissions.camera` | ✅ |
| microphone | `client.permissions.microphone` | ✅ |
| clipboard-read | `client.permissions.clipboard-read` | ✅ |
| clipboard-write | `client.permissions.clipboard-write` | ✅ |
| accelerometer | `client.permissions.accelerometer` | ✅ |
| gyroscope | `client.permissions.gyroscope` | ✅ |
| magnetometer | `client.permissions.magnetometer` | ✅ |
| midi | `client.permissions.midi` | ✅ |
| (10+ more permissions) | Various | ✅ |

### 15. User-Agent Client Hints (navigator.userAgentData)

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| brands | `client.architecture.uaData*` | ✅ |
| mobile | `client.architecture.uaDataMobile` | ✅ |
| platform | `client.architecture.uaDataPlatform` | ✅ |
| platformVersion | `client.architecture.uaDataPlatformVersion` | ✅ |
| architecture | `client.architecture.uaDataArch` | ✅ |
| bitness | `client.architecture.uaDataBitness` | ✅ |
| model | `client.architecture.uaDataModel` | ✅ |
| fullVersionList | High-entropy hints | ✅ |
| getHighEntropyValues() | All hints | ✅ |

### 16. Performance & Timing

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| performance.now() | Reduced precision | ✅ |
| performance.timeOrigin | `client.performance.timeOrigin` | ✅ |
| Timer resolution | `client.performance.timerResolutionMs` | ✅ |
| Navigation timing | `client.performance.navigationTiming` | ✅ |
| Memory info | `client.performance.memory` | ✅ |

### 17. WebRTC

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| Local IPs | `client.webrtc.ips` | ✅ (blocked) |
| IPv4 candidates | `client.webrtc.ipv4` | ✅ (blocked) |
| IPv6 candidates | `client.webrtc.ipv6` | ✅ (blocked) |

### 18. Chrome Object

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| chrome.runtime | Preserved/Created | ✅ |
| chrome.app | Mobile/Desktop specific | ✅ |
| chrome.csi | Desktop only | ✅ |
| chrome.loadTimes | Desktop only | ✅ |

### 19. Document Properties

| Property | JSON Path | Spoofed |
|----------|-----------|---------|
| document.characterSet | `client.document.characterSet` | ✅ |
| document.contentType | `client.document.contentType` | ✅ |
| document.visibilityState | `client.document.visibilityState` | ✅ |

---

## Bot Detection Evasion

| Detection Method | Evasion Status |
|------------------|----------------|
| navigator.webdriver | ✅ Always returns false |
| 'webdriver' in navigator | ✅ Returns false via Proxy |
| webdriver property descriptor | ✅ Hidden |
| cdc_ properties | ✅ Cleaned from window/document |
| domAutomationController | ✅ Removed |
| chrome.runtime existence | ✅ Preserved |
| Stack trace filtering | ✅ CDP/automation patterns filtered |
| toString() native detection | ✅ All functions appear native |

---

## Current Detection Status

| Signal | Description | Status |
|--------|-------------|--------|
| no_chrome_runtime | chrome.runtime missing | ⚠️ Being fixed in v1.7.0 |
| chrome_no_plugins | Empty plugins array on desktop | ⚠️ Being fixed in v1.7.0 |
| toString_error | Error when calling toString on spoofed functions | ⚠️ Being fixed in v1.7.0 |

---

## Notes

1. **Mobile Profile on Desktop**: When using a mobile profile (Android) on desktop Chrome, some inconsistencies are expected:
   - Desktop Chrome has plugins, mobile doesn't
   - Desktop Chrome has full chrome.runtime, mobile has limited API
   - Touch events work differently

2. **Canvas Noise**: Subtle noise is added to canvas operations to prevent canvas fingerprinting while maintaining visual consistency.

3. **WebGL**: Real WebGL context is used with spoofed parameters reported via getParameter() calls.

4. **Timing**: Performance.now() and related timing functions have reduced precision to prevent timing attacks.

---

*Generated for FP Spoofer v1.7.0*

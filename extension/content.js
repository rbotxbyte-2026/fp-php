// content.js - Comprehensive fingerprint spoofing
// Runs in MAIN world to access page's JavaScript context

// EMBEDDED DEFAULT PROFILE - Loaded synchronously to ensure config is available at document_start
// This solves the timing issue where background.js injects config AFTER content.js runs
const EMBEDDED_DEFAULT_PROFILE = {"server":{"ip":"2405:f600:8:e0a9:985c:f5c3:3402:a232","protocol":"HTTP/1.0","https":true,"port":"80","request_time":"2026-03-10 06:08:42","user_agent":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36","accept":"*/*","accept_language":"en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,gu;q=0.6","accept_encoding":"gzip, br","connection":"close","cache_control":null,"dnt":null,"upgrade_insecure":null,"referer":"https://botxbyte.com/fp.php","origin":"https://botxbyte.com","te":null,"priority":"u=1, i","sec_fetch_site":"same-origin","sec_fetch_mode":"cors","sec_fetch_dest":"empty","sec_fetch_user":null,"ch_ua":"\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"","ch_ua_mobile":"?1","ch_ua_platform":"\"Android\"","ch_ua_arch":null,"ch_ua_bitness":null,"ch_ua_full_version_list":null,"ch_ua_model":null,"x_forwarded_for":"2405:f600:8:e0a9:985c:f5c3:3402:a232, 172.70.230.48","x_real_ip":null,"via":null,"cf_connecting_ip":"2405:f600:8:e0a9:985c:f5c3:3402:a232","cf_ipcountry":"IN","cf_ray":"9da02576ecf41494-EWR","cdn_loop":"cloudflare; loops=1","x_forwarded_proto":"https","ja3_hash":null,"ja3_string":null,"ja4_hash":null,"tls_client_hello_hex":null,"all_headers":{"Cf-Visitor":"{\"scheme\":\"https\"}","Cf-Ipcountry":"IN","Cf-Connecting-Ip":"2405:f600:8:e0a9:985c:f5c3:3402:a232","Cdn-Loop":"cloudflare; loops=1","Cf-Ray":"9da02576ecf41494-EWR","Accept-Language":"en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,gu;q=0.6","Accept-Encoding":"gzip, br","Referer":"https://botxbyte.com/fp.php","Sec-Fetch-Dest":"empty","Sec-Fetch-Mode":"cors","Sec-Fetch-Site":"same-origin","Origin":"https://botxbyte.com","Accept":"*/*","Sec-Ch-Ua-Mobile":"?1","Content-Type":"application/json","Sec-Ch-Ua":"\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"","User-Agent":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36","X-Requested-With":"XMLHttpRequest","Sec-Ch-Ua-Platform":"\"Android\"","Priority":"u=1, i","Content-Length":"44862","Connection":"close","X-Forwarded-Proto":"https","X-Forwarded-For":"2405:f600:8:e0a9:985c:f5c3:3402:a232, 172.70.230.48","X-Server-Addr":"107.170.48.37","Host":"botxbyte.com","Authorization":""},"header_order":["Cf-Visitor","Cf-Ipcountry","Cf-Connecting-Ip","Cdn-Loop","Cf-Ray","Accept-Language","Accept-Encoding","Referer","Sec-Fetch-Dest","Sec-Fetch-Mode","Sec-Fetch-Site","Origin","Accept","Sec-Ch-Ua-Mobile","Content-Type","Sec-Ch-Ua","User-Agent","X-Requested-With","Sec-Ch-Ua-Platform","Priority","Content-Length","Connection","X-Forwarded-Proto","X-Forwarded-For","X-Server-Addr","Host","Authorization"],"header_count":27},"client":{"navigator":{"userAgent":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36","appVersion":"5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36","appName":"Netscape","appCodeName":"Mozilla","product":"Gecko","productSub":"20030107","platform":"Linux armv81","vendor":"Google Inc.","vendorSub":"","language":"en-IN","languages":["en-IN","en-GB","en-US","en","gu"],"cookieEnabled":true,"doNotTrack":null,"globalPrivacyControl":null,"hardwareConcurrency":8,"deviceMemory":8,"maxTouchPoints":5,"pdfViewerEnabled":null,"webdriver":false,"onLine":true,"javaEnabled":false,"cookieStore":true},"screen":{"width":384,"height":832,"availWidth":384,"availHeight":832,"colorDepth":24,"pixelDepth":24,"devicePixelRatio":2.8125,"orientationType":"portrait-primary","orientationAngle":0,"innerWidth":384,"innerHeight":699,"outerWidth":384,"outerHeight":832,"screenX":0,"screenY":0,"pageXOffset":0,"pageYOffset":0,"scrollbarWidth":0,"isFullscreen":false},"locale":{"timezone":"Asia/Calcutta","timezoneOffset":-330,"locale":"en-GB","calendar":"gregory","numberingSystem":"latn","localeDateString":"10/03/2026","localeTimeString":"11:38:40"},"canvas":{"hash":"20eb40bf","geometry_hash":"1c675ab6","winding_rule":true},"webgl":{"supported":true,"vendor":"WebKit","renderer":"WebKit WebGL","version":"WebGL 1.0 (OpenGL ES 2.0 Chromium)","shadingLanguageVersion":"WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)","unmaskedVendor":"Qualcomm","unmaskedRenderer":"Adreno (TM) 630","maxTextureSize":4096,"maxCubeMapTextureSize":4096,"maxViewportDims":[16384,16384],"maxVertexAttribs":32,"maxVertexUniformVectors":256,"maxFragmentUniformVectors":256,"maxCombinedTextureUnits":96,"maxVertexTextureUnits":16,"maxTextureImageUnits":16,"maxRenderbufferSize":16384,"maxVaryingVectors":31,"aliasedLineWidthRange":[1,8],"aliasedPointSizeRange":[1,1023],"redBits":8,"greenBits":8,"blueBits":8,"alphaBits":8,"depthBits":24,"stencilBits":0,"subpixelBits":4,"extensionCount":23,"extensionHash":"79cb5ed9","extensions":["ANGLE_instanced_arrays","EXT_blend_minmax","EXT_color_buffer_half_float","EXT_float_blend","EXT_texture_filter_anisotropic","EXT_sRGB","OES_element_index_uint","OES_fbo_render_mipmap","OES_standard_derivatives","OES_texture_float","OES_texture_float_linear","OES_texture_half_float","OES_texture_half_float_linear","OES_vertex_array_object","WEBGL_color_buffer_float","WEBGL_compressed_texture_astc","WEBGL_compressed_texture_etc","WEBGL_compressed_texture_etc1","WEBGL_debug_renderer_info","WEBGL_debug_shaders","WEBGL_depth_texture","WEBGL_lose_context","WEBGL_multi_draw"],"shaderRenderHash":"1280848c","rasterizationMethod":"hardware"},"webgl2":{"supported":true,"maxSamples":4,"maxUniformBufferBindings":84,"maxTransformFeedbackSeparateComponents":4,"maxElementsVertices":2147483647,"maxElementsIndices":2147483647,"max3DTextureSize":2048,"maxArrayTextureLayers":2048,"maxColorAttachments":8,"maxDrawBuffers":8},"audio":{"sampleRate":44100,"sampleRateLive":48000,"hash":"26005579","fullHash":"2d99ce51","value":124.08075643483608,"maxChannelCount":2,"contextState":"suspended","numberOfChannels":1,"duration":1},"plugins":[],"mimeTypes":[],"fonts":{"detected":["Arial","Courier","Courier New","Georgia","Tahoma","Times New Roman","Verdana","Helvetica","Baskerville","Palatino","Courier New"],"count":11,"metricsHash":"23adb0f9"},"features":{"localStorage":true,"sessionStorage":true,"indexedDB":true,"openDatabase":false,"caches":true,"serviceWorker":true,"webWorker":true,"sharedWorker":false,"webSocket":true,"webRTC":true,"fetch":true,"bluetooth":true,"usb":true,"nfc":false,"serial":true,"hid":false,"xr":true,"gamepad":true,"geolocation":true,"deviceMotion":true,"deviceOrientation":true,"ambientLight":false,"notifications":true,"speechSynthesis":true,"speechRecognition":true,"mediaSession":true,"paymentRequest":true,"credentials":true,"wakeLock":true,"pictureInPicture":true,"clipboard":true,"share":true,"contacts":true,"fileSystem":true,"eyeDropper":false,"pointerEvents":true,"touchEvents":true,"wasm":true,"wasmStreaming":true,"offscreenCanvas":true,"cryptoSubtle":true,"intersectionObserver":true,"resizeObserver":true,"mutationObserver":true,"broadcastChannel":true,"scheduler":true,"requestIdleCallback":true},"webrtc":{"ips":["192.168.1.123","2405:f600:8:e0a9:985c:f5c3:3402:a232","103.178.154.170"],"ipv4":["192.168.1.123","103.178.154.170"],"ipv6":["2405:f600:8:e0a9:985c:f5c3:3402:a232"]},"battery":{"charging":false,"chargingTime":null,"dischargingTime":3,"level":0.85},"mediaDevices":[{"kind":"audioinput","label":"(requires permission)","deviceId":null,"groupId":null},{"kind":"videoinput","label":"(requires permission)","deviceId":null,"groupId":null},{"kind":"audiooutput","label":"(requires permission)","deviceId":null,"groupId":null}],"network":{"effectiveType":"4g","downlink":1.55,"rtt":50,"saveData":false,"type":"wifi"},"mediaQueries":{"darkMode":false,"lightMode":true,"reducedMotion":false,"reducedTransparency":false,"reducedData":false,"highContrast":false,"invertedColors":false,"hdr":false,"coarsePointer":true,"finePointer":false,"noPointer":false,"hover":false,"anyHover":false,"colorGamutSRGB":true,"colorGamutP3":false,"colorGamutRec2020":false,"print":false,"monochrome":false,"overflowInline":true},"permissions":{"ambient-light-sensor":"unsupported","window-placement":"unsupported","geolocation":"prompt","notifications":"prompt","camera":"prompt","microphone":"prompt","clipboard-read":"prompt","clipboard-write":"granted","payment-handler":"granted","background-sync":"granted","persistent-storage":"prompt","accelerometer":"granted","gyroscope":"granted","magnetometer":"granted","midi":"prompt","background-fetch":"granted","nfc":"prompt","screen-wake-lock":"granted","idle-detection":"prompt","display-capture":"prompt","storage-access":"granted"},"speechVoices":[],"document":{"characterSet":"UTF-8","contentType":"text/html","referrer":"","visibilityState":"visible","historyLength":2,"cookieCount":0,"domainLookupTime":null,"URL":"https://botxbyte.com/fp.php","protocol":"https:","host":"botxbyte.com"},"math":{"tan_neg1e300":-1.4214488238747245,"sin_1":0.8414709848078965,"cos_1":0.5403023058681398,"atan2":1.1071487177940904,"exp_1":2.718281828459045,"log_pi":1.1447298858494002,"sqrt_2":1.4142135623730951,"pow_pi":1.9275814160560206e-50,"acos":1.4470237543681796,"asin":0.12377257242671708,"sinh_1":1.1752011936438014,"cosh_1":1.5430806348152437,"tanh_1":0.7615941559557649,"log2_pi":1.6514961294723187,"log10_pi":0.4971498726941338,"cbrt_2":1.2599210498948732,"hypot":5,"fround":1.3370000123977661,"clz32":31,"imul":12,"trunc":-1,"sign":-1,"expm1":1.718281828459045,"log1p":0.6931471805599453},"performance":{"timerResolutionMs":0.1,"timerGranularity":"coarse_100us","timerSamples":[0.1,0.1,0.1,0.2,0.1,0.1,0.1,0.1,0.1,0.1],"navigationTiming":{"type":"navigate","redirectCount":0,"domInteractive":1186,"domContentLoaded":1198,"loadEvent":1199,"ttfb":500,"transferSize":52093,"encodedBodySize":51793},"memory":{"jsHeapSizeLimit":1130000000,"totalJSHeapSize":10000000,"usedJSHeapSize":10000000},"timeOrigin":1773122913591.5,"now":6798.399999856949},"stackTrace":{"engine":"V8(Chrome/Node)","sample":"Error: fp |     at getStackTrace (https://botxbyte.com/fp.php:694:21) |     at collect (https://botxbyte.com/fp.php:4510:21)","lines":4},"internals":{"toStringTags":{"Window":"[object Window]","Document":"[object HTMLDocument]","Navigator":"[object Navigator]","Screen":"[object Screen]","Location":"[object Location]","History":"[object History]"},"windowProto":"Window","docProto":"HTMLDocument","nativeChecks":{"navigator.userAgent getter":"native","navigator.platform getter":"native","navigator.hardwareConcurrency":"native"},"iteratorSymbol":"symbol","asyncIterator":"symbol"},"cssSupport":{"grid":true,"flexbox":true,"customProperties":true,"containerQueries":true,"hasSelector":true,"subgrid":true,"cascade":false,"colorMix":true,"nesting":true,"scrollTimeline":true,"viewTimeline":true,"anchorPosition":true,"startingStyle":false,"math":true,"clamp":true,"aspectRatio":true,"gap":true,"backdropFilter":true,"contain":true,"contentVisibility":true,"overscrollBehavior":true,"scrollBehavior":true},"cssComputedStyles":{"fontFamily":"\"Courier New\", monospace","fontSize":"16px","color":"rgb(201, 209, 217)","backgroundColor":"rgba(0, 0, 0, 0)","lineHeight":"normal","boxSizing":"border-box","nativeScrollbarWidth":0},"cpu":{"hardwareConcurrency":8,"deviceMemory":8,"wasm_supported":true,"wasm_simd":true,"wasm_threads":false,"wasm_bulk_memory":true,"wasm_sat_float":false,"estimated_arch":"ARM64_NEON"},"architecture":{"byte":-1,"method":"int8_probe","float32Byte0":0,"wasmMemRead":"error","uaDataArch":null,"uaDataBitness":null,"uaDataPlatform":"Android","uaDataPlatformVersion":"11.0.0","uaDataModel":"ONEPLUS A6010"},"refreshRate":{"measured_fps":60,"snapped_hz":60,"avg_frame_ms":16.656},"videoDecoder":{"supported":true,"codecs":{"h264":"supported","h265":"supported","vp8":"supported","vp9":"supported","av1":"supported"}},"behavioral":{"mouse":null,"keyboard":null,"scroll":{"eventCount":0,"totalDelta":0,"sample":[]},"clicks":{"count":0,"avgPressure":null,"avgInterval":null},"touch":{"radii":[],"pressures":[]},"sensors":{"motion":{"x":0,"y":0,"z":-0.1,"gx":-0.8,"gy":8.6,"gz":4.5,"interval":16},"orientation":{"alpha":0,"beta":61.5,"gamma":9.200000000000001,"absolute":false}},"sessionDuration":6192},"fontPreferences":{"default":455.95556640625,"apple":455.95556640625,"sans":455.95556640625,"serif":498.6333312988281,"mono":377.8166809082031,"system":455.95556640625,"min":9.449999809265137},"webglPrecisions":{"contextAttributes":{"alpha":true,"antialias":true,"depth":true,"desynchronized":false,"failIfMajorPerformanceCaveat":false,"powerPreference":"default","premultipliedAlpha":true,"preserveDrawingBuffer":false,"stencil":false,"xrCompatible":false},"contextAttributesHash":"13f1d07c","shaderPrecisions":{"VERTEX_LOW_FLOAT":{"rangeMin":127,"rangeMax":127,"precision":23},"VERTEX_MEDIUM_FLOAT":{"rangeMin":127,"rangeMax":127,"precision":23},"VERTEX_HIGH_FLOAT":{"rangeMin":127,"rangeMax":127,"precision":23},"VERTEX_LOW_INT":{"rangeMin":31,"rangeMax":31,"precision":0},"VERTEX_MEDIUM_INT":{"rangeMin":31,"rangeMax":31,"precision":0},"VERTEX_HIGH_INT":{"rangeMin":31,"rangeMax":31,"precision":0},"FRAGMENT_LOW_FLOAT":{"rangeMin":15,"rangeMax":15,"precision":10},"FRAGMENT_MEDIUM_FLOAT":{"rangeMin":15,"rangeMax":15,"precision":10},"FRAGMENT_HIGH_FLOAT":{"rangeMin":127,"rangeMax":127,"precision":23},"FRAGMENT_LOW_INT":{"rangeMin":15,"rangeMax":15,"precision":0},"FRAGMENT_MEDIUM_INT":{"rangeMin":15,"rangeMax":15,"precision":0},"FRAGMENT_HIGH_INT":{"rangeMin":31,"rangeMax":31,"precision":0}},"shaderPrecisionsHash":"510ff2a0","extensionPresenceHash":"46f092d0"},"audioLatency":{"baseLatency":0.003,"outputLatency":0,"sampleRate":48000,"state":"suspended","maxChannelCount":2,"channelCount":2,"channelInterpretation":"speakers"},"domBlockers":{"detected":false,"blockedCount":0,"blockedClasses":[],"allResults":{"ad-banner":false,"ad-unit":false,"adsbox":false,"ad-slot":false,"adsbygoogle":false,"banner_ad":false,"pub_300x250":false,"pub_300x250m":false,"pub_728x90":false,"text-ad":false,"textAd":false,"text_ad":false,"text_ads":false,"textads":false,"sponsoredMidArticle":false,"mmnetwork-ad":false,"ad-text":false,"googlead":false,"GoogleActiveViewElement":false,"#AdHeader":false,"#AdContainer":false,"#ad-container":false,"#advertise":false,"#adbar":false}},"emojiBoundingBox":{"width":159.711,"height":150.044,"top":-9999,"bottom":-9848.956,"left":-9999,"right":-9839.289},"mathmlBoundingBox":{"width":29.222,"height":17.978,"supported":true},"screenFrame":{"top":0,"left":0,"right":0,"bottom":0,"availTop":null,"availLeft":null},"colorProfile":{"colorGamutString":"srgb","contrastPreference":0,"monochromeDepth":0,"colorDepth":24,"hdrCapability":false},"vendorFlavors":[],"navigatorExtra":{"oscpu":null,"cpuClass":null,"buildID":null,"productSub":"20030107","taintEnabled":null,"uaData_brands":[{"brand":"Not:A-Brand","version":"99"},{"brand":"Google Chrome","version":"145"},{"brand":"Chromium","version":"145"}],"uaData_mobile":true,"uaData_platform":"Android","privateClickMeasurement":false,"webkitMessageHandlers":null,"connection_saveData":false,"mimeTypesLength":0,"pluginsLength":0},"incognito":{"isPrivate":false,"method":null,"confidence":"low"},"tampering":{"anomalyScore":35,"signals":["no_chrome_runtime","chrome_no_plugins","toString_error"],"webdriver":false,"inIframe":false,"devtoolsOpen":false,"antiDetectBrowser":false},"mathHash":"100ac6dd","webglExtra":{"unsupportedExtensions":["EXT_clip_control","EXT_color_buffer_float","EXT_depth_clamp","EXT_disjoint_timer_query","EXT_disjoint_timer_query_webgl2","EXT_frag_depth","EXT_polygon_offset_clamp","EXT_shader_texture_lod","EXT_texture_compression_bptc","EXT_texture_compression_rgtc","EXT_texture_mirror_clamp_to_edge","KHR_parallel_shader_compile","OES_draw_buffers_indexed","WEBGL_blend_func_extended","WEBGL_clip_cull_distance","WEBGL_compressed_texture_atc","WEBGL_compressed_texture_pvrtc","WEBGL_compressed_texture_s3tc","WEBGL_compressed_texture_s3tc_srgb","WEBGL_draw_buffers","WEBGL_polygon_mode","WEBKIT_WEBGL_compressed_texture_pvrtc"],"unsupportedCount":22,"allParametersHash":"47e9739e"},"dateTimeLocale":{"numberFormatLocale":"en-GB","numberingSystem":"latn","formattedTestNumber":"1,234,567.89","dateTimeLocale":"en-GB","dateTimeCalendar":"gregory","dateTimeTimeZone":"Asia/Calcutta","relativeTimeLocale":"en-GB","collatorLocale":"en-GB","pluralRulesLocale":"en-GB","localeHash":"32e75347"},"multiMonitor":{"isExtended":false,"getScreenDetailsAPI":true,"screenCount":null,"screens":null},"pwaInfo":{"displayMode":"browser","isStandalone":false,"navigatorStandalone":false,"isInstalled":false,"launchQueue":true,"getInstalledRelatedApps":true},"mediaCapabilities":{"supported":true,"codecs":{"audio/mp4; codecs=\"mp4a.40.2\"":{"supported":true,"smooth":true,"powerEfficient":true},"audio/webm; codecs=\"opus\"":{"supported":true,"smooth":true,"powerEfficient":true},"video/mp4; codecs=\"avc1.42E01E\"":{"supported":true,"smooth":true,"powerEfficient":true},"video/webm; codecs=\"vp09.00.10.08\"":{"supported":true,"smooth":true,"powerEfficient":true},"video/mp4; codecs=\"av01.0.05M.08\"":{"supported":true,"smooth":true,"powerEfficient":false}}},"rtcCapabilities":{"supported":true,"videoCodecs":[{"mimeType":"video/VP8","clockRate":90000,"sdpFmtpLine":null},{"mimeType":"video/rtx","clockRate":90000,"sdpFmtpLine":null},{"mimeType":"video/AV1","clockRate":90000,"sdpFmtpLine":"level-idx=5;profile=0;tier=0"},{"mimeType":"video/VP9","clockRate":90000,"sdpFmtpLine":"profile-id=0"},{"mimeType":"video/H264","clockRate":90000,"sdpFmtpLine":"level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f"},{"mimeType":"video/H264","clockRate":90000,"sdpFmtpLine":"level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f"},{"mimeType":"video/H264","clockRate":90000,"sdpFmtpLine":"level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f"},{"mimeType":"video/H264","clockRate":90000,"sdpFmtpLine":"level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f"},{"mimeType":"video/H265","clockRate":90000,"sdpFmtpLine":"level-id=150;profile-id=1;tier-flag=0;tx-mode=SRST"},{"mimeType":"video/red","clockRate":90000,"sdpFmtpLine":null},{"mimeType":"video/ulpfec","clockRate":90000,"sdpFmtpLine":null}],"audioCodecs":[{"mimeType":"audio/opus","clockRate":48000,"channels":2},{"mimeType":"audio/red","clockRate":48000,"channels":2},{"mimeType":"audio/G722","clockRate":8000,"channels":1},{"mimeType":"audio/PCMU","clockRate":8000,"channels":1},{"mimeType":"audio/PCMA","clockRate":8000,"channels":1},{"mimeType":"audio/CN","clockRate":8000,"channels":1},{"mimeType":"audio/telephone-event","clockRate":48000,"channels":1},{"mimeType":"audio/telephone-event","clockRate":8000,"channels":1}],"videoCount":11,"audioCount":8},"perfObserverTypes":{"supported":true,"entryTypes":["element","event","first-input","largest-contentful-paint","layout-shift","long-animation-frame","longtask","mark","measure","navigation","paint","resource","visibility-state"],"count":13,"hash":"45e14c21"},"featurePolicy":{"supported":true,"allowedFeatures":["geolocation","ch-ua-full-version-list","cross-origin-isolated","screen-wake-lock","on-device-speech-recognition","publickey-credentials-get","shared-storage-select-url","ch-ua-arch","bluetooth","ch-prefers-reduced-transparency","deferred-fetch","usb","ch-save-data","publickey-credentials-create","shared-storage","deferred-fetch-minimal","run-ad-auction","ch-downlink","ch-ua-form-factors","otp-credentials","payment","ch-ua","ch-ua-model","ch-ect","autoplay","camera","private-state-token-issuance","digital-credentials-get","accelerometer","ch-ua-platform-version","idle-detection","private-aggregation","interest-cohort","ch-viewport-height","ch-ua-platform","midi","ch-ua-full-version","xr-spatial-tracking","clipboard-read","gamepad","display-capture","keyboard-map","join-ad-interest-group","aria-notify","local-network","ch-ua-high-entropy-values","ch-width","ch-prefers-reduced-motion","browsing-topics","encrypted-media","local-network-access","gyroscope","serial","ch-rtt","ch-ua-mobile","window-management","unload","ch-dpr","ch-prefers-color-scheme","ch-ua-wow64","attribution-reporting","fullscreen","identity-credentials-get","private-state-token-redemption","ch-ua-bitness","storage-access","sync-xhr","ch-device-memory","ch-viewport-width","picture-in-picture","magnetometer","loopback-network","clipboard-write","microphone"],"allowedCount":74,"featureStates":{"camera":true,"microphone":true,"geolocation":true,"payment":true,"usb":true,"bluetooth":true,"accelerometer":true,"gyroscope":true,"magnetometer":true,"fullscreen":true,"picture-in-picture":true,"autoplay":true,"encrypted-media":true,"midi":true,"screen-wake-lock":true,"xr-spatial-tracking":true,"ambient-light-sensor":false,"battery":false,"document-domain":false,"sync-xhr":true,"clipboard-read":true,"clipboard-write":true}},"apiPresence":{"webTransport":true,"webRTC_insertable_streams":true,"compressionStream":true,"decompressionStream":true,"trustedTypes":true,"reportingObserver":true,"navigationAPI":true,"sanitizerAPI":false,"schedulerPostTask":true,"taskController":true,"idleDetector":true,"documentPiP":false,"storageManager":true,"fileSystemAccess":true,"accessHandle":true,"cssHoudini":true,"audioWorklet":true,"abortSignalAny":true,"abortSignalTimeout":true,"structuredClone":true,"webLocks":true,"keyboardAPI":true,"presentationAPI":true,"midiAccess":true,"digitalGoods":true,"userActivation":true,"windowControlsOverlay":true,"cookieStore":true,"backgroundFetch":true,"periodicSync":true,"contentIndex":true,"paymentHandler":false,"canvasRoundRect":true,"canvasReset":true,"canvasFilter":true,"fontsReadyAPI":true,"fontFaceSet":true,"cssTypedOM":true,"cssLayoutWorklet":false,"eyeDropper":false,"getScreenDetails":true,"virtualKeyboard":true,"handwriting":false,"ink":true,"serial":true,"hid":false,"userAgentData":true},"userActivation":{"supported":true,"isActive":false,"hasBeenActive":false},"networkExtended":{"effectiveType":"4g","downlink":1.55,"downlinkMax":null,"rtt":50,"saveData":false,"type":"wifi","onchange":true},"eventCounts":{"supported":true,"counts":{"pointerdown":0,"touchend":0,"input":0,"keydown":0,"mouseleave":0,"mouseenter":0,"drop":0,"beforeinput":0,"pointerenter":0,"dragend":0,"pointercancel":0,"compositionupdate":0,"mousedown":0,"dragleave":0,"dragover":0,"mouseup":0,"pointerover":0,"lostpointercapture":0,"mouseover":0,"gotpointercapture":0,"dblclick":0,"keyup":0,"keypress":0,"pointerup":0,"compositionstart":0,"auxclick":0,"dragstart":0,"touchstart":0,"compositionend":0,"pointerout":0,"dragenter":0,"touchcancel":0,"click":0,"contextmenu":0,"mouseout":0,"pointerleave":0},"totalEvents":0},"uaHighEntropy":{"supported":true,"architecture":null,"bitness":null,"brands":[{"brand":"Not:A-Brand","version":"99"},{"brand":"Google Chrome","version":"145"},{"brand":"Chromium","version":"145"}],"fullVersionList":[{"brand":"Not:A-Brand","version":"99.0.0.0"},{"brand":"Google Chrome","version":"145.0.7632.159"},{"brand":"Chromium","version":"145.0.7632.159"}],"mobile":true,"model":"ONEPLUS A6010","platform":"Android","platformVersion":"11.0.0","uaFullVersion":"145.0.7632.159"},"storageInfo":{"storageEstimate":{"quota":69430758604,"usage":0,"usageDetails":[]},"persistentStorage":false,"hasStorageAccess":true,"cookieStoreSupported":true},"fontLoading":{"supported":true,"readyTimeMs":0.1,"status":"loaded","loadedFamilies":0},"hypervisorProbe":{"mean_ms":0.085,"stdDev_ms":0.0823,"min_ms":0,"max_ms":0.2,"cv_percent":96.84,"possibleVM":true},"memoryPattern":{"supported":true,"allocations":[{"pages":1,"sizeKB":64,"allocMs":0.4,"touchMs":0},{"pages":10,"sizeKB":640,"allocMs":0,"touchMs":0.1},{"pages":50,"sizeKB":3200,"allocMs":0,"touchMs":0.1},{"pages":100,"sizeKB":6400,"allocMs":0.1,"touchMs":0.1},{"pages":256,"sizeKB":16384,"allocMs":0,"touchMs":0}],"patternHash":"2026c7bb"},"fontsByCSS":{"detected":["Arial","Georgia","Helvetica","Verdana","Times New Roman","Courier New","Baskerville"],"count":7,"method":"css_offsetWidth"},"extendedPermissions":{"supported":true,"permissions":{"push":"unsupported","speaker-selection":"unsupported","local-fonts":"unsupported","captured-surface-control":"unsupported","keyboard-lock":"unsupported","pointer-lock":"unsupported","fullscreen":"unsupported","window-management":"denied"}},"securityContext":{"crossOriginIsolated":false,"isSecureContext":true,"originAgentCluster":true,"documentPrerendering":false,"credentialless":false,"hasPrivateToken":true,"openDatabaseStatus":"absent","canvasColorSpaceP3":true,"canvasColorSpaceSRGB":true},"visualViewport":{"supported":true,"width":384,"height":699.38,"offsetLeft":0,"offsetTop":0,"pageLeft":0,"pageTop":0,"scale":1},"mediaConstraints":{"supported":true,"constraints":{"aspectRatio":true,"autoGainControl":true,"brightness":true,"channelCount":true,"colorTemperature":true,"contrast":true,"deviceId":true,"displaySurface":true,"echoCancellation":true,"exposureCompensation":true,"exposureMode":true,"exposureTime":true,"facingMode":true,"focusDistance":true,"focusMode":true,"frameRate":true,"groupId":true,"height":true,"iso":true,"latency":true,"noiseSuppression":true,"pan":true,"pointsOfInterest":true,"resizeMode":true,"restrictOwnAudio":true,"sampleRate":true,"sampleSize":true,"saturation":true,"sharpness":true,"suppressLocalAudioPlayback":true,"tilt":true,"torch":true,"voiceIsolation":true,"whiteBalanceMode":true,"width":true,"zoom":true},"count":36,"hash":"6ff3cba5"},"jsEngine":{"weakRef":true,"finalizationRegistry":true,"atomics":true,"sharedArrayBuffer":false,"readableStream":true,"writableStream":true,"transformStream":true,"byobReader":true,"logicalAssign":true,"optionalChaining":true,"nullishCoalescing":true,"privateClassFields":true,"arrayAt":true,"arrayFindLast":true,"objectHasOwn":true,"promiseAny":true,"structuredClone":true,"presentErrorTypes":["Error","EvalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError","AggregateError"],"cryptoRandomUUID":true,"queueMicrotask":true,"reportError":true,"adoptedStyleSheets":true,"interactionCount":true},"audioBaseLatencySimple":0.003,"contrastPreference":0,"monochromeDepth":0,"privateClickMeasurement":false,"fontsSubset":{"detected":["Arial","Courier New","Georgia","Helvetica","Times New Roman","Verdana"],"count":6,"hash":"60055cb7","testedSubset":["Arial Unicode MS","Gill Sans","Helvetica Neue","Menlo","Arial","Courier New","Georgia","Helvetica","Times New Roman","Verdana","Monaco","Lucida Console","Consolas","Segoe UI","SF Pro"]},"invertedColors":false,"touchSupport":{"maxTouchPoints":5,"touchEvent":true,"touchStart":true},"screenResolution":[832,384],"screenFrameArray":[0,0,0,0],"reducedTransparency":false,"reducedMotion":false,"forcedColors":false,"cookiesEnabled":true,"colorGamut":"srgb","hdr":false,"svgRendering":{"supported":true,"measurements":{"pathLength":375.2419,"pathBBox":{"x":10,"y":45,"width":340,"height":70},"rectBBox":{"x":10,"y":10,"width":50,"height":50},"ellipseBBox":{"x":50,"y":70,"width":100,"height":60},"textBBox":{"x":10,"y":135.07,"width":77.63,"height":19.2}},"hash":"8c74807"},"htmlElement":{"protoChain":["HTMLDivElement","HTMLElement","Element","Node","EventTarget","Object"],"features":{"protoChain":["HTMLDivElement","HTMLElement","Element","Node","EventTarget","Object"],"shadowRoot":true,"animate":true,"getAnimations":true,"computedStyleMap":true,"attributeStyleMap":true,"part":true,"slot":true,"assignedSlot":true,"inputShowPicker":true,"inputCheckValidity":true,"inputSelectionStart":true,"customElements":true,"customElementsDefine":true,"fragmentAppend":true,"fragmentPrepend":true,"fragmentReplaceChildren":true},"hash":"69fbc435"},"domRect":{"rects":[{"idx":0,"width":100,"height":50,"x":-9999,"y":-9999},{"idx":1,"width":100.5,"height":50.5,"x":-9999,"y":-9949},{"idx":2,"width":106.0667,"height":106.0667,"x":-10002.0332,"y":-9926.5332},{"idx":3,"width":150,"height":75,"x":-10024,"y":-9861},{"idx":4,"width":87.1889,"height":17.4222,"x":-9999,"y":-9798.5},{"idx":5,"width":63.2944,"height":18.8444,"x":-9911.8115,"y":-9798.5},{"idx":6,"width":76.8167,"height":18.8444,"x":-9848.5166,"y":-9798.5},{"idx":7,"width":100,"height":50,"x":-9999,"y":-9778.9443},{"idx":8,"width":120,"height":70,"x":-9999,"y":-9728.9443},{"idx":9,"width":100,"height":50,"x":-9989,"y":-9648.9443}],"hash":"62948c8"},"contentWindow":{"features":{"hasContentWindow":true,"contentWindowType":"[object Object]","cwLocation":"object","cwDocument":"blocked","cwNavigator":"blocked","cwParent":true,"cwTop":true,"cwFrameElement":"blocked","hasContentDocument":false,"srcdocSupport":true,"sandboxSupport":true,"sandboxTokens":[],"lazyLoadSupport":true,"referrerPolicySupport":true,"allowSupport":true,"cspSupport":true},"hash":"4a35cfd9"},"consoleErrors":{"errors":[{"idx":0,"name":"Error","messageLength":4,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":1,"name":"TypeError","messageLength":9,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":2,"name":"RangeError","messageLength":10,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":3,"name":"SyntaxError","messageLength":11,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":4,"name":"ReferenceError","messageLength":8,"hasStack":true,"stackLines":7,"stackFormat":"v8"},{"idx":5,"name":"URIError","messageLength":8,"hasStack":true,"stackLines":7,"stackFormat":"v8"}],"evalError":{"name":"SyntaxError","hasLineNumber":false,"hasColumnNumber":false,"hasFileName":false},"jsonError":{"name":"SyntaxError","messagePattern":"Expected property na"},"funcError":{"name":"SyntaxError","messagePattern":"Unexpected token '{'"},"hash":"5ee10672"},"textMetrics":{"measurements":[{"font":"Arial","size":12,"width":343.9629,"actualBoundingBoxAscent":11,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":344.1738,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Arial","size":16,"width":458.6172,"actualBoundingBoxAscent":14,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":458.8984,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Arial","size":24,"width":687.9258,"actualBoundingBoxAscent":21,"actualBoundingBoxDescent":5,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":687.3477,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6},{"font":"Times New Roman","size":12,"width":366.627,"actualBoundingBoxAscent":10,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":366.875,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Times New Roman","size":16,"width":488.8359,"actualBoundingBoxAscent":13,"actualBoundingBoxDescent":4,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":488.5,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Times New Roman","size":24,"width":733.2539,"actualBoundingBoxAscent":18,"actualBoundingBoxDescent":6,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":732.75,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6},{"font":"Courier New","size":12,"width":428.6719,"actualBoundingBoxAscent":9,"actualBoundingBoxDescent":2,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":428.4063,"fontBoundingBoxAscent":9,"fontBoundingBoxDescent":4},{"font":"Courier New","size":16,"width":571.5625,"actualBoundingBoxAscent":10,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":570.875,"fontBoundingBoxAscent":12,"fontBoundingBoxDescent":5},{"font":"Courier New","size":24,"width":857.3438,"actualBoundingBoxAscent":17,"actualBoundingBoxDescent":5,"actualBoundingBoxLeft":-1,"actualBoundingBoxRight":855.8125,"fontBoundingBoxAscent":20,"fontBoundingBoxDescent":7},{"font":"Georgia","size":12,"width":366.627,"actualBoundingBoxAscent":10,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":366.875,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Georgia","size":16,"width":488.8359,"actualBoundingBoxAscent":13,"actualBoundingBoxDescent":4,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":488.5,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Georgia","size":24,"width":733.2539,"actualBoundingBoxAscent":18,"actualBoundingBoxDescent":6,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":732.75,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6},{"font":"Verdana","size":12,"width":343.9629,"actualBoundingBoxAscent":11,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":344.1738,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Verdana","size":16,"width":458.6172,"actualBoundingBoxAscent":14,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":458.8984,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Verdana","size":24,"width":687.9258,"actualBoundingBoxAscent":21,"actualBoundingBoxDescent":5,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":687.3477,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6},{"font":"Helvetica","size":12,"width":343.9629,"actualBoundingBoxAscent":11,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":344.1738,"fontBoundingBoxAscent":11,"fontBoundingBoxDescent":3},{"font":"Helvetica","size":16,"width":458.6172,"actualBoundingBoxAscent":14,"actualBoundingBoxDescent":3,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":458.8984,"fontBoundingBoxAscent":15,"fontBoundingBoxDescent":4},{"font":"Helvetica","size":24,"width":687.9258,"actualBoundingBoxAscent":21,"actualBoundingBoxDescent":5,"actualBoundingBoxLeft":null,"actualBoundingBoxRight":687.3477,"fontBoundingBoxAscent":22,"fontBoundingBoxDescent":6}],"count":18,"hash":"44b5b7c8"},"applePayCapability":{"apiAvailable":false,"canMakePayments":null,"canMakePaymentsWithActiveCard":null,"merchantIdentifier":null,"paymentRequestAPI":true,"applePayPaymentMethod":false,"paymentRequestSupported":true},"serviceWorker":{"supported":true,"controller":false,"ready":"timeout","state":null,"features":{"pushManager":true,"sync":true,"periodicSync":true,"backgroundFetch":true,"cacheAPI":true,"notifications":true,"paymentManager":true,"cookieStore":true,"getRegistrations":true}},"cssMediaQueriesExtended":{"queries":{"prefers-color-scheme: dark":false,"prefers-color-scheme: light":true,"prefers-reduced-motion: reduce":false,"prefers-reduced-motion: no-preference":true,"prefers-contrast: more":false,"prefers-contrast: less":false,"prefers-contrast: no-preference":true,"prefers-reduced-transparency: reduce":false,"prefers-reduced-transparency: no-preference":true,"inverted-colors: inverted":false,"inverted-colors: none":false,"forced-colors: active":false,"forced-colors: none":true,"any-hover: hover":false,"any-hover: none":true,"hover: hover":false,"hover: none":true,"any-pointer: fine":false,"any-pointer: coarse":true,"any-pointer: none":false,"pointer: fine":false,"pointer: coarse":true,"pointer: none":false,"display-mode: fullscreen":false,"display-mode: standalone":false,"display-mode: minimal-ui":false,"display-mode: browser":true,"orientation: portrait":true,"orientation: landscape":false,"color-gamut: srgb":true,"color-gamut: p3":false,"color-gamut: rec2020":false,"dynamic-range: standard":true,"dynamic-range: high":false,"update: fast":true,"update: slow":false,"update: none":false,"overflow-block: scroll":true,"overflow-inline: scroll":true,"scripting: enabled":true,"scripting: none":false},"trueCount":17,"hash":"2e0e2486"},"webgpu":{"supported":true,"adapter":null},"genericSensors":{"accelerometer":{"available":true,"reading":{"x":-0.4,"y":8.8,"z":4.1000000000000005},"activated":true},"gyroscope":{"available":true,"reading":{"x":0.010471975511965978,"y":0,"z":0},"activated":true},"magnetometer":{"available":false},"ambientLightSensor":{"available":false},"linearAccelerationSensor":{"available":true,"reading":{"x":0,"y":0,"z":0},"activated":true},"absoluteOrientationSensor":{"available":true,"quaternion":[0.4469756962409582,-0.29137979061481734,-0.49581731954279723,0.6851829903263592],"activated":true},"relativeOrientationSensor":{"available":true,"quaternion":[0,0,0,1],"activated":true},"gravitySensor":{"available":true,"reading":{"x":-0.4,"y":8.9,"z":4.2},"activated":true}},"gamepads":{"supported":true,"connectedCount":0,"gamepads":[]},"keyboardLayout":{"supported":true,"layout":[],"entryCount":0,"hash":"0"},"drm":{"supported":true,"keySystems":{"ClearKey":{"available":true,"keySystem":"org.w3.clearkey","initDataTypes":["cenc","keyids","webm"],"videoCapabilities":[{"contentType":"video/mp4; codecs=\"avc1.42E01E\"","robustness":null},{"contentType":"video/webm; codecs=\"vp09.00.10.08\"","robustness":null}],"audioCapabilities":[{"contentType":"audio/mp4; codecs=\"mp4a.40.2\"","robustness":null}],"distinctiveIdentifier":"not-allowed","persistentState":"not-allowed","sessionTypes":["temporary"]},"PlayReady":{"available":false},"PlayReadySL3000":{"available":false},"FairPlay":{"available":false},"FairPlay1":{"available":false},"FairPlay2":{"available":false},"FairPlay3":{"available":false},"PrimeTime":{"available":false},"Widevine":{"available":true,"keySystem":"com.widevine.alpha","initDataTypes":["cenc","webm"],"videoCapabilities":[{"contentType":"video/mp4; codecs=\"avc1.42E01E\"","robustness":null},{"contentType":"video/webm; codecs=\"vp09.00.10.08\"","robustness":null}],"audioCapabilities":[{"contentType":"audio/mp4; codecs=\"mp4a.40.2\"","robustness":null}],"distinctiveIdentifier":"required","persistentState":"required","sessionTypes":["temporary"]}},"availableCount":2,"availableNames":["ClearKey","Widevine"],"hash":"7c73cce7"},"webCodecs":{"videoDecoder":true,"videoEncoder":true,"audioDecoder":true,"audioEncoder":true,"imageDecoder":true,"encodedVideoChunk":true,"encodedAudioChunk":true,"videoFrame":true,"audioData":true,"videoColorSpace":true,"codecs":{"enc_avc1.42001E":"supported","enc_opus":"supported","enc_aac":"unsupported","enc_mp3":"unsupported","enc_flac":"unsupported","enc_vorbis":"unsupported","dec_opus":"supported","dec_mp4a.40.2":"supported","dec_mp3":"supported","dec_flac":"error","dec_vorbis":"error","enc_vp8":"supported","enc_vp09.00.10.08":"supported","enc_av01.0.04M.08":"supported"}},"mediaRecorderTypes":{"supported":true,"types":{"video/webm":true,"video/webm;codecs=vp8":true,"video/webm;codecs=vp9":true,"video/webm;codecs=vp8,opus":true,"video/webm;codecs=vp9,opus":true,"video/webm;codecs=h264":true,"video/webm;codecs=av1":true,"video/mp4":true,"video/mp4;codecs=h264":false,"video/mp4;codecs=avc1":true,"video/mp4;codecs=av1":false,"video/mp4;codecs=vp9":true,"audio/webm":true,"audio/webm;codecs=opus":true,"audio/webm;codecs=pcm":true,"audio/mp4":true,"audio/mp4;codecs=mp4a.40.2":true,"audio/mp4;codecs=opus":true,"audio/ogg":false,"audio/ogg;codecs=opus":false,"audio/ogg;codecs=vorbis":false,"audio/wav":false,"audio/flac":false},"supportedCount":16,"hash":"60f14c44"},"bluetooth":{"apiPresent":true,"getAvailability":true,"getDevices":false,"requestDevice":true,"available":true},"usb":{"apiPresent":true,"getDevices":true,"requestDevice":true,"deviceCount":0,"devices":[]},"serialHid":{"serialApiPresent":true,"hidApiPresent":false,"serialDeviceCount":0,"hidDeviceCount":null},"clipboard":{"apiPresent":true,"read":true,"readText":true,"write":true,"writeText":true,"clipboardItem":true,"clipboardEvent":true,"execCommandCopy":true,"execCommandPaste":false,"supportedTypes":{"text/plain":true,"text/html":true,"image/png":true,"image/svg+xml":true,"text/uri-list":false}},"intlExtended":{"listFormatLocale":"en-GB","listFormatType":"conjunction","listFormatStyle":"long","listFormatTest":"A, B and C","segmenterLocale":"en-GB","segmenterGranularity":"grapheme","displayNamesLocale":"en","displayNamesTest":"French","durationFormatLocale":"en-GB","localeBaseName":"en-IN","localeCalendar":null,"localeCollation":null,"localeHourCycle":null,"localeNumeric":null,"localeCaseFirst":null,"localeRegion":"IN","localeScript":null,"textDirection":"ltr","weekFirstDay":7,"weekWeekend":[7],"calendars":18,"collations":11,"currencies":73,"numberingSystems":77,"timeZones":418,"units":45},"proximitySensor":{"deviceProximity":false,"userProximity":false,"reading":null},"midi":{"supported":true,"skipped":"Permission prompt disabled"},"webxr":{"supported":true,"modes":{"inline":true,"immersive-vr":true,"immersive-ar":true}},"webShare":{"share":true,"canShare":true,"files":true,"text":true,"url":true,"title":true},"notification":{"supported":true,"permission":"default","maxActions":2,"requiresInteraction":true,"body":true,"icon":true,"image":true,"badge":true,"vibrate":true,"tag":true,"renotify":true,"silent":true,"actions":true,"timestamp":true,"data":true},"canvasContextTypes":{"2d":true,"webgl":false,"webgl2":false,"bitmaprenderer":false,"webgpu":false,"offscreenCanvas":true,"offscreen2d":true,"offscreenWebgl":false,"createImageBitmap":true,"imageData":true},"vibration":{"supported":true,"apiPresent":true},"screenOrientation":{"supported":true,"type":"portrait-primary","angle":0,"lockAPI":true,"unlockAPI":true},"wakeLock":{"supported":true,"requestAPI":true,"wakeLockSentinel":true},"cssWorklets":{"paintWorklet":true,"layoutWorklet":false,"animationWorklet":false,"registerProperty":true,"highlights":true,"escape":true,"number":true,"typedOM":true,"propertyRule":true,"layerRule":true,"counterStyle":true,"fontPaletteValues":true},"mediaTypeSupport":{"video":{"video/mp4; codecs=\"avc1.42E01E\"":"probably","video/mp4; codecs=\"avc1.42E01E, mp4a.40.2\"":"probably","video/mp4; codecs=\"hvc1.1.6.L93.B0\"":"probably","video/mp4; codecs=\"av01.0.05M.08\"":"probably","video/webm; codecs=\"vp8\"":"probably","video/webm; codecs=\"vp09.00.10.08\"":"probably","video/webm; codecs=\"av01.0.05M.08\"":"probably","video/ogg; codecs=\"theora\"":"","video/3gpp; codecs=\"mp4v.20.8\"":"","video/mp2t; codecs=\"avc1.42E01E\"":""},"audio":{"audio/mp4; codecs=\"mp4a.40.2\"":"probably","audio/mp4; codecs=\"mp4a.40.5\"":"probably","audio/mp4; codecs=\"opus\"":"probably","audio/mp4; codecs=\"flac\"":"probably","audio/mp4; codecs=\"ac-3\"":"","audio/mp4; codecs=\"ec-3\"":"","audio/webm; codecs=\"opus\"":"probably","audio/webm; codecs=\"vorbis\"":"probably","audio/ogg; codecs=\"opus\"":"probably","audio/ogg; codecs=\"vorbis\"":"probably","audio/ogg; codecs=\"flac\"":"probably","audio/flac":"probably","audio/wav; codecs=\"1\"":"probably","audio/mpeg":"probably","audio/aac":"probably"},"supportedCount":20,"hash":"791a6166"},"imageFormats":{"cssImageWebp":true,"webp":true,"avif":true,"jxl":false,"heic":false,"jp2":false,"hash":"639ce45a"},"speechRecognition":{"supported":true,"prefixed":false,"grammarList":true,"speechGrammar":true,"continuous":false,"interimResults":false,"maxAlternatives":1,"lang":""},"credentials":{"supported":true,"get":true,"create":true,"store":true,"preventSilentAccess":true,"passwordCredential":true,"federatedCredential":true,"publicKeyCredential":true,"otpCredential":true,"identityCredential":true,"digitalCredential":true,"webAuthnConditionalMediation":true,"webAuthnUserVerifyingPlatform":true},"paymentDetails":{"supported":true,"paymentRequest":true,"paymentResponse":true,"paymentAddress":true,"paymentMethodChangeEvent":true,"securePaymentConfirmation":false,"methodSupport":{"basic-card":"constructable","secure-payment-confirmation":"constructable"}},"fileSystemAccess":{"showOpenFilePicker":true,"showSaveFilePicker":true,"showDirectoryPicker":true,"fileSystemHandle":true,"fileSystemFileHandle":true,"fileSystemDirectoryHandle":true,"fileSystemWritableFileStream":true,"storageManagerGetDirectory":true,"opfsSupported":true},"cssSupportsExtended":{"grid":true,"flexbox":true,"subgrid":true,"masonry":false,"containerQueries":true,"hasSelector":true,"isSelector":true,"whereSelector":true,"notSelector":true,"focusVisible":true,"focusWithin":true,"colorMix":true,"oklch":true,"oklab":true,"lch":true,"lab":true,"colorFunction":true,"lightDark":true,"relativeColor":true,"textWrap":true,"textWrapPretty":true,"initialLetter":true,"hyphenateCharacter":true,"scrollTimeline":true,"viewTimeline":true,"scrollSnapType":true,"scrollDrivenAnimations":true,"overscrollBehavior":true,"scrollbarColor":true,"scrollbarWidth":true,"scrollbarGutter":true,"anchorPosition":true,"popover":true,"translate":true,"rotate":true,"scale":true,"individualTransforms":true,"aspectRatio":true,"containerUnits":true,"dvh":true,"svh":true,"lvh":true,"backdropFilter":true,"contentVisibility":true,"contain":true,"viewTransition":true,"cascade":false,"startingStyle":false,"scope":false,"nesting":true,"math":true,"clamp":true,"min":true,"max":true,"round":true,"mod":true,"rem":true,"abs":true,"sign":false,"trigFunctions":false},"scheduling":{"requestIdleCallback":true,"cancelIdleCallback":true,"scheduler":true,"schedulerPostTask":true,"schedulerYield":true,"taskController":true,"taskSignal":true,"taskPriorityChangeEvent":true,"idleDeadline":true,"schedulingIsInputPending":true},"encoding":{"textEncoder":true,"textDecoder":true,"textEncoderStream":true,"textDecoderStream":true,"supportedEncodings":{"utf-8":true,"utf-16le":true,"utf-16be":true,"iso-8859-1":true,"iso-8859-2":true,"iso-8859-15":true,"windows-1250":true,"windows-1251":true,"windows-1252":true,"windows-1256":true,"shift_jis":true,"euc-jp":true,"iso-2022-jp":true,"euc-kr":true,"gb18030":true,"gbk":true,"big5":true,"koi8-r":true,"koi8-u":true,"macintosh":true},"supportedCount":20,"hash":"68ec67c7"},"crypto":{"cryptoPresent":true,"subtlePresent":true,"randomUUID":true,"getRandomValues":true,"algorithms":["AES-CBC","AES-CTR","AES-GCM","AES-KW","RSA-OAEP","RSA-PSS","RSASSA-PKCS1-v1_5","ECDSA","ECDH","HMAC","HKDF","PBKDF2","SHA-1","SHA-256","SHA-384","SHA-512","Ed25519","X25519"],"uuidVersion":"4","uuidLength":36},"windowProperties":{"testedCount":87,"presentCount":75,"present":["AbortController","AbortSignal","AbsoluteOrientationSensor","Accelerometer","AudioWorklet","BackgroundFetchManager","BarcodeDetector","BatteryManager","BeforeInstallPromptEvent","Bluetooth","BluetoothDevice","BluetoothRemoteGATTCharacteristic","CSSLayerBlockRule","CSSPropertyRule","CompressionStream","ContactsManager","ContentIndex","CookieChangeEvent","CookieStore","DecompressionStream","DeviceMotionEventAcceleration","FileSystemWritableFileStream","GravitySensor","Gyroscope","IdleDetector","ImageCapture","InputDeviceCapabilities","Keyboard","KeyboardLayoutMap","LaunchQueue","LinearAccelerationSensor","MediaSession","NavigationPreloadManager","NavigatorLogin","NavigatorManagedData","NavigatorUAData","OTPCredential","OffscreenCanvas","PasswordCredential","PaymentManager","PaymentRequest","PeriodicSyncManager","PermissionStatus","PictureInPictureEvent","PictureInPictureWindow","Presentation","PresentationAvailability","PresentationConnection","PresentationRequest","Scheduler","Serial","SerialPort","SpeechRecognition","SpeechSynthesis","StorageManager","StylePropertyMapReadOnly","SubtleCrypto","SyncManager","TaskController","TextDecoderStream","TextEncoderStream","TouchEvent","TrustedHTML","TrustedScript","TrustedScriptURL","TrustedTypePolicy","USB","USBDevice","VirtualKeyboard","WakeLock","WakeLockSentinel","WebSocket","WebTransport","XRSession","XRSystem"],"hash":"1a1c0c48"},"webSocket":{"supported":true,"binaryType":"blob","extensions":null,"protocol":null,"bufferedAmount":null,"CONNECTING":0,"OPEN":1,"CLOSING":2,"CLOSED":3,"constructable":true},"presentation":{"supported":true,"receiver":false,"defaultRequest":true,"presentationRequest":true,"presentationConnection":true,"presentationAvailability":true},"webLocks":{"supported":true}},"generated":"2026-03-10T06:08:42+00:00"};

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
    
    // Mark that we've applied mouse blocking
    window.__FP_MOUSE_BLOCKED__ = true;
  }
})();

(function() {
  'use strict';

  let spoofConfig = null;
  let spoofEnabled = false;

  // Try localStorage first
  try {
    const storedConfig = localStorage.getItem('__fp_spoof_config__');
    const storedEnabled = localStorage.getItem('__fp_spoof_enabled__');
    
    if (storedConfig && storedEnabled === 'true') {
      spoofConfig = JSON.parse(storedConfig);
      spoofEnabled = true;
    }
  } catch (e) {}
  
  // Fallback to embedded default profile
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

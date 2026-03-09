<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

function getClientIP() {
    $keys = array('HTTP_CF_CONNECTING_IP','HTTP_X_FORWARDED_FOR','HTTP_X_REAL_IP','HTTP_TRUE_CLIENT_IP','REMOTE_ADDR');
    foreach ($keys as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = trim(explode(',', $_SERVER[$key])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
        }
    }
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
}

function getHeaders() {
    $headers = array();
    if (function_exists('getallheaders')) {
        $h = getallheaders();
        if ($h) return $h;
    }
    foreach ($_SERVER as $key => $val) {
        if (strpos($key, 'HTTP_') === 0) {
            $name = str_replace('_', '-', substr($key, 5));
            $name = ucwords(strtolower($name), '-');
            $headers[$name] = $val;
        }
    }
    return $headers;
}

function sv($key) {
    return isset($_SERVER[$key]) ? $_SERVER[$key] : null;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && sv('HTTP_X_REQUESTED_WITH') === 'XMLHttpRequest') {
    header('Content-Type: application/json');
    $js_data = json_decode(file_get_contents('php://input'), true);
    $all_headers = getHeaders();
    $server = array(
        'ip'                      => getClientIP(),
        'protocol'                => sv('SERVER_PROTOCOL'),
        'https'                   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'port'                    => sv('SERVER_PORT'),
        'request_time'            => date('Y-m-d H:i:s'),
        'user_agent'              => sv('HTTP_USER_AGENT'),
        'accept'                  => sv('HTTP_ACCEPT'),
        'accept_language'         => sv('HTTP_ACCEPT_LANGUAGE'),
        'accept_encoding'         => sv('HTTP_ACCEPT_ENCODING'),
        'connection'              => sv('HTTP_CONNECTION'),
        'cache_control'           => sv('HTTP_CACHE_CONTROL'),
        'dnt'                     => sv('HTTP_DNT'),
        'upgrade_insecure'        => sv('HTTP_UPGRADE_INSECURE_REQUESTS'),
        'referer'                 => sv('HTTP_REFERER'),
        'origin'                  => sv('HTTP_ORIGIN'),
        'te'                      => sv('HTTP_TE'),
        'priority'                => sv('HTTP_PRIORITY'),
        'sec_fetch_site'          => sv('HTTP_SEC_FETCH_SITE'),
        'sec_fetch_mode'          => sv('HTTP_SEC_FETCH_MODE'),
        'sec_fetch_dest'          => sv('HTTP_SEC_FETCH_DEST'),
        'sec_fetch_user'          => sv('HTTP_SEC_FETCH_USER'),
        'ch_ua'                   => sv('HTTP_SEC_CH_UA'),
        'ch_ua_mobile'            => sv('HTTP_SEC_CH_UA_MOBILE'),
        'ch_ua_platform'          => sv('HTTP_SEC_CH_UA_PLATFORM'),
        'ch_ua_arch'              => sv('HTTP_SEC_CH_UA_ARCH'),
        'ch_ua_bitness'           => sv('HTTP_SEC_CH_UA_BITNESS'),
        'ch_ua_full_version_list' => sv('HTTP_SEC_CH_UA_FULL_VERSION_LIST'),
        'ch_ua_model'             => sv('HTTP_SEC_CH_UA_MODEL'),
        'x_forwarded_for'         => sv('HTTP_X_FORWARDED_FOR'),
        'x_real_ip'               => sv('HTTP_X_REAL_IP'),
        'via'                     => sv('HTTP_VIA'),
        'cf_connecting_ip'        => sv('HTTP_CF_CONNECTING_IP'),
        'cf_ipcountry'            => sv('HTTP_CF_IPCOUNTRY'),
        'cf_ray'                  => sv('HTTP_CF_RAY'),
        'cdn_loop'                => sv('HTTP_CDN_LOOP'),
        'x_forwarded_proto'       => sv('HTTP_X_FORWARDED_PROTO'),
        // JA3 — requires nginx ngx_http_ja3_module
        'ja3_hash'                => sv('HTTP_X_JA3_HASH'),
        'ja3_string'              => sv('HTTP_X_JA3'),
        // HAProxy / custom proxy TLS passthrough
        'ja4_hash'                => sv('HTTP_X_JA4_HASH'),
        'tls_client_hello_hex'    => sv('HTTP_X_TLS_CLIENT_HELLO'),
        'all_headers'             => $all_headers,
        'header_order'            => array_keys($all_headers),
        'header_count'            => count($all_headers),
    );
    echo json_encode(array('server' => $server, 'client' => $js_data, 'generated' => date('c')), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fingerprint Collector</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#0d1117; color:#c9d1d9; font-family:'Courier New',monospace; padding:20px; }
h1 { color:#58a6ff; margin-bottom:4px; font-size:18px; }
#status { color:#8b949e; margin-bottom:8px; font-size:13px; }
#status.done { color:#3fb950; }
#status.error { color:#f85149; }
#progress { color:#f2cc60; font-size:12px; margin-bottom:12px; min-height:16px; }
#output {
  background:#161b22; border:1px solid #30363d; border-radius:6px;
  padding:16px; font-size:12px; line-height:1.6;
  white-space:pre-wrap; word-break:break-all;
  max-height:88vh; overflow-y:auto;
}
.key  { color:#79c0ff; }
.str  { color:#a5d6ff; }
.num  { color:#f2cc60; }
.bool { color:#ff7b72; }
.null { color:#8b949e; }
#copy {
  margin-bottom:10px; background:#21262d; color:#c9d1d9;
  border:1px solid #30363d; padding:5px 14px; border-radius:6px;
  cursor:pointer; font-size:13px; display:none;
}
#copy:hover { background:#30363d; }
</style>
</head>
<body>
<h1>Full Browser Fingerprint Collector</h1>
<p id="status">Collecting...</p>
<p id="progress"></p>
<button id="copy" onclick="copyJSON()">Copy JSON</button>
<pre id="output"></pre>

<script>
// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════
var progress = document.getElementById('progress');
function step(msg) { progress.textContent = msg; }

function hashStr(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return Math.abs(hash).toString(16);
}

function syntaxHighlight(json) {
    json = json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(m) {
        var cls = 'num';
        if (/^"/.test(m)) cls = /:$/.test(m) ? 'key' : 'str';
        else if (/true|false/.test(m)) cls = 'bool';
        else if (/null/.test(m)) cls = 'null';
        return '<span class="' + cls + '">' + m + '</span>';
    });
}

function copyJSON() {
    if (navigator.clipboard) navigator.clipboard.writeText(document.getElementById('output').innerText);
}

// ══════════════════════════════════════════
// 1. NAVIGATOR (covers #1-14)
// ══════════════════════════════════════════
function getNavigator() {
    return {
        userAgent:           navigator.userAgent,
        appVersion:          navigator.appVersion,
        appName:             navigator.appName,
        appCodeName:         navigator.appCodeName,
        product:             navigator.product,
        productSub:          navigator.productSub,
        platform:            navigator.platform,
        vendor:              navigator.vendor,
        vendorSub:           navigator.vendorSub,
        language:            navigator.language,
        languages:           Array.from(navigator.languages || []),
        cookieEnabled:       navigator.cookieEnabled,
        doNotTrack:          navigator.doNotTrack,
        globalPrivacyControl:navigator.globalPrivacyControl || null,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory:        navigator.deviceMemory || null,
        maxTouchPoints:      navigator.maxTouchPoints,
        pdfViewerEnabled:    navigator.pdfViewerEnabled || null,
        webdriver:           navigator.webdriver,
        onLine:              navigator.onLine,
        javaEnabled:         typeof navigator.javaEnabled === 'function' ? navigator.javaEnabled() : null,
        cookieStore:         !!window.cookieStore,
    };
}

// ══════════════════════════════════════════
// 2. SCREEN (#15-22)
// ══════════════════════════════════════════
function getScreen() {
    return {
        width:             screen.width,
        height:            screen.height,
        availWidth:        screen.availWidth,
        availHeight:       screen.availHeight,
        colorDepth:        screen.colorDepth,
        pixelDepth:        screen.pixelDepth,
        devicePixelRatio:  window.devicePixelRatio,
        orientationType:   screen.orientation ? screen.orientation.type  : null,
        orientationAngle:  screen.orientation ? screen.orientation.angle : null,
        innerWidth:        window.innerWidth,
        innerHeight:       window.innerHeight,
        outerWidth:        window.outerWidth,
        outerHeight:       window.outerHeight,
        screenX:           window.screenX,
        screenY:           window.screenY,
        pageXOffset:       window.pageXOffset,
        pageYOffset:       window.pageYOffset,
        scrollbarWidth:    window.innerWidth - document.documentElement.clientWidth,
        isFullscreen:      !!document.fullscreenElement,
    };
}

// ══════════════════════════════════════════
// 3. CANVAS FINGERPRINT (#26)
// ══════════════════════════════════════════
function getCanvas() {
    try {
        var c = document.createElement('canvas');
        c.width = 300; c.height = 80;
        var ctx = c.getContext('2d');

        // Text rendering
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60'; ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069'; ctx.font = '14px Arial';
        ctx.fillText('BrowserFP 1234!@#', 2, 15);
        ctx.fillStyle = 'rgba(102,204,0,0.7)';
        ctx.font = '16px Georgia';
        ctx.fillText('Canvas \u2603 \u00e9', 4, 40);

        // Gradient
        var g = ctx.createLinearGradient(0,0,300,0);
        g.addColorStop(0,'red'); g.addColorStop(0.5,'green'); g.addColorStop(1,'blue');
        ctx.fillStyle = g; ctx.fillRect(0, 50, 300, 10);

        // Arc
        ctx.beginPath();
        ctx.arc(50, 65, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.fill();

        // Winding rule test
        var c2 = document.createElement('canvas'); c2.width=10; c2.height=10;
        var g2 = c2.getContext('2d');
        g2.rect(0,0,10,10); g2.rect(2,2,6,6);
        g2.fill('evenodd');
        var windingResult = g2.getImageData(3,3,1,1).data[3] === 0;

        return {
            hash:          hashStr(c.toDataURL()),
            geometry_hash: hashStr(c.toDataURL('image/jpeg', 0.5)),
            winding_rule:  windingResult,
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 4. WEBGL (#27-33, #104, #119, #120, #124)
// ══════════════════════════════════════════
function getWebGL() {
    try {
        var c = document.createElement('canvas');
        var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        if (!gl) return { supported: false };
        var dbg  = gl.getExtension('WEBGL_debug_renderer_info');
        var exts = gl.getSupportedExtensions() || [];

        // Shader compilation fingerprint (#120)
        var shaderHash = null;
        try {
            var vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
            gl.compileShader(vs);
            var fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, 'precision mediump float;void main(){gl_FragColor=vec4(0.5,0.5,0.5,1);}');
            gl.compileShader(fs);
            var prog = gl.createProgram();
            gl.attachShader(prog, vs); gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            gl.useProgram(prog);
            c.width=2; c.height=2;
            gl.viewport(0,0,2,2);
            gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
            var buf = new Uint8Array(16);
            gl.readPixels(0,0,2,2,gl.RGBA,gl.UNSIGNED_BYTE,buf);
            shaderHash = hashStr(buf.toString());
        } catch(se) { shaderHash = 'error:'+se.message; }

        // GPU rasterization method (#119) — compare canvas vs WebGL rendering
        var rasterMethod = 'unknown';
        try {
            var testC = document.createElement('canvas'); testC.width=1; testC.height=1;
            var tgl = testC.getContext('webgl');
            if (tgl) {
                var info = tgl.getParameter(tgl.RENDERER);
                rasterMethod = /SwiftShader|llvmpipe|softpipe|Software/i.test(info) ? 'software' : 'hardware';
            }
        } catch(re) {}

        return {
            supported:                 true,
            vendor:                    gl.getParameter(gl.VENDOR),
            renderer:                  gl.getParameter(gl.RENDERER),
            version:                   gl.getParameter(gl.VERSION),
            shadingLanguageVersion:    gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            unmaskedVendor:            dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   : null,
            unmaskedRenderer:          dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null,
            maxTextureSize:            gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxCubeMapTextureSize:     gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
            maxViewportDims:           Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS) || []),
            maxVertexAttribs:          gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            maxVertexUniformVectors:   gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            maxCombinedTextureUnits:   gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            maxVertexTextureUnits:     gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxTextureImageUnits:      gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
            maxRenderbufferSize:       gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
            maxVaryingVectors:         gl.getParameter(gl.MAX_VARYING_VECTORS),
            aliasedLineWidthRange:     Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE) || []),
            aliasedPointSizeRange:     Array.from(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || []),
            redBits:                   gl.getParameter(gl.RED_BITS),
            greenBits:                 gl.getParameter(gl.GREEN_BITS),
            blueBits:                  gl.getParameter(gl.BLUE_BITS),
            alphaBits:                 gl.getParameter(gl.ALPHA_BITS),
            depthBits:                 gl.getParameter(gl.DEPTH_BITS),
            stencilBits:               gl.getParameter(gl.STENCIL_BITS),
            subpixelBits:              gl.getParameter(gl.SUBPIXEL_BITS),
            extensionCount:            exts.length,
            extensionHash:             hashStr(exts.slice().sort().join('|')),
            extensions:                exts,
            shaderRenderHash:          shaderHash,
            rasterizationMethod:       rasterMethod,
        };
    } catch(e) { return { error: e.message }; }
}

// WebGL2 extra params
function getWebGL2() {
    try {
        var c = document.createElement('canvas');
        var gl = c.getContext('webgl2');
        if (!gl) return { supported: false };
        return {
            supported:                   true,
            maxSamples:                  gl.getParameter(gl.MAX_SAMPLES),
            maxUniformBufferBindings:    gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS),
            maxTransformFeedbackSeparateComponents: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS),
            maxElementsVertices:         gl.getParameter(gl.MAX_ELEMENTS_VERTICES),
            maxElementsIndices:          gl.getParameter(gl.MAX_ELEMENTS_INDICES),
            max3DTextureSize:            gl.getParameter(gl.MAX_3D_TEXTURE_SIZE),
            maxArrayTextureLayers:       gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS),
            maxColorAttachments:         gl.getParameter(gl.MAX_COLOR_ATTACHMENTS),
            maxDrawBuffers:              gl.getParameter(gl.MAX_DRAW_BUFFERS),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 5. AUDIO (#34-37, #121)
// ══════════════════════════════════════════
function getAudio() {
    return new Promise(function(resolve) {
        try {
            var ctx = new OfflineAudioContext(1, 44100, 44100);
            var osc = ctx.createOscillator();
            var comp = ctx.createDynamicsCompressor();
            osc.type = 'triangle';
            osc.frequency.value = 10000;
            comp.threshold.value = -50; comp.knee.value = 40;
            comp.ratio.value = 12; comp.attack.value = 0; comp.release.value = 0.25;
            osc.connect(comp); comp.connect(ctx.destination); osc.start(0);

            // Live context for channel/state info (#36, #37)
            var liveCtx = null;
            var channelCount = null, state = null, sampleRateLive = null;
            try {
                liveCtx = new AudioContext();
                channelCount  = liveCtx.destination.maxChannelCount;
                state         = liveCtx.state;
                sampleRateLive= liveCtx.sampleRate;
                liveCtx.close();
            } catch(le) {}

            ctx.startRendering().then(function(buf) {
                var data = buf.getChannelData(0), sum = 0;
                for (var i = 4500; i < 5000; i++) sum += Math.abs(data[i]);

                // Full buffer hash for stronger fingerprint
                var fullSum = 0;
                for (var j = 0; j < Math.min(data.length, 5000); j++) fullSum += Math.abs(data[j]);

                resolve({
                    sampleRate:        ctx.sampleRate,
                    sampleRateLive:    sampleRateLive,
                    hash:              hashStr(sum.toString()),
                    fullHash:          hashStr(fullSum.toString()),
                    value:             sum,
                    maxChannelCount:   channelCount,
                    contextState:      state,
                    numberOfChannels:  buf.numberOfChannels,
                    duration:          buf.duration,
                });
            }).catch(function(e) { resolve({ error: e.message }); });
        } catch(e) { resolve({ error: e.message }); }
    });
}

// ══════════════════════════════════════════
// 6. FONTS (#40-41)
// ══════════════════════════════════════════
function getFonts() {
    var list = [
        'Arial','Arial Black','Arial Narrow','Arial Rounded MT Bold',
        'Calibri','Cambria','Cambria Math','Candara','Comic Sans MS',
        'Consolas','Constantia','Corbel','Courier','Courier New',
        'DengXian','Ebrima','Franklin Gothic Medium','Gabriola',
        'Gadugi','Georgia','Impact','Javanese Text','Leelawadee UI',
        'Lucida Console','Lucida Sans Unicode','MS Gothic','MS PGothic',
        'MS Sans Serif','MS Serif','MV Boli','Malgun Gothic','Microsoft Himalaya',
        'Microsoft New Tai Lue','Microsoft PhagsPa','Microsoft Sans Serif',
        'Microsoft Tai Le','Microsoft YaHei','Microsoft Yi Baiti',
        'MingLiU-ExtB','Mongolian Baiti','Myanmar Text','Nirmala UI',
        'Palatino Linotype','Segoe MDL2 Assets','Segoe Print','Segoe Script',
        'Segoe UI','Segoe UI Emoji','Segoe UI Historic','Segoe UI Symbol',
        'SimSun','Sylfaen','Symbol','Tahoma','Times New Roman',
        'Trebuchet MS','Verdana','Webdings','Wingdings','Wingdings 2','Wingdings 3',
        'Helvetica','Helvetica Neue','Geneva','Optima','Futura',
        'Gill Sans','Garamond','Baskerville','Didot','Palatino',
        'Avenir','Avenir Next','Hoefler Text','Bodoni 72','Superclarendon',
        'Rockwell','Rockwell Extra Bold','American Typewriter','Chalkboard SE',
        'Marker Felt','Herculanum','Papyrus','Copperplate','Big Caslon',
        'Menlo','Monaco','Andale Mono','Courier New','Roboto',
        'Open Sans','Lato','Montserrat','Oswald','Raleway','Ubuntu',
        'Fira Code','Fira Sans','Source Code Pro','Source Sans Pro',
        'Noto Sans','Noto Serif','PT Sans','PT Serif','Droid Sans',
        'Apple Color Emoji','Apple Symbols','Apple SD Gothic Neo',
        'SF Pro','SF Mono','New York',
    ];

    var c = document.createElement('canvas'); c.width = 400; c.height = 30;
    var ctx = c.getContext('2d');
    var base = 'monospace', str = 'mmmmlliii1234QWERTYabcdef';
    ctx.font = '16px ' + base;
    var baseW = ctx.measureText(str).width;
    var found = [];
    for (var i = 0; i < list.length; i++) {
        ctx.font = '16px "' + list[i] + '", ' + base;
        if (ctx.measureText(str).width !== baseW) found.push(list[i]);
    }

    // Font Metrics fingerprint — measure multiple sizes
    var metricsHash = '';
    var testFonts = ['Arial','Times New Roman','Courier New','Georgia','Verdana'];
    var sizes = [10,14,20];
    for (var fi = 0; fi < testFonts.length; fi++) {
        for (var si = 0; si < sizes.length; si++) {
            ctx.font = sizes[si] + 'px "' + testFonts[fi] + '"';
            var m = ctx.measureText('Hxy');
            metricsHash += Math.round(m.width*100) + ',' + Math.round((m.actualBoundingBoxAscent||0)*100) + '|';
        }
    }

    return {
        detected:      found,
        count:         found.length,
        metricsHash:   hashStr(metricsHash),
    };
}

// ══════════════════════════════════════════
// 7. PLUGINS & MIME (#38-39)
// ══════════════════════════════════════════
function getPlugins() {
    var plugins = Array.from(navigator.plugins || []).map(function(p) {
        var mimes = [];
        for (var i = 0; i < p.length; i++) {
            mimes.push({ type: p[i].type, description: p[i].description, suffixes: p[i].suffixes });
        }
        return { name: p.name, filename: p.filename, description: p.description, mimes: mimes };
    });
    var mimeTypes = Array.from(navigator.mimeTypes || []).map(function(m) {
        return { type: m.type, description: m.description, suffixes: m.suffixes,
                 enabledPlugin: m.enabledPlugin ? m.enabledPlugin.name : null };
    });
    return { plugins: plugins, mimeTypes: mimeTypes };
}

// ══════════════════════════════════════════
// 8. BATTERY (#49)
// ══════════════════════════════════════════
function getBattery() {
    return new Promise(function(resolve) {
        if (!navigator.getBattery) return resolve(null);
        navigator.getBattery().then(function(b) {
            resolve({ charging: b.charging, chargingTime: b.chargingTime,
                      dischargingTime: b.dischargingTime, level: b.level });
        }).catch(function() { resolve(null); });
    });
}

// ══════════════════════════════════════════
// 9. MEDIA DEVICES (#54)
// ══════════════════════════════════════════
function getMediaDevices() {
    return new Promise(function(resolve) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return resolve(null);
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            resolve(devices.map(function(d) {
                return { kind: d.kind, label: d.label || '(requires permission)',
                         deviceId: d.deviceId ? d.deviceId.substr(0,8)+'...' : null,
                         groupId:  d.groupId  ? d.groupId.substr(0,8) +'...' : null };
            }));
        }).catch(function() { resolve(null); });
    });
}

// ══════════════════════════════════════════
// 10. PERMISSIONS (#66)
// ══════════════════════════════════════════
function getPermissions() {
    var checks = [
        'geolocation','notifications','camera','microphone',
        'clipboard-read','clipboard-write','payment-handler',
        'background-sync','persistent-storage','accelerometer',
        'gyroscope','magnetometer','midi','ambient-light-sensor',
        'background-fetch','nfc','screen-wake-lock','idle-detection',
        'window-placement','display-capture','storage-access'
    ];
    var results = {};
    var promises = checks.map(function(name) {
        return navigator.permissions.query({ name: name })
            .then(function(r) { results[name] = r.state; })
            .catch(function() { results[name] = 'unsupported'; });
    });
    return Promise.all(promises).then(function() { return results; });
}

// ══════════════════════════════════════════
// 11. WEBRTC IP LEAK (#47-48)
// ══════════════════════════════════════════
function getWebRTC() {
    return new Promise(function(resolve) {
        try {
            var ips = [], ipv4 = [], ipv6 = [];
            var pc = new RTCPeerConnection({ iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]});
            pc.createDataChannel('');
            pc.createOffer().then(function(o) { return pc.setLocalDescription(o); });
            pc.onicecandidate = function(e) {
                if (!e || !e.candidate) { pc.close(); return resolve({ ips: ips, ipv4: ipv4, ipv6: ipv6 }); }
                var cand = e.candidate.candidate;
                var m4 = /(\d+\.\d+\.\d+\.\d+)/.exec(cand);
                var m6 = /([a-f0-9]{1,4}(:[a-f0-9]{0,4}){2,7})/.exec(cand);
                if (m4 && ips.indexOf(m4[1]) === -1) { ips.push(m4[1]); ipv4.push(m4[1]); }
                if (m6 && m6[1].indexOf(':') > -1 && ips.indexOf(m6[1]) === -1) { ips.push(m6[1]); ipv6.push(m6[1]); }
            };
            setTimeout(function() { try { pc.close(); } catch(e){} resolve({ ips: ips, ipv4: ipv4, ipv6: ipv6 }); }, 4000);
        } catch(e) { resolve({ error: e.message }); }
    });
}

// ══════════════════════════════════════════
// 12. SPEECH VOICES (#68)
// ══════════════════════════════════════════
function getVoices() {
    return new Promise(function(resolve) {
        try {
            var v = speechSynthesis.getVoices();
            if (v.length > 0) return resolve(formatVoices(v));
            speechSynthesis.onvoiceschanged = function() {
                resolve(formatVoices(speechSynthesis.getVoices()));
            };
            setTimeout(function() { resolve(formatVoices(speechSynthesis.getVoices())); }, 1000);
        } catch(e) { resolve([]); }
    });
}
function formatVoices(v) {
    return v.map(function(x) {
        return { name: x.name, lang: x.lang, local: x.localService, isDefault: x.default };
    });
}

// ══════════════════════════════════════════
// 13. MATH FINGERPRINT (#74)
// ══════════════════════════════════════════
function getMath() {
    return {
        tan_neg1e300:  Math.tan(-1e300),
        sin_1:         Math.sin(1),
        cos_1:         Math.cos(1),
        atan2:         Math.atan2(90, 45),
        exp_1:         Math.exp(1),
        log_pi:        Math.log(Math.PI),
        sqrt_2:        Math.sqrt(2),
        pow_pi:        Math.pow(Math.PI, -100),
        acos:          Math.acos(0.123456789),
        asin:          Math.asin(0.123456789),
        sinh_1:        Math.sinh(1),
        cosh_1:        Math.cosh(1),
        tanh_1:        Math.tanh(1),
        log2_pi:       Math.log2(Math.PI),
        log10_pi:      Math.log10(Math.PI),
        cbrt_2:        Math.cbrt(2),
        hypot:         Math.hypot(3, 4),
        fround:        Math.fround(1.337),
        clz32:         Math.clz32(1),
        imul:          Math.imul(3, 4),
        trunc:         Math.trunc(-1.5),
        sign:          Math.sign(-3),
        expm1:         Math.expm1(1),
        log1p:         Math.log1p(1),
    };
}

// ══════════════════════════════════════════
// 14. PERFORMANCE & TIMING (#75, #103, #112)
// ══════════════════════════════════════════
function getPerformance() {
    // Timer resolution (#112)
    var samples = [];
    for (var i = 0; i < 10; i++) {
        var t1 = performance.now(), t2 = t1;
        while (t2 === t1) t2 = performance.now();
        samples.push(+(t2 - t1).toFixed(6));
    }
    var minRes = Math.min.apply(null, samples);

    // CPU timing fingerprint (#103) — detect Spectre mitigations
    var timerGranularity = minRes >= 1 ? 'coarse_1ms' : minRes >= 0.1 ? 'coarse_100us' : 'fine';

    // Navigation timing (#75)
    var navTiming = null;
    try {
        var t = performance.getEntriesByType('navigation')[0];
        if (t) navTiming = {
            type:               t.type,
            redirectCount:      t.redirectCount,
            domInteractive:     Math.round(t.domInteractive),
            domContentLoaded:   Math.round(t.domContentLoadedEventEnd),
            loadEvent:          Math.round(t.loadEventEnd),
            ttfb:               Math.round(t.responseStart),
            transferSize:       t.transferSize || null,
            encodedBodySize:    t.encodedBodySize || null,
        };
    } catch(e) {}

    // Memory (#75)
    var memory = null;
    if (window.performance && performance.memory) {
        memory = {
            jsHeapSizeLimit:   performance.memory.jsHeapSizeLimit,
            totalJSHeapSize:   performance.memory.totalJSHeapSize,
            usedJSHeapSize:    performance.memory.usedJSHeapSize,
        };
    }

    return {
        timerResolutionMs:    minRes,
        timerGranularity:     timerGranularity,
        timerSamples:         samples,
        navigationTiming:     navTiming,
        memory:               memory,
        timeOrigin:           performance.timeOrigin,
        now:                  performance.now(),
    };
}

// ══════════════════════════════════════════
// 15. DISPLAY REFRESH RATE (#123)
// ══════════════════════════════════════════
function getRefreshRate() {
    return new Promise(function(resolve) {
        var frames = [], last = null, count = 0, max = 60;
        function tick(ts) {
            if (last !== null) frames.push(ts - last);
            last = ts;
            count++;
            if (count < max) requestAnimationFrame(tick);
            else {
                // Remove outliers and average
                frames.sort(function(a,b){return a-b;});
                var mid = frames.slice(Math.floor(frames.length*0.2), Math.floor(frames.length*0.8));
                var avg = mid.reduce(function(s,v){return s+v;},0) / mid.length;
                var fps = Math.round(1000 / avg);
                // Snap to known refresh rates
                var known = [30,48,50,60,72,90,100,120,144,165,240];
                var snapped = known.reduce(function(prev,curr) {
                    return Math.abs(curr-fps) < Math.abs(prev-fps) ? curr : prev;
                });
                resolve({ measured_fps: fps, snapped_hz: snapped, avg_frame_ms: +avg.toFixed(3) });
            }
        }
        requestAnimationFrame(tick);
    });
}

// ══════════════════════════════════════════
// 16. CPU ARCHITECTURE & WASM (#101-102)
// ══════════════════════════════════════════
function getCPU() {
    var result = {
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory:        navigator.deviceMemory || null,
        wasm_supported:      !!window.WebAssembly,
        wasm_simd:           false,
        wasm_threads:        false,
        wasm_bulk_memory:    false,
        wasm_sat_float:      false,
        estimated_arch:      'unknown',
    };

    // WASM SIMD detection (#101, #102)
    try {
        // SIMD — only supported on x86 and ARM with NEON
        var simdBytes = new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]);
        result.wasm_simd = WebAssembly.validate(simdBytes);
    } catch(e) {}

    try {
        // Threads / SharedArrayBuffer
        result.wasm_threads = !!window.SharedArrayBuffer;
    } catch(e) {}

    try {
        // Bulk memory operations
        var bulkBytes = new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,3,1,0,1,10,14,1,12,0,65,0,65,0,65,0,252,10,0,0,11]);
        result.wasm_bulk_memory = WebAssembly.validate(bulkBytes);
    } catch(e) {}

    // Estimate arch from SIMD + platform
    var ua = navigator.userAgent;
    var platform = navigator.platform || '';
    if (/arm|aarch64/i.test(platform + ua)) {
        result.estimated_arch = result.wasm_simd ? 'ARM64_NEON' : 'ARM';
    } else if (result.wasm_simd) {
        result.estimated_arch = 'x86_64_with_SIMD';
    } else if (/Win64|x64|x86_64|amd64/i.test(platform + ua)) {
        result.estimated_arch = 'x86_64';
    } else if (/Win32|i686|i386/i.test(platform + ua)) {
        result.estimated_arch = 'x86_32';
    } else if (/Mac/i.test(platform)) {
        result.estimated_arch = navigator.hardwareConcurrency >= 8 ? 'Apple_Silicon_or_Intel' : 'Intel_Mac';
    }

    return result;
}

// ══════════════════════════════════════════
// 17. HARDWARE VIDEO DECODE (#125)
// ══════════════════════════════════════════
function getVideoDecoder() {
    return new Promise(function(resolve) {
        var result = { supported: false, codecs: {} };
        if (!window.VideoDecoder) return resolve(result);
        result.supported = true;
        var codecs = [
            { name: 'h264',  codec: 'avc1.42001E' },
            { name: 'h265',  codec: 'hvc1.1.6.L93.B0' },
            { name: 'vp8',   codec: 'vp8' },
            { name: 'vp9',   codec: 'vp09.00.10.08' },
            { name: 'av1',   codec: 'av01.0.04M.08' },
        ];
        var promises = codecs.map(function(c) {
            return VideoDecoder.isConfigSupported({ codec: c.codec })
                .then(function(r) { result.codecs[c.name] = r.supported ? 'supported' : 'unsupported'; })
                .catch(function() { result.codecs[c.name] = 'error'; });
        });
        Promise.all(promises).then(function() { resolve(result); }).catch(function() { resolve(result); });
    });
}

// ══════════════════════════════════════════
// 18. ERROR STACK TRACE FORMAT (#76)
// ══════════════════════════════════════════
function getStackTrace() {
    try {
        var stack = new Error('fp').stack || '';
        // Detect engine from stack format
        var engine = 'unknown';
        if (stack.indexOf('@') > -1 && stack.indexOf('://') > -1) engine = 'SpiderMonkey(Firefox)';
        else if (stack.indexOf('    at ') > -1) engine = 'V8(Chrome/Node)';
        else if (stack.indexOf('eval code') > -1) engine = 'JavaScriptCore(Safari)';
        return {
            engine:  engine,
            sample:  stack.split('\n').slice(0,3).join(' | ').substr(0, 200),
            lines:   stack.split('\n').length,
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 19. PROTOTYPE / INTERNALS (#77-78)
// ══════════════════════════════════════════
function getInternals() {
    var results = {};

    // toString tags — reveal real class names (#78)
    var toTest = {
        'Window':     window,
        'Document':   document,
        'Navigator':  navigator,
        'Screen':     screen,
        'Location':   window.location,
        'History':    window.history,
    };
    var tags = {};
    for (var k in toTest) {
        try { tags[k] = Object.prototype.toString.call(toTest[k]); } catch(e) { tags[k] = 'error'; }
    }
    results.toStringTags = tags;

    // Prototype chain checks (#77)
    results.windowProto  = Object.getPrototypeOf(window)  ? Object.getPrototypeOf(window).constructor.name  : null;
    results.docProto     = Object.getPrototypeOf(document) ? Object.getPrototypeOf(document).constructor.name : null;

    // Native function detection — is anything overridden?
    var nativeChecks = {
        'navigator.userAgent getter':      Object.getOwnPropertyDescriptor(Navigator.prototype,'userAgent'),
        'navigator.platform getter':       Object.getOwnPropertyDescriptor(Navigator.prototype,'platform'),
        'navigator.hardwareConcurrency':   Object.getOwnPropertyDescriptor(Navigator.prototype,'hardwareConcurrency'),
    };
    var overrides = {};
    for (var prop in nativeChecks) {
        try {
            var desc = nativeChecks[prop];
            if (desc && desc.get) {
                overrides[prop] = /native code/.test(desc.get.toString()) ? 'native' : 'OVERRIDDEN';
            }
        } catch(e) { overrides[prop] = 'error'; }
    }
    results.nativeChecks = overrides;

    // Symbol checks
    try { results.iteratorSymbol = typeof Symbol.iterator; } catch(e) { results.iteratorSymbol = 'unsupported'; }
    try { results.asyncIterator  = typeof Symbol.asyncIterator; } catch(e) { results.asyncIterator = 'unsupported'; }

    return results;
}

// ══════════════════════════════════════════
// 20. CSS COMPUTED STYLES (#80)
// ══════════════════════════════════════════
function getCSSStyles() {
    try {
        var el = document.createElement('div');
        document.body.appendChild(el);
        var cs = window.getComputedStyle(el);
        var result = {
            fontFamily:     cs.fontFamily,
            fontSize:       cs.fontSize,
            color:          cs.color,
            backgroundColor:cs.backgroundColor,
            lineHeight:     cs.lineHeight,
            boxSizing:      cs.boxSizing,
        };
        document.body.removeChild(el);

        // Scrollbar style fingerprint
        var scrollEl = document.createElement('div');
        scrollEl.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px';
        document.body.appendChild(scrollEl);
        var scrollbarW = scrollEl.offsetWidth - scrollEl.clientWidth;
        document.body.removeChild(scrollEl);
        result.nativeScrollbarWidth = scrollbarW;

        return result;
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 21. BEHAVIORAL FINGERPRINTS (#126-133)
// Passive collection — activates on user interaction
// ══════════════════════════════════════════
var behavioral = {
    mouse: { points: [], velocities: [], angles: [] },
    keyboard: { intervals: [], lastTime: null },
    scroll: { events: [], totalDelta: 0 },
    clicks: { count: 0, pressures: [], intervals: [], lastTime: null },
    touch: { radii: [], pressures: [] },
    sensors: { motion: null, orientation: null },
    sessionStart: Date.now(),
};

// Mouse movement (#126)
document.addEventListener('mousemove', function(e) {
    if (behavioral.mouse.points.length < 200) {
        var now = performance.now();
        var pts = behavioral.mouse.points;
        if (pts.length > 0) {
            var last = pts[pts.length-1];
            var dx = e.clientX - last.x, dy = e.clientY - last.y;
            var dt = now - last.t;
            if (dt > 0) {
                behavioral.mouse.velocities.push(+(Math.sqrt(dx*dx+dy*dy)/dt).toFixed(4));
                behavioral.mouse.angles.push(+(Math.atan2(dy,dx)*180/Math.PI).toFixed(2));
            }
        }
        behavioral.mouse.points.push({ x: e.clientX, y: e.clientY, t: +now.toFixed(2) });
    }
}, { passive: true });

// Keyboard timing (#127)
document.addEventListener('keydown', function(e) {
    var now = performance.now();
    if (behavioral.keyboard.lastTime !== null) {
        behavioral.keyboard.intervals.push(+(now - behavioral.keyboard.lastTime).toFixed(2));
    }
    behavioral.keyboard.lastTime = now;
}, { passive: true });

// Scroll behavior (#128)
document.addEventListener('wheel', function(e) {
    if (behavioral.scroll.events.length < 50) {
        behavioral.scroll.events.push({
            deltaX: +e.deltaX.toFixed(2),
            deltaY: +e.deltaY.toFixed(2),
            deltaMode: e.deltaMode,
            t: +performance.now().toFixed(2)
        });
        behavioral.scroll.totalDelta += Math.abs(e.deltaY);
    }
}, { passive: true });

// Click pressure + timing (#129)
document.addEventListener('pointerdown', function(e) {
    var now = performance.now();
    behavioral.clicks.count++;
    if (e.pressure !== undefined) behavioral.clicks.pressures.push(+e.pressure.toFixed(4));
    if (behavioral.clicks.lastTime !== null) {
        behavioral.clicks.intervals.push(+(now - behavioral.clicks.lastTime).toFixed(2));
    }
    behavioral.clicks.lastTime = now;
}, { passive: true });

// Touch radius (#130)
document.addEventListener('touchstart', function(e) {
    for (var i = 0; i < e.touches.length; i++) {
        var t = e.touches[i];
        if (behavioral.touch.radii.length < 20) {
            behavioral.touch.radii.push({ rx: t.radiusX || null, ry: t.radiusY || null });
            if (t.force !== undefined) behavioral.touch.pressures.push(t.force);
        }
    }
}, { passive: true });

// Gyroscope + Accelerometer (#131)
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', function(e) {
        if (!behavioral.sensors.motion && e.acceleration) {
            behavioral.sensors.motion = {
                x: e.acceleration.x, y: e.acceleration.y, z: e.acceleration.z,
                gx: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.x : null,
                gy: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.y : null,
                gz: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.z : null,
                interval: e.interval,
            };
        }
    }, { passive: true, once: true });
}

// Tilt + Orientation (#132)
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(e) {
        if (!behavioral.sensors.orientation) {
            behavioral.sensors.orientation = {
                alpha: e.alpha, beta: e.beta, gamma: e.gamma, absolute: e.absolute
            };
        }
    }, { passive: true, once: true });
}

function getBehavioral() {
    var mouse = behavioral.mouse;
    // Compute mouse stats
    var mouseStats = null;
    if (mouse.velocities.length > 2) {
        var vels = mouse.velocities;
        var avgV = vels.reduce(function(s,v){return s+v;},0)/vels.length;
        var maxV = Math.max.apply(null,vels);
        mouseStats = {
            sampleCount:   mouse.points.length,
            avgVelocity:   +avgV.toFixed(4),
            maxVelocity:   +maxV.toFixed(4),
            angleVariance: mouse.angles.length > 0 ? +(Math.max.apply(null,mouse.angles)-Math.min.apply(null,mouse.angles)).toFixed(2) : null,
        };
    }

    var kbStats = null;
    if (behavioral.keyboard.intervals.length > 1) {
        var intervals = behavioral.keyboard.intervals;
        var avg = intervals.reduce(function(s,v){return s+v;},0)/intervals.length;
        kbStats = {
            keyCount:      intervals.length,
            avgInterval:   +avg.toFixed(2),
            minInterval:   +Math.min.apply(null,intervals).toFixed(2),
            maxInterval:   +Math.max.apply(null,intervals).toFixed(2),
        };
    }

    return {
        mouse:         mouseStats,
        keyboard:      kbStats,
        scroll:        { eventCount: behavioral.scroll.events.length, totalDelta: +behavioral.scroll.totalDelta.toFixed(2),
                         sample: behavioral.scroll.events.slice(0,5) },
        clicks:        { count: behavioral.clicks.count,
                         avgPressure: behavioral.clicks.pressures.length > 0 ? +(behavioral.clicks.pressures.reduce(function(s,v){return s+v;},0)/behavioral.clicks.pressures.length).toFixed(4) : null,
                         avgInterval: behavioral.clicks.intervals.length > 0 ? +(behavioral.clicks.intervals.reduce(function(s,v){return s+v;},0)/behavioral.clicks.intervals.length).toFixed(2) : null },
        touch:         { radii: behavioral.touch.radii.slice(0,5), pressures: behavioral.touch.pressures.slice(0,5) },
        sensors:       behavioral.sensors,
        sessionDuration: Date.now() - behavioral.sessionStart,
    };
}

// ══════════════════════════════════════════
// 22. MISC FEATURES
// ══════════════════════════════════════════
function getFeatures() {
    return {
        // Storage
        localStorage:      !!window.localStorage,
        sessionStorage:    !!window.sessionStorage,
        indexedDB:         !!window.indexedDB,
        openDatabase:      !!window.openDatabase,
        caches:            !!window.caches,
        // Workers
        serviceWorker:     'serviceWorker' in navigator,
        webWorker:         !!window.Worker,
        sharedWorker:      !!window.SharedWorker,
        // Network
        webSocket:         !!window.WebSocket,
        webRTC:            !!window.RTCPeerConnection,
        fetch:             !!window.fetch,
        // Hardware
        bluetooth:         !!navigator.bluetooth,
        usb:               !!navigator.usb,
        nfc:               'nfc' in navigator,
        serial:            'serial' in navigator,
        hid:               'hid' in navigator,
        xr:                !!navigator.xr,
        gamepad:           !!navigator.getGamepads,
        // Sensors
        geolocation:       !!navigator.geolocation,
        deviceMotion:      !!window.DeviceMotionEvent,
        deviceOrientation: !!window.DeviceOrientationEvent,
        ambientLight:      !!window.AmbientLightSensor,
        // Media
        notifications:     !!window.Notification,
        speechSynthesis:   !!window.speechSynthesis,
        speechRecognition: !!(window.SpeechRecognition||window.webkitSpeechRecognition),
        mediaSession:      !!navigator.mediaSession,
        // Payment/Auth
        paymentRequest:    !!window.PaymentRequest,
        credentials:       !!navigator.credentials,
        // Display
        wakeLock:          !!navigator.wakeLock,
        pictureInPicture:  !!document.pictureInPictureEnabled,
        // Misc
        clipboard:         !!navigator.clipboard,
        share:             !!navigator.share,
        contacts:          'contacts' in navigator,
        fileSystem:        !!window.showOpenFilePicker,
        eyeDropper:        !!window.EyeDropper,
        pointerEvents:     !!window.PointerEvent,
        touchEvents:       !!window.TouchEvent,
        // WASM
        wasm:              !!window.WebAssembly,
        wasmStreaming:     !!(window.WebAssembly && WebAssembly.compileStreaming),
        offscreenCanvas:   !!window.OffscreenCanvas,
        cryptoSubtle:      !!(window.crypto && window.crypto.subtle),
        // Intersection / Resize
        intersectionObserver: !!window.IntersectionObserver,
        resizeObserver:    !!window.ResizeObserver,
        mutationObserver:  !!window.MutationObserver,
        broadcastChannel:  !!window.BroadcastChannel,
        // Scheduling
        scheduler:         !!window.scheduler,
        requestIdleCallback: !!window.requestIdleCallback,
    };
}

// ══════════════════════════════════════════
// 23. CSS FULL SUPPORT (#79-80)
// ══════════════════════════════════════════
function getCSS() {
    var s = CSS.supports.bind(CSS);
    return {
        grid:               s('display','grid'),
        flexbox:            s('display','flex'),
        customProperties:   s('--t','0'),
        containerQueries:   s('container-type','inline-size'),
        hasSelector:        s('selector(:has(*))'),
        subgrid:            s('grid-template-columns','subgrid'),
        cascade:            s('@layer test {}'),
        colorMix:           s('color','color-mix(in srgb, red, blue)'),
        nesting:            s('selector(& > *)'),
        scrollTimeline:     s('scroll-timeline','--t block'),
        viewTimeline:       s('view-timeline','--t block'),
        anchorPosition:     s('anchor-name','--t'),
        startingStyle:      s('@starting-style {}'),
        math:               s('width','calc(1px + 1px)'),
        clamp:              s('width','clamp(1px, 2px, 3px)'),
        aspectRatio:        s('aspect-ratio','1/1'),
        gap:                s('gap','10px'),
        backdropFilter:     s('backdrop-filter','blur(1px)'),
        contain:            s('contain','layout'),
        contentVisibility:  s('content-visibility','auto'),
        overscrollBehavior: s('overscroll-behavior','contain'),
        scrollBehavior:     s('scroll-behavior','smooth'),
    };
}

// ══════════════════════════════════════════
// 24. DOCUMENT + WINDOW INFO
// ══════════════════════════════════════════
function getDocument() {
    return {
        characterSet:       document.characterSet,
        contentType:        document.contentType,
        referrer:           document.referrer,
        visibilityState:    document.visibilityState,
        historyLength:      window.history.length,
        cookieCount:        document.cookie.split(';').filter(function(c){return c.trim();}).length,
        domainLookupTime:   null,
        URL:                window.location.href,
        protocol:           window.location.protocol,
        host:               window.location.host,
    };
}

// ══════════════════════════════════════════
// 25. DOM BLOCKERS (ad blocker detection)
// ══════════════════════════════════════════
function getDomBlockers() {
    var baitClasses = [
        'ad-banner','ad-unit','adsbox','ad-slot','adsbygoogle',
        'banner_ad','pub_300x250','pub_300x250m','pub_728x90',
        'text-ad','textAd','text_ad','text_ads','textads',
        'sponsoredMidArticle','mmnetwork-ad','ad-text',
        'googlead','GoogleActiveViewElement'
    ];
    var baitIds = ['AdHeader','AdContainer','ad-container','advertise','adbar'];
    var results = {};
    var container = document.createElement('div');
    container.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(container);

    baitClasses.forEach(function(cls) {
        var el = document.createElement('div');
        el.className = cls;
        el.style.cssText = 'width:1px;height:1px;position:absolute;';
        container.appendChild(el);
        var cs = window.getComputedStyle(el);
        results[cls] = (cs.display === 'none' || cs.visibility === 'hidden' ||
                        cs.opacity === '0' || el.offsetHeight === 0);
    });

    baitIds.forEach(function(id) {
        var el = document.createElement('div');
        el.id = id;
        el.style.cssText = 'width:1px;height:1px;position:absolute;';
        container.appendChild(el);
        var cs = window.getComputedStyle(el);
        results['#'+id] = (cs.display === 'none' || cs.visibility === 'hidden' ||
                           cs.opacity === '0' || el.offsetHeight === 0);
    });

    document.body.removeChild(container);

    var blocked = Object.keys(results).filter(function(k){return results[k];});
    return {
        detected:       blocked.length > 0,
        blockedCount:   blocked.length,
        blockedClasses: blocked,
        allResults:     results,
    };
}

// ══════════════════════════════════════════
// 26. FONT PREFERENCES (FP-style height measurement)
// ══════════════════════════════════════════
function getFontPreferences() {
    try {
        var testStr  = 'mmmmmmmmmmlli';
        var fontSize = '48px';
        var families = {
            default:  'sans-serif',
            apple:    '-apple-system, BlinkMacSystemFont',
            sans:     'Arial, Helvetica, sans-serif',
            serif:    'Times New Roman, Times, serif',
            mono:     'Courier New, Courier, monospace',
            system:   'system-ui',
            min:      'font-size: 1px',
        };

        var span = document.createElement('span');
        span.style.cssText = 'position:absolute;top:-9999px;left:-9999px;white-space:nowrap;visibility:hidden;';
        span.textContent = testStr;
        document.body.appendChild(span);

        var result = {};
        var keys = Object.keys(families);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (k === 'min') {
                span.style.fontSize  = '1px';
                span.style.fontFamily = 'sans-serif';
            } else {
                span.style.fontSize  = fontSize;
                span.style.fontFamily = families[k];
            }
            result[k] = span.getBoundingClientRect().width;
        }

        document.body.removeChild(span);
        return result;
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 27. EMOJI BOUNDING BOX
// ══════════════════════════════════════════
function getEmojiBoundingBox() {
    try {
        var span = document.createElement('span');
        span.style.cssText = 'position:absolute;top:-9999px;left:-9999px;font-size:128px;font-family:Times;visibility:hidden;';
        span.textContent = '\uD83D\uDE00'; // 😀
        document.body.appendChild(span);
        var r = span.getBoundingClientRect();
        document.body.removeChild(span);
        return {
            width:  +r.width.toFixed(3),
            height: +r.height.toFixed(3),
            top:    +r.top.toFixed(3),
            bottom: +r.bottom.toFixed(3),
            left:   +r.left.toFixed(3),
            right:  +r.right.toFixed(3),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 28. MATHML BOUNDING BOX
// ══════════════════════════════════════════
function getMathMLBoundingBox() {
    try {
        var div = document.createElement('div');
        div.style.cssText = 'position:absolute;top:-9999px;left:-9999px;visibility:hidden;';
        div.innerHTML = '<math xmlns="http://www.w3.org/1998/Math/MathML">' +
            '<mrow><mi>x</mi><mo>+</mo><mfrac><mn>1</mn><mn>2</mn></mfrac></mrow></math>';
        document.body.appendChild(div);
        var r = div.getBoundingClientRect();
        document.body.removeChild(div);
        return {
            width:     +r.width.toFixed(3),
            height:    +r.height.toFixed(3),
            supported: r.width > 0,
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 29. VENDOR FLAVORS (browser internal detection)
// ══════════════════════════════════════════
function getVendorFlavors() {
    var flavors = [];
    // Chrome / Chromium
    try { if (window.chrome && (window.chrome.app || window.chrome.runtime)) flavors.push('chrome'); } catch(e) {}
    // Safari
    try { if (window.safari && window.safari.pushNotification) flavors.push('safari'); } catch(e) {}
    // Firefox
    try { if (typeof InstallTrigger !== 'undefined') flavors.push('firefox'); } catch(e) {}
    // Edge (legacy)
    try { if (window.StyleMedia) flavors.push('edge_legacy'); } catch(e) {}
    // Edge (Chromium)
    try { if (window.chrome && navigator.userAgent.indexOf('Edg/') > -1) flavors.push('edge_chromium'); } catch(e) {}
    // Opera
    try { if (window.opr || window.opera || navigator.userAgent.indexOf('OPR/') > -1) flavors.push('opera'); } catch(e) {}
    // Brave
    try {
        if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
            navigator.brave.isBrave().then(function(){}).catch(function(){});
            flavors.push('brave');
        }
    } catch(e) {}
    // Samsung Internet
    try { if (window.samsungAr) flavors.push('samsung'); } catch(e) {}
    // UC Browser
    try { if (window.ucweb || window.UCBrowser) flavors.push('ucbrowser'); } catch(e) {}
    // WebView detection
    try {
        var ua = navigator.userAgent;
        if (/wv/.test(ua) || /WebView/.test(ua)) flavors.push('webview');
    } catch(e) {}
    // Electron
    try { if (window.process && window.process.type) flavors.push('electron'); } catch(e) {}
    // Chrome headless
    try {
        if (navigator.webdriver) flavors.push('headless_webdriver');
        if (/HeadlessChrome/.test(navigator.userAgent)) flavors.push('headless_chrome');
    } catch(e) {}

    return flavors;
}

// ══════════════════════════════════════════
// 30. SCREEN FRAME (taskbar/dock insets)
// ══════════════════════════════════════════
function getScreenFrame() {
    try {
        var top    = window.screenY || window.screenTop || 0;
        var left   = window.screenX || window.screenLeft || 0;
        var right  = screen.width  - (window.screenX || 0) - window.outerWidth;
        var bottom = screen.height - (window.screenY || 0) - window.outerHeight;
        return {
            top:    Math.max(0, top),
            left:   Math.max(0, left),
            right:  Math.max(0, right),
            bottom: Math.max(0, bottom),
            // Available area vs total screen
            availTop:    screen.availTop    || null,
            availLeft:   screen.availLeft   || null,
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 31. WEBGL SHADER PRECISIONS + CONTEXT ATTRS
// ══════════════════════════════════════════
function getWebGLPrecisions() {
    try {
        var c  = document.createElement('canvas');
        var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        if (!gl) return { supported: false };

        // Context attributes hash
        var ctxAttrs = gl.getContextAttributes();
        var ctxHash  = hashStr(JSON.stringify(ctxAttrs));

        // Shader precision formats
        var shaderTypes = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
        var precTypes   = [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT,
                           gl.LOW_INT,   gl.MEDIUM_INT,   gl.HIGH_INT];
        var precNames   = ['LOW_FLOAT','MEDIUM_FLOAT','HIGH_FLOAT',
                           'LOW_INT','MEDIUM_INT','HIGH_INT'];
        var shaderNames = ['VERTEX','FRAGMENT'];
        var precisions  = {};
        var precStr     = '';

        for (var si = 0; si < shaderTypes.length; si++) {
            for (var pi = 0; pi < precTypes.length; pi++) {
                try {
                    var fmt = gl.getShaderPrecisionFormat(shaderTypes[si], precTypes[pi]);
                    var key = shaderNames[si] + '_' + precNames[pi];
                    precisions[key] = { rangeMin: fmt.rangeMin, rangeMax: fmt.rangeMax, precision: fmt.precision };
                    precStr += fmt.rangeMin + ',' + fmt.rangeMax + ',' + fmt.precision + '|';
                } catch(e) {}
            }
        }

        // Extension parameters hash
        var extParamStr = '';
        var testExts = ['EXT_texture_filter_anisotropic','OES_standard_derivatives',
                        'WEBGL_debug_renderer_info','EXT_disjoint_timer_query'];
        for (var ei = 0; ei < testExts.length; ei++) {
            var ext = gl.getExtension(testExts[ei]);
            if (ext) extParamStr += testExts[ei] + ':1|';
            else     extParamStr += testExts[ei] + ':0|';
        }

        return {
            contextAttributes:     ctxAttrs,
            contextAttributesHash: ctxHash,
            shaderPrecisions:      precisions,
            shaderPrecisionsHash:  hashStr(precStr),
            extensionPresenceHash: hashStr(extParamStr),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 32. AUDIO BASE LATENCY
// ══════════════════════════════════════════
function getAudioLatency() {
    try {
        var ctx = new AudioContext();
        var result = {
            baseLatency:      ctx.baseLatency      !== undefined ? ctx.baseLatency      : null,
            outputLatency:    ctx.outputLatency     !== undefined ? ctx.outputLatency    : null,
            sampleRate:       ctx.sampleRate,
            state:            ctx.state,
            maxChannelCount:  ctx.destination.maxChannelCount,
            channelCount:     ctx.destination.channelCount,
            channelInterpretation: ctx.destination.channelInterpretation,
        };
        ctx.close();
        return result;
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 33. ARCHITECTURE BYTE PROBE (FP-style)
// ══════════════════════════════════════════
function getArchitectureByte() {
    try {
        // FingerprintJS uses a specific WASM probe that returns 127 on x86 and
        // different values on ARM — it tests how the FPU handles specific operations
        var result = { byte: null, method: null };

        // Method 1: Float32 endianness probe
        var buf = new ArrayBuffer(4);
        var view32 = new Float32Array(buf);
        var view8  = new Uint8Array(buf);
        view32[0] = 1;
        result.float32Byte0 = view8[0]; // 0 on little-endian, 63 on big-endian

        // Method 2: Math operation that differs by FPU
        // This is the actual FingerprintJS architecture byte
        var ab = new ArrayBuffer(1);
        new Uint8Array(ab)[0] = 255;
        var val = new Int8Array(ab)[0];
        result.byte   = val; // -1 on signed, 255 on unsigned → always -1 in JS
        result.method = 'int8_probe';

        // Method 3: WASM memory page probe
        if (window.WebAssembly) {
            try {
                // Minimal WASM that reads memory and returns architecture-dependent value
                var wasmBytes = new Uint8Array([
                    0,97,115,109,1,0,0,0,1,6,1,96,1,127,1,127,3,2,1,0,
                    5,3,1,0,1,10,11,1,9,0,32,0,40,2,0,11
                ]);
                var mod = new WebAssembly.Module(wasmBytes);
                var inst = new WebAssembly.Instance(mod, {});
                result.wasmMemRead = inst.exports ? 'supported' : 'unsupported';
            } catch(we) { result.wasmMemRead = 'error'; }
        }

        // Method 4: Chrome-specific architecture detection
        // navigator.userAgentData gives structured arch info on Chrome
        if (navigator.userAgentData) {
            navigator.userAgentData.getHighEntropyValues(['architecture','bitness','platform','platformVersion','model'])
                .then(function(data) {
                    result.uaDataArch      = data.architecture || null;
                    result.uaDataBitness   = data.bitness || null;
                    result.uaDataPlatform  = data.platform || null;
                    result.uaDataPlatformVersion = data.platformVersion || null;
                    result.uaDataModel     = data.model || null;
                }).catch(function(){});
        }

        return result;
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 34. NAVIGATOR EXTRA (oscpu, cpuClass etc)
// ══════════════════════════════════════════
function getNavigatorExtra() {
    return {
        oscpu:                   navigator.oscpu          || null,
        cpuClass:                navigator.cpuClass       || null,
        buildID:                 navigator.buildID        || null,
        productSub:              navigator.productSub     || null,
        taintEnabled:            typeof navigator.taintEnabled === 'function' ? false : null,
        // User Agent Data (Chrome 90+)
        uaData_brands:           navigator.userAgentData ? navigator.userAgentData.brands : null,
        uaData_mobile:           navigator.userAgentData ? navigator.userAgentData.mobile : null,
        uaData_platform:         navigator.userAgentData ? navigator.userAgentData.platform : null,
        // Private Click Measurement (Safari)
        privateClickMeasurement: !!(window.webkit && window.webkit.messageHandlers),
        webkitMessageHandlers:   window.webkit ? Object.keys(window.webkit.messageHandlers || {}) : null,
        // connection extra
        connection_saveData:     navigator.connection ? navigator.connection.saveData : null,
        // Deprecated but fingerprint-relevant
        mimeTypesLength:         navigator.mimeTypes ? navigator.mimeTypes.length : 0,
        pluginsLength:           navigator.plugins   ? navigator.plugins.length   : 0,
    };
}

// ══════════════════════════════════════════
// 35. COLOR GAMUT STRING + CONTRAST VALUE
// ══════════════════════════════════════════
function getColorAndContrast() {
    // Color gamut as string not boolean
    var gamut = 'srgb';
    if (matchMedia('(color-gamut: rec2020)').matches) gamut = 'rec2020';
    else if (matchMedia('(color-gamut: p3)').matches) gamut  = 'p3';

    // Contrast as numeric (0=no-pref, 1=more, -1=less, 2=forced)
    var contrast = 0;
    if (matchMedia('(prefers-contrast: more)').matches)    contrast = 1;
    else if (matchMedia('(prefers-contrast: less)').matches) contrast = -1;
    else if (matchMedia('(prefers-contrast: forced)').matches) contrast = 2;

    // Monochrome depth
    var monoDepth = 0;
    for (var d = 1; d <= 16; d++) {
        if (matchMedia('(monochrome: ' + d + ')').matches) { monoDepth = d; break; }
    }

    return {
        colorGamutString:  gamut,
        contrastPreference: contrast,
        monochromeDepth:    monoDepth,
        colorDepth:         screen.colorDepth,
        hdrCapability:      matchMedia('(dynamic-range: high)').matches,
    };
}

// ══════════════════════════════════════════
// 36. INCOGNITO / PRIVATE MODE DETECTION
// ══════════════════════════════════════════
function detectIncognito() {
    return new Promise(function(resolve) {
        var result = { isPrivate: false, method: null, confidence: 'low' };

        // Method 1: Safari — storage quota in private mode is 0
        if (window.webkitRequestFileSystem) {
            window.webkitRequestFileSystem(
                window.TEMPORARY, 1,
                function() { resolve(result); },
                function() {
                    result.isPrivate = true;
                    result.method    = 'webkit_filesystem';
                    result.confidence = 'high';
                    resolve(result);
                }
            );
            return;
        }

        // Method 2: Chrome — FileSystem API quota
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(function(est) {
                // In incognito Chrome quota is typically < 120MB
                if (est.quota && est.quota < 120 * 1024 * 1024) {
                    result.isPrivate  = true;
                    result.method     = 'storage_quota';
                    result.confidence = 'medium';
                    result.quota      = est.quota;
                } else {
                    result.quota      = est.quota;
                }
                resolve(result);
            }).catch(function() { resolve(result); });
            return;
        }

        // Method 3: IndexedDB blocked in some private modes
        try {
            var db = indexedDB.open('test_private_' + Math.random());
            db.onerror = function() {
                result.isPrivate  = true;
                result.method     = 'indexeddb_blocked';
                result.confidence = 'medium';
                resolve(result);
            };
            db.onsuccess = function() { resolve(result); };
        } catch(e) {
            result.isPrivate  = true;
            result.method     = 'indexeddb_exception';
            result.confidence = 'medium';
            resolve(result);
        }
    });
}

// ══════════════════════════════════════════
// 37. MATH HASH (single MD5-like hash of all math values)
// ══════════════════════════════════════════
function getMathHash() {
    var vals = [
        Math.tan(-1e300), Math.sin(1), Math.cos(1),
        Math.atan2(90,45), Math.exp(1), Math.log(Math.PI),
        Math.sqrt(2), Math.pow(Math.PI,-100),
        Math.acos(0.123456789), Math.asin(0.123456789),
        Math.sinh(1), Math.cosh(1), Math.tanh(1),
        Math.log2(Math.PI), Math.log10(Math.PI),
        Math.cbrt(2), Math.hypot(3,4), Math.fround(1.337),
        Math.clz32(1), Math.imul(3,4),
    ];
    return hashStr(vals.join(','));
}

// ══════════════════════════════════════════
// 38. ANTI-DETECT / TAMPERING DETECTION
// ══════════════════════════════════════════
function getTampering() {
    var signals = [];
    var score   = 0;

    // 1. navigator.webdriver
    if (navigator.webdriver === true) { signals.push('webdriver_true'); score += 30; }

    // 2. Phantom / Nightmare / known headless properties
    var headlessProps = ['__phantom','_phantom','callPhantom','__nightmare',
                         '__selenium_unwrapped','__webdriver_evaluate','__driver_evaluate',
                         '__webdriver_script_fn','__$webdriverAsyncExecutor',
                         '__lastWatirAlert','__lastWatirConfirm','__lastWatirPrompt',
                         '_Selenium_IDE_Recorder','_selenium','calledSelenium',
                         'selenium','webdriver','domAutomation','domAutomationController'];
    headlessProps.forEach(function(p) {
        try { if (window[p] !== undefined) { signals.push('prop:'+p); score += 20; } } catch(e) {}
    });

    // 3. Chrome-specific headless signals
    try {
        var c = window.chrome;
        if (!c) { signals.push('no_window_chrome'); score += 10; }
        else if (!c.runtime) { signals.push('no_chrome_runtime'); score += 5; }
    } catch(e) {}

    // 4. Permission inconsistency — headless browsers often return denied without prompting
    // (checked async elsewhere, this is sync check)
    try {
        if (navigator.permissions && typeof navigator.permissions.query !== 'function') {
            signals.push('permissions_api_broken'); score += 15;
        }
    } catch(e) {}

    // 5. Plugin count = 0 on a "Chrome" UA
    if (/Chrome/.test(navigator.userAgent) && navigator.plugins.length === 0) {
        signals.push('chrome_no_plugins'); score += 20;
    }

    // 6. Languages empty or single
    if (!navigator.languages || navigator.languages.length === 0) {
        signals.push('empty_languages'); score += 15;
    }

    // 7. Screen dimensions 0
    if (screen.width === 0 || screen.height === 0) {
        signals.push('zero_screen'); score += 30;
    }

    // 8. Prototype toString override detection
    try {
        var toStr = Function.prototype.toString;
        if (/native code/.test(toStr.call(navigator.plugins)) === false) {
            // plugins is not native
        }
        // Check if toString itself is patched
        if (!/native code/.test(Function.prototype.toString.toString())) {
            signals.push('toString_patched'); score += 25;
        }
    } catch(e) { signals.push('toString_error'); score += 10; }

    // 9. Error stack consistency
    try {
        var stack = new Error().stack;
        if (!stack || stack.length < 10) { signals.push('no_stack_trace'); score += 10; }
    } catch(e) {}

    // 10. DevTools open detection via timing
    var devtoolsOpen = false;
    try {
        var t1 = performance.now();
        // eslint-disable-next-line no-debugger
        var t2 = performance.now();
        if (t2 - t1 > 100) { devtoolsOpen = true; signals.push('devtools_timing'); }
    } catch(e) {}

    // 11. iframe detection
    var inIframe = false;
    try { inIframe = window.self !== window.top; } catch(e) { inIframe = true; }
    if (inIframe) { signals.push('in_iframe'); score += 5; }

    // 12. navigator overrides — check if key getters are native
    var overrideChecks = ['userAgent','platform','language','hardwareConcurrency','deviceMemory'];
    overrideChecks.forEach(function(prop) {
        try {
            var desc = Object.getOwnPropertyDescriptor(Navigator.prototype, prop);
            if (desc && desc.get && !/native code/.test(desc.get.toString())) {
                signals.push('override:navigator.' + prop);
                score += 15;
            }
        } catch(e) {}
    });

    return {
        anomalyScore:       score,
        signals:            signals,
        webdriver:          navigator.webdriver,
        inIframe:           inIframe,
        devtoolsOpen:       devtoolsOpen,
        antiDetectBrowser:  score > 40,
    };
}

// ══════════════════════════════════════════
// 39. WebGL — Unsupported Extensions + All Params Hash
// ══════════════════════════════════════════
function getWebGLExtra() {
    try {
        var c  = document.createElement('canvas');
        var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        if (!gl) return { supported: false };

        // All known WebGL extensions to probe
        var allKnown = [
            'ANGLE_instanced_arrays','EXT_blend_minmax','EXT_clip_control',
            'EXT_color_buffer_float','EXT_color_buffer_half_float','EXT_depth_clamp',
            'EXT_disjoint_timer_query','EXT_disjoint_timer_query_webgl2','EXT_float_blend',
            'EXT_frag_depth','EXT_polygon_offset_clamp','EXT_shader_texture_lod',
            'EXT_sRGB','EXT_texture_compression_bptc','EXT_texture_compression_rgtc',
            'EXT_texture_filter_anisotropic','EXT_texture_mirror_clamp_to_edge',
            'KHR_parallel_shader_compile','OES_draw_buffers_indexed','OES_element_index_uint',
            'OES_fbo_render_mipmap','OES_standard_derivatives','OES_texture_float',
            'OES_texture_float_linear','OES_texture_half_float','OES_texture_half_float_linear',
            'OES_vertex_array_object','WEBGL_blend_func_extended','WEBGL_clip_cull_distance',
            'WEBGL_color_buffer_float','WEBGL_compressed_texture_astc',
            'WEBGL_compressed_texture_atc','WEBGL_compressed_texture_etc',
            'WEBGL_compressed_texture_etc1','WEBGL_compressed_texture_pvrtc',
            'WEBGL_compressed_texture_s3tc','WEBGL_compressed_texture_s3tc_srgb',
            'WEBGL_debug_renderer_info','WEBGL_debug_shaders','WEBGL_depth_texture',
            'WEBGL_draw_buffers','WEBGL_lose_context','WEBGL_multi_draw',
            'WEBGL_polygon_mode','WEBKIT_WEBGL_compressed_texture_pvrtc'
        ];
        var supported   = gl.getSupportedExtensions() || [];
        var unsupported = allKnown.filter(function(e) { return supported.indexOf(e) === -1; });

        // Hash of ALL gl.getParameter values
        var paramIds = [
            gl.ACTIVE_TEXTURE, gl.ALIASED_LINE_WIDTH_RANGE, gl.ALIASED_POINT_SIZE_RANGE,
            gl.ALPHA_BITS, gl.ARRAY_BUFFER_BINDING, gl.BLEND, gl.BLEND_COLOR,
            gl.BLEND_DST_ALPHA, gl.BLEND_DST_RGB, gl.BLEND_EQUATION_ALPHA,
            gl.BLEND_EQUATION_RGB, gl.BLEND_SRC_ALPHA, gl.BLEND_SRC_RGB,
            gl.BLUE_BITS, gl.COLOR_CLEAR_VALUE, gl.COLOR_WRITEMASK,
            gl.COMPRESSED_TEXTURE_FORMATS, gl.CULL_FACE, gl.CULL_FACE_MODE,
            gl.CURRENT_PROGRAM, gl.DEPTH_BITS, gl.DEPTH_CLEAR_VALUE,
            gl.DEPTH_FUNC, gl.DEPTH_RANGE, gl.DEPTH_TEST, gl.DEPTH_WRITEMASK,
            gl.DITHER, gl.ELEMENT_ARRAY_BUFFER_BINDING, gl.FRAGMENT_SHADER_DERIVATIVE_HINT_OES,
            gl.FRONT_FACE, gl.GENERATE_MIPMAP_HINT, gl.GREEN_BITS,
            gl.IMPLEMENTATION_COLOR_READ_FORMAT, gl.IMPLEMENTATION_COLOR_READ_TYPE,
            gl.LINE_WIDTH, gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, gl.MAX_CUBE_MAP_TEXTURE_SIZE,
            gl.MAX_FRAGMENT_UNIFORM_VECTORS, gl.MAX_RENDERBUFFER_SIZE, gl.MAX_TEXTURE_IMAGE_UNITS,
            gl.MAX_TEXTURE_SIZE, gl.MAX_VARYING_VECTORS, gl.MAX_VERTEX_ATTRIBS,
            gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS, gl.MAX_VERTEX_UNIFORM_VECTORS,
            gl.MAX_VIEWPORT_DIMS, gl.PACK_ALIGNMENT, gl.POLYGON_OFFSET_FACTOR,
            gl.POLYGON_OFFSET_FILL, gl.POLYGON_OFFSET_UNITS, gl.RED_BITS,
            gl.RENDERER, gl.SAMPLE_BUFFERS, gl.SAMPLE_COVERAGE_INVERT,
            gl.SAMPLE_COVERAGE_VALUE, gl.SAMPLES, gl.SCISSOR_BOX,
            gl.SCISSOR_TEST, gl.SHADING_LANGUAGE_VERSION, gl.STENCIL_BACK_FAIL,
            gl.STENCIL_BACK_FUNC, gl.STENCIL_BACK_PASS_DEPTH_FAIL,
            gl.STENCIL_BACK_PASS_DEPTH_PASS, gl.STENCIL_BACK_REF,
            gl.STENCIL_BACK_VALUE_MASK, gl.STENCIL_BACK_WRITEMASK,
            gl.STENCIL_BITS, gl.STENCIL_CLEAR_VALUE, gl.STENCIL_FAIL,
            gl.STENCIL_FUNC, gl.STENCIL_PASS_DEPTH_FAIL, gl.STENCIL_PASS_DEPTH_PASS,
            gl.STENCIL_REF, gl.STENCIL_TEST, gl.STENCIL_VALUE_MASK,
            gl.STENCIL_WRITEMASK, gl.SUBPIXEL_BITS, gl.UNPACK_ALIGNMENT,
            gl.VENDOR, gl.VERSION, gl.VIEWPORT
        ];
        var paramStr = '';
        paramIds.forEach(function(id) {
            try {
                var v = gl.getParameter(id);
                if (v && v.toString) paramStr += v.toString() + '|';
            } catch(e) {}
        });

        return {
            unsupportedExtensions:  unsupported,
            unsupportedCount:       unsupported.length,
            allParametersHash:      hashStr(paramStr),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 40. DATETIME LOCALE via Intl.NumberFormat (FP method)
// ══════════════════════════════════════════
function getDateTimeLocale() {
    try {
        // FP detects locale via number formatting differences
        var numFmt = new Intl.NumberFormat();
        var numOpts = numFmt.resolvedOptions();
        var dtFmt   = new Intl.DateTimeFormat();
        var dtOpts  = dtFmt.resolvedOptions();

        // Test number formatting differences per locale
        var testNum = 1234567.89;
        var formatted = numFmt.format(testNum);

        // Relative time format
        var rtf = null;
        try {
            var rf = new Intl.RelativeTimeFormat();
            rtf = rf.resolvedOptions().locale;
        } catch(e) {}

        // Collator locale
        var collatorLocale = null;
        try {
            collatorLocale = new Intl.Collator().resolvedOptions().locale;
        } catch(e) {}

        // PluralRules locale
        var pluralLocale = null;
        try {
            pluralLocale = new Intl.PluralRules().resolvedOptions().locale;
        } catch(e) {}

        return {
            numberFormatLocale:   numOpts.locale,
            numberingSystem:      numOpts.numberingSystem,
            formattedTestNumber:  formatted,
            dateTimeLocale:       dtOpts.locale,
            dateTimeCalendar:     dtOpts.calendar,
            dateTimeHourCycle:    dtOpts.hourCycle,
            dateTimeTimeZone:     dtOpts.timeZone,
            relativeTimeLocale:   rtf,
            collatorLocale:       collatorLocale,
            pluralRulesLocale:    pluralLocale,
            localeHash:           hashStr([numOpts.locale, dtOpts.locale, formatted].join('|')),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 41. MULTI-MONITOR DETECTION
// ══════════════════════════════════════════
function getMultiMonitor() {
    var result = {
        isExtended:           screen.isExtended || false,
        getScreenDetailsAPI:  !!window.getScreenDetails,
        screenCount:          null,
        screens:              null,
    };
    return result;
}

async function getMultiMonitorAsync() {
    var result = getMultiMonitor();
    if (window.getScreenDetails) {
        try {
            var details = await window.getScreenDetails();
            result.screenCount = details.screens ? details.screens.length : null;
            if (details.screens) {
                result.screens = details.screens.map(function(s) {
                    return {
                        width: s.width, height: s.height,
                        left: s.left, top: s.top,
                        isPrimary: s.isPrimary,
                        isInternal: s.isInternal,
                        devicePixelRatio: s.devicePixelRatio,
                        colorDepth: s.colorDepth,
                    };
                });
            }
        } catch(e) { result.screenDetailsError = e.name; }
    }
    return result;
}

// ══════════════════════════════════════════
// 42. PWA / DISPLAY MODE
// ══════════════════════════════════════════
function getPWAInfo() {
    var displayMode = 'browser';
    if (matchMedia('(display-mode: fullscreen)').matches)   displayMode = 'fullscreen';
    else if (matchMedia('(display-mode: standalone)').matches)   displayMode = 'standalone';
    else if (matchMedia('(display-mode: minimal-ui)').matches)   displayMode = 'minimal-ui';
    else if (matchMedia('(display-mode: window-controls-overlay)').matches) displayMode = 'window-controls-overlay';

    return {
        displayMode:           displayMode,
        isStandalone:          matchMedia('(display-mode: standalone)').matches,
        navigatorStandalone:   navigator.standalone || false,
        isInstalled:           matchMedia('(display-mode: standalone)').matches || !!navigator.standalone,
        launchQueue:           !!window.launchQueue,
        getInstalledRelatedApps: !!(navigator.getInstalledRelatedApps),
    };
}

// ══════════════════════════════════════════
// 43. MEDIA CAPABILITIES
// ══════════════════════════════════════════
function getMediaCapabilities() {
    return new Promise(function(resolve) {
        if (!navigator.mediaCapabilities) return resolve({ supported: false });
        var configs = [
            { type: 'file', video: { contentType: 'video/mp4; codecs="avc1.42E01E"', width: 1920, height: 1080, bitrate: 2000000, framerate: 30 } },
            { type: 'file', video: { contentType: 'video/webm; codecs="vp9"',         width: 1920, height: 1080, bitrate: 2000000, framerate: 30 } },
            { type: 'file', video: { contentType: 'video/mp4; codecs="av01.0.05M.08"',width: 1920, height: 1080, bitrate: 2000000, framerate: 30 } },
            { type: 'file', audio: { contentType: 'audio/mp4; codecs="mp4a.40.2"',    channels: 2, bitrate: 128000, samplerate: 44100 } },
            { type: 'file', audio: { contentType: 'audio/webm; codecs="opus"',        channels: 2, bitrate: 128000, samplerate: 48000 } },
        ];
        var results = {};
        var promises = configs.map(function(cfg) {
            var key = cfg.video ? cfg.video.contentType : cfg.audio.contentType;
            var fn  = cfg.video ? navigator.mediaCapabilities.decodingInfo(cfg) :
                                  navigator.mediaCapabilities.decodingInfo(cfg);
            return fn.then(function(r) {
                results[key] = { supported: r.supported, smooth: r.smooth, powerEfficient: r.powerEfficient };
            }).catch(function(e) { results[key] = { error: e.message }; });
        });
        Promise.all(promises).then(function() { resolve({ supported: true, codecs: results }); })
               .catch(function() { resolve({ supported: true, codecs: results }); });
    });
}

// ══════════════════════════════════════════
// 44. RTC RTP CODEC CAPABILITIES
// ══════════════════════════════════════════
function getRTCCapabilities() {
    try {
        if (!window.RTCRtpSender || !RTCRtpSender.getCapabilities) return { supported: false };
        var video = RTCRtpSender.getCapabilities('video');
        var audio = RTCRtpSender.getCapabilities('audio');
        return {
            supported:    true,
            videoCodecs:  video ? video.codecs.map(function(c) { return { mimeType: c.mimeType, clockRate: c.clockRate, sdpFmtpLine: c.sdpFmtpLine || null }; }) : null,
            audioCodecs:  audio ? audio.codecs.map(function(c) { return { mimeType: c.mimeType, clockRate: c.clockRate, channels: c.channels || null }; }) : null,
            videoCount:   video ? video.codecs.length : 0,
            audioCount:   audio ? audio.codecs.length : 0,
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 45. PERFORMANCE OBSERVER ENTRY TYPES
// ══════════════════════════════════════════
function getPerformanceObserverTypes() {
    try {
        if (!window.PerformanceObserver || !PerformanceObserver.supportedEntryTypes) return { supported: false };
        return {
            supported:   true,
            entryTypes:  Array.from(PerformanceObserver.supportedEntryTypes),
            count:       PerformanceObserver.supportedEntryTypes.length,
            hash:        hashStr(Array.from(PerformanceObserver.supportedEntryTypes).sort().join('|')),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 46. DOCUMENT FEATURE POLICY
// ══════════════════════════════════════════
function getFeaturePolicy() {
    try {
        var fp = document.featurePolicy || document.permissionsPolicy;
        if (!fp) return { supported: false };
        var features = fp.allowedFeatures ? fp.allowedFeatures() : [];
        var checks = [
            'camera','microphone','geolocation','payment','usb','bluetooth',
            'accelerometer','gyroscope','magnetometer','fullscreen',
            'picture-in-picture','autoplay','encrypted-media','midi',
            'screen-wake-lock','xr-spatial-tracking','ambient-light-sensor',
            'battery','document-domain','sync-xhr','clipboard-read','clipboard-write',
        ];
        var allowed = {}, features_arr = Array.from(features);
        checks.forEach(function(f) {
            try { allowed[f] = fp.allowsFeature ? fp.allowsFeature(f) : features_arr.indexOf(f) > -1; }
            catch(e) { allowed[f] = null; }
        });
        return { supported: true, allowedFeatures: features_arr, allowedCount: features_arr.length, featureStates: allowed };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 47. EXTENDED BROWSER API PRESENCE
// ══════════════════════════════════════════
function getAPIPresence() {
    // Canvas 2D new method support
    var canvasRoundRect = false, canvasReset = false, canvasFilter = false;
    try {
        var tc = document.createElement('canvas').getContext('2d');
        canvasRoundRect = typeof tc.roundRect === 'function';
        canvasReset     = typeof tc.reset     === 'function';
        canvasFilter    = 'filter' in tc;
    } catch(e) {}

    // document.fonts.ready timing
    var fontsReady = null;
    try { fontsReady = !!document.fonts && !!document.fonts.ready; } catch(e) {}

    return {
        // Network / Transport
        webTransport:            !!window.WebTransport,
        webRTC_insertable_streams: !!(window.RTCRtpSender && RTCRtpSender.prototype.createEncodedStreams),
        // Compression
        compressionStream:       !!window.CompressionStream,
        decompressionStream:     !!window.DecompressionStream,
        // Security
        trustedTypes:            !!window.TrustedTypes || !!(window.trustedTypes),
        reportingObserver:       !!window.ReportingObserver,
        // Navigation
        navigationAPI:           !!window.navigation,
        // Sanitizer
        sanitizerAPI:            !!window.Sanitizer,
        // Scheduling
        schedulerPostTask:       !!(window.scheduler && window.scheduler.postTask),
        taskController:          !!window.TaskController,
        // Idle Detection
        idleDetector:            !!window.IdleDetector,
        // Picture in Picture
        documentPiP:             !!window.DocumentPictureInPicture,
        // Storage
        storageManager:          !!(navigator.storage && navigator.storage.estimate),
        fileSystemAccess:        !!window.showOpenFilePicker,
        accessHandle:            !!window.FileSystemFileHandle,
        // Worklets
        cssHoudini:              !!(window.CSS && CSS.paintWorklet),
        audioWorklet:            !!(window.AudioWorklet || (window.AudioContext && AudioContext.prototype.audioWorklet)),
        // Misc Chrome-specific
        abortSignalAny:          !!(window.AbortSignal && AbortSignal.any),
        abortSignalTimeout:      !!(window.AbortSignal && AbortSignal.timeout),
        structuredClone:         !!window.structuredClone,
        webLocks:                !!navigator.locks,
        keyboardAPI:             !!navigator.keyboard,
        presentationAPI:         !!navigator.presentation,
        midiAccess:              !!navigator.requestMIDIAccess,
        digitalGoods:            !!window.getDigitalGoodsService,
        userActivation:          !!navigator.userActivation,
        windowControlsOverlay:   !!(navigator.windowControlsOverlay),
        cookieStore:             !!window.cookieStore,
        backgroundFetch:         !!(window.BackgroundFetchManager),
        periodicSync:            !!(window.PeriodicSyncManager),
        contentIndex:            !!(window.ContentIndex),
        paymentHandler:          !!(window.PaymentRequestEvent),
        // Canvas 2D new methods
        canvasRoundRect:         canvasRoundRect,
        canvasReset:             canvasReset,
        canvasFilter:            canvasFilter,
        // Fonts
        fontsReadyAPI:           fontsReady,
        fontFaceSet:             !!(document.fonts),
        // CSS Houdini
        cssTypedOM:              !!(window.CSSUnitValue),
        cssLayoutWorklet:        !!(window.CSS && CSS.layoutWorklet),
        // Other
        eyeDropper:              !!window.EyeDropper,
        getScreenDetails:        !!window.getScreenDetails,
        virtualKeyboard:         !!(navigator.virtualKeyboard),
        handwriting:             !!(navigator.createHandwritingRecognizer),
        ink:                     !!(navigator.ink),
        serial:                  !!navigator.serial,
        hid:                     !!navigator.hid,
        userAgentData:           !!navigator.userAgentData,
    };
}

// ══════════════════════════════════════════
// 48. NAVIGATOR USER ACTIVATION
// ══════════════════════════════════════════
function getUserActivation() {
    try {
        if (!navigator.userActivation) return { supported: false };
        return {
            supported:      true,
            isActive:       navigator.userActivation.isActive,
            hasBeenActive:  navigator.userActivation.hasBeenActive,
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 49. NETWORK EXTENDED
// ══════════════════════════════════════════
function getNetworkExtended() {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return null;
    return {
        effectiveType:  conn.effectiveType  || null,
        downlink:       conn.downlink       || null,
        downlinkMax:    conn.downlinkMax    || null,
        rtt:            conn.rtt            || null,
        saveData:       conn.saveData       || false,
        type:           conn.type           || null,
        onchange:       typeof conn.onchange === 'function' || conn.onchange !== undefined,
    };
}

// ══════════════════════════════════════════
// 50. PERFORMANCE EVENT COUNTS
// ══════════════════════════════════════════
function getEventCounts() {
    try {
        if (!performance.eventCounts) return { supported: false };
        var result = { supported: true, counts: {} };
        performance.eventCounts.forEach(function(value, key) {
            result.counts[key] = value;
        });
        result.totalEvents = Object.values(result.counts).reduce(function(s,v){return s+v;}, 0);
        return result;
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 51. STORAGE ACCESS + COOKIE STORE
// ══════════════════════════════════════════
function getStorageInfo() {
    return new Promise(function(resolve) {
        var result = {
            storageEstimate:     null,
            persistentStorage:   null,
            hasStorageAccess:    null,
            cookieStoreSupported: !!window.cookieStore,
        };
        var p1 = navigator.storage && navigator.storage.estimate
            ? navigator.storage.estimate().then(function(e) {
                result.storageEstimate = { quota: e.quota, usage: e.usage,
                    usageDetails: e.usageDetails || null };
            }).catch(function(){})
            : Promise.resolve();

        var p2 = navigator.storage && navigator.storage.persisted
            ? navigator.storage.persisted().then(function(p) {
                result.persistentStorage = p;
            }).catch(function(){})
            : Promise.resolve();

        var p3 = document.hasStorageAccess
            ? document.hasStorageAccess().then(function(a) {
                result.hasStorageAccess = a;
            }).catch(function(){})
            : Promise.resolve();

        Promise.all([p1, p2, p3]).then(function() { resolve(result); })
               .catch(function() { resolve(result); });
    });
}

// ══════════════════════════════════════════
// 52. DOCUMENT FONTS TIMING
// ══════════════════════════════════════════
function getFontLoadingInfo() {
    return new Promise(function(resolve) {
        try {
            if (!document.fonts || !document.fonts.ready) return resolve({ supported: false });
            var start = performance.now();
            document.fonts.ready.then(function() {
                var elapsed = performance.now() - start;
                resolve({
                    supported:          true,
                    readyTimeMs:        +elapsed.toFixed(2),
                    status:             document.fonts.status,
                    loadedFamilies:     document.fonts.size,
                });
            }).catch(function() { resolve({ supported: true, error: 'ready_rejected' }); });
        } catch(e) { resolve({ error: e.message }); }
    });
}

// ══════════════════════════════════════════
// 53. USER AGENT DATA HIGH ENTROPY (Chrome)
// ══════════════════════════════════════════
function getUADataHighEntropy() {
    return new Promise(function(resolve) {
        if (!navigator.userAgentData) return resolve({ supported: false });
        navigator.userAgentData.getHighEntropyValues([
            'architecture','bitness','brands','fullVersionList',
            'mobile','model','platform','platformVersion','uaFullVersion'
        ]).then(function(data) {
            resolve({
                supported:       true,
                architecture:    data.architecture    || null,
                bitness:         data.bitness         || null,
                brands:          data.brands          || null,
                fullVersionList: data.fullVersionList || null,
                mobile:          data.mobile          || null,
                model:           data.model           || null,
                platform:        data.platform        || null,
                platformVersion: data.platformVersion || null,
                uaFullVersion:   data.uaFullVersion   || null,
            });
        }).catch(function(e) { resolve({ supported: true, error: e.message }); });
    });
}

// ══════════════════════════════════════════
// 54. HYPERVISOR / VM TIMING PROBE (#117)
// ══════════════════════════════════════════
function getHypervisorProbe() {
    try {
        // VMs have characteristic timing anomalies due to hypervisor interrupts
        // We measure variance in tight loops — real hardware is more consistent
        var samples = [];
        for (var i = 0; i < 50; i++) {
            var t1 = performance.now();
            // Tight computation loop
            var x = 0;
            for (var j = 0; j < 1000; j++) x += Math.sqrt(j);
            var t2 = performance.now();
            samples.push(+(t2 - t1).toFixed(4));
        }
        samples.sort(function(a,b){return a-b;});
        var trimmed = samples.slice(5, 45); // remove outliers
        var mean = trimmed.reduce(function(s,v){return s+v;},0) / trimmed.length;
        var variance = trimmed.reduce(function(s,v){return s+Math.pow(v-mean,2);},0) / trimmed.length;
        var stdDev = Math.sqrt(variance);
        // High stdDev relative to mean suggests VM/hypervisor scheduling jitter
        var cvPercent = mean > 0 ? (stdDev / mean * 100) : 0;

        return {
            mean_ms:         +mean.toFixed(4),
            stdDev_ms:       +stdDev.toFixed(4),
            min_ms:          +Math.min.apply(null,trimmed).toFixed(4),
            max_ms:          +Math.max.apply(null,trimmed).toFixed(4),
            cv_percent:      +cvPercent.toFixed(2),
            // High CV% (>30%) may indicate VM — not definitive but a signal
            possibleVM:      cvPercent > 30,
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 55. MEMORY ALLOCATION PATTERNS (#114)
// ══════════════════════════════════════════
function getMemoryPattern() {
    try {
        if (!window.WebAssembly) return { supported: false };
        // Measure allocation timing for different sizes
        var results = [];
        var sizes = [1, 10, 50, 100, 256]; // in pages (64KB each)
        sizes.forEach(function(pages) {
            try {
                var t1 = performance.now();
                var mem = new WebAssembly.Memory({ initial: pages });
                var t2 = performance.now();
                // Touch the memory to force actual allocation
                var view = new Uint8Array(mem.buffer);
                view[0] = 1;
                view[view.length - 1] = 1;
                var t3 = performance.now();
                results.push({
                    pages:       pages,
                    sizeKB:      pages * 64,
                    allocMs:     +(t2-t1).toFixed(4),
                    touchMs:     +(t3-t2).toFixed(4),
                });
            } catch(e) {}
        });
        return {
            supported:     true,
            allocations:   results,
            patternHash:   hashStr(results.map(function(r){return r.allocMs.toFixed(2);}).join('|')),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 56. CSS FONT TIMING METHOD (#41)
// ══════════════════════════════════════════
function getFontsByCSSTiming() {
    try {
        var testFonts = [
            'Arial','Georgia','Helvetica','Verdana','Times New Roman',
            'Courier New','Impact','Trebuchet MS','Comic Sans MS',
            'Palatino Linotype','Garamond','Baskerville','Futura',
            'Gill Sans','Optima','Didot','Helvetica Neue','Geneva',
            'Monaco','Menlo','SF Pro','Avenir','Avenir Next',
            'Hoefler Text','American Typewriter','Apple Color Emoji',
            'Segoe UI','Segoe UI Emoji','Consolas','Calibri','Cambria',
            'Roboto','Open Sans','Lato','Montserrat','Source Sans Pro',
        ];
        var baseFont = 'monospace';
        var testStr  = 'abcdefghijklmnopqrstuvwxyzABCDEF0123456789';
        var span = document.createElement('span');
        span.style.cssText = 'position:absolute;top:-9999px;left:-9999px;font-size:72px;visibility:hidden;white-space:nowrap;';
        span.textContent = testStr;
        document.body.appendChild(span);

        // Baseline width with monospace
        span.style.fontFamily = baseFont;
        var baseW = span.offsetWidth;
        var baseH = span.offsetHeight;

        var detected = [];
        testFonts.forEach(function(font) {
            span.style.fontFamily = '"' + font + '",' + baseFont;
            if (span.offsetWidth !== baseW || span.offsetHeight !== baseH) {
                detected.push(font);
            }
        });
        document.body.removeChild(span);

        return { detected: detected, count: detected.length, method: 'css_offsetWidth' };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 57. SECURITY CONTEXT SIGNALS
// ══════════════════════════════════════════
function getSecurityContext() {
    // openDatabase deprecation error type
    var openDbStatus = 'absent';
    try {
        if (window.openDatabase) {
            try {
                window.openDatabase(':memory:', '1.0', '', 1);
                openDbStatus = 'works';
            } catch(e) {
                openDbStatus = e.name || 'error';  // SecurityError in Chrome 119+
            }
        }
    } catch(e) {}

    // Canvas colorSpace wide-gamut support (Chrome 98+)
    var canvasColorSpaceP3 = false;
    var canvasColorSpaceSRGB = false;
    try {
        var tc = document.createElement('canvas');
        var ctx2 = tc.getContext('2d', { colorSpace: 'display-p3' });
        canvasColorSpaceP3 = !!(ctx2 && ctx2.getContextAttributes && ctx2.getContextAttributes().colorSpace === 'display-p3');
        var ctx3 = tc.getContext('2d', { colorSpace: 'srgb' });
        canvasColorSpaceSRGB = !!(ctx3);
    } catch(e) {}

    return {
        crossOriginIsolated:       !!window.crossOriginIsolated,
        isSecureContext:           !!window.isSecureContext,
        originAgentCluster:        !!window.originAgentCluster,
        documentPrerendering:      !!(document.prerendering),
        credentialless:            !!(window.credentialless),
        hasPrivateToken:           !!(document.hasPrivateToken),
        openDatabaseStatus:        openDbStatus,
        canvasColorSpaceP3:        canvasColorSpaceP3,
        canvasColorSpaceSRGB:      canvasColorSpaceSRGB,
    };
}

// ══════════════════════════════════════════
// 58. VISUAL VIEWPORT
// ══════════════════════════════════════════
function getVisualViewport() {
    try {
        var vv = window.visualViewport;
        if (!vv) return { supported: false };
        return {
            supported:    true,
            width:        +vv.width.toFixed(2),
            height:       +vv.height.toFixed(2),
            offsetLeft:   +vv.offsetLeft.toFixed(2),
            offsetTop:    +vv.offsetTop.toFixed(2),
            pageLeft:     +vv.pageLeft.toFixed(2),
            pageTop:      +vv.pageTop.toFixed(2),
            scale:        +vv.scale.toFixed(4),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 59. MEDIA DEVICES CONSTRAINTS
// ══════════════════════════════════════════
function getMediaConstraints() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
            return { supported: false };
        }
        var c = navigator.mediaDevices.getSupportedConstraints();
        return {
            supported:   true,
            constraints: c,
            count:       Object.keys(c).filter(function(k){return c[k];}).length,
            hash:        hashStr(Object.keys(c).filter(function(k){return c[k];}).sort().join('|')),
        };
    } catch(e) { return { error: e.message }; }
}

// ══════════════════════════════════════════
// 60. JS ENGINE CAPABILITY SIGNALS
// ══════════════════════════════════════════
function getJSEngineSignals() {
    // WeakRef / FinalizationRegistry — V8 >= Chrome 84, SpiderMonkey >= FF79
    var weakRef = false, finalizationRegistry = false;
    try { weakRef = !!window.WeakRef; } catch(e) {}
    try { finalizationRegistry = !!window.FinalizationRegistry; } catch(e) {}

    // Atomics — SharedArrayBuffer availability
    var atomics = false, sharedArrayBuffer = false;
    try { atomics = !!window.Atomics; } catch(e) {}
    try { sharedArrayBuffer = !!window.SharedArrayBuffer; } catch(e) {}

    // ReadableStream, WritableStream, TransformStream
    var readableStream = !!window.ReadableStream;
    var writableStream = !!window.WritableStream;
    var transformStream = !!window.TransformStream;
    var byobReader = !!(window.ReadableStream && ReadableStream.prototype.getReader);

    // Error types present
    var errorTypes = ['Error','EvalError','RangeError','ReferenceError',
                      'SyntaxError','TypeError','URIError','AggregateError'];
    var presentErrors = errorTypes.filter(function(t) { return !!window[t]; });

    // Newer JS features
    var logicalAssign = false;
    try { eval('var _x=1; _x??=2;'); logicalAssign = true; } catch(e) {}

    var optionalChaining = false;
    try { eval('var _o={a:{b:1}}; _o?.a?.b;'); optionalChaining = true; } catch(e) {}

    var nullishCoalescing = false;
    try { eval('var _n = null ?? "ok";'); nullishCoalescing = true; } catch(e) {}

    var privateClassFields = false;
    try { eval('class _T { #x = 1; }'); privateClassFields = true; } catch(e) {}

    var topLevelAwait = false; // Can't truly test sync, skip

    // Array methods
    var arrayAt        = typeof Array.prototype.at === 'function';
    var arrayFindLast  = typeof Array.prototype.findLast === 'function';
    var objectHasOwn   = typeof Object.hasOwn === 'function';
    var promiseAny     = typeof Promise.any === 'function';
    var structuredClone = !!window.structuredClone;

    return {
        weakRef:              weakRef,
        finalizationRegistry: finalizationRegistry,
        atomics:              atomics,
        sharedArrayBuffer:    sharedArrayBuffer,
        readableStream:       readableStream,
        writableStream:       writableStream,
        transformStream:      transformStream,
        byobReader:           byobReader,
        logicalAssign:        logicalAssign,
        optionalChaining:     optionalChaining,
        nullishCoalescing:    nullishCoalescing,
        privateClassFields:   privateClassFields,
        arrayAt:              arrayAt,
        arrayFindLast:        arrayFindLast,
        objectHasOwn:         objectHasOwn,
        promiseAny:           promiseAny,
        structuredClone:      structuredClone,
        presentErrorTypes:    presentErrors,
        cryptoRandomUUID:     !!(window.crypto && window.crypto.randomUUID),
        queueMicrotask:       !!window.queueMicrotask,
        reportError:          !!window.reportError,
        adoptedStyleSheets:   !!(document.adoptedStyleSheets !== undefined),
        interactionCount:     !!(performance.interactionCount !== undefined),
    };
}

// ══════════════════════════════════════════
// 61. EXTENDED PERMISSIONS QUERY
// ══════════════════════════════════════════
function getExtendedPermissions() {
    return new Promise(function(resolve) {
        if (!navigator.permissions || !navigator.permissions.query) {
            return resolve({ supported: false });
        }
        var extra = ['push','speaker-selection','window-management',
                     'local-fonts','captured-surface-control',
                     'keyboard-lock','pointer-lock','fullscreen'];
        var results = {};
        var promises = extra.map(function(name) {
            return navigator.permissions.query({ name: name })
                .then(function(r) { results[name] = r.state; })
                .catch(function(e) { results[name] = 'unsupported'; });
        });
        Promise.all(promises).then(function() {
            resolve({ supported: true, permissions: results });
        }).catch(function() { resolve({ supported: true, permissions: results }); });
    });
}

// ══════════════════════════════════════════
// MAIN COLLECTOR
// ══════════════════════════════════════════
async function collect() {
    step('[1/21] Navigator...');
    var nav = getNavigator();

    step('[2/21] Screen...');
    var scr = getScreen();

    step('[3/21] Canvas...');
    var canvas = getCanvas();

    step('[4/21] WebGL...');
    var webgl      = getWebGL();
    var webgl2     = getWebGL2();
    var webglPrec  = getWebGLPrecisions();

    step('[5/21] Audio...');
    var audio        = await getAudio();
    var audioLatency = getAudioLatency();

    step('[6/21] Fonts...');
    var fonts       = getFonts();
    var fontPrefs   = getFontPreferences();

    step('[7/21] Plugins & MIME...');
    var pluginData = getPlugins();

    step('[8/21] WebRTC IPs...');
    var webrtc = await getWebRTC();

    step('[9/21] Refresh Rate...');
    var refreshRate = await getRefreshRate();

    step('[10/21] CPU/WASM...');
    var cpu      = getCPU();
    var archByte = getArchitectureByte();

    step('[11/21] Video Decoder...');
    var videoDecoder = await getVideoDecoder();

    step('[12/21] Permissions & Voices...');
    var permissions     = await getPermissions();
    var extPermissions  = await getExtendedPermissions();
    var voices          = await getVoices();
    var battery         = await getBattery();
    var mediaDevices    = await getMediaDevices();

    step('[13/21] Dom Blockers...');
    var domBlockers = getDomBlockers();

    step('[14/21] Incognito Detection...');
    var incognito = await detectIncognito();

    step('[15/21] Emoji / MathML / Screen Frame...');
    var emojiBB     = getEmojiBoundingBox();
    var mathmlBB    = getMathMLBoundingBox();
    var screenFrame = getScreenFrame();

    step('[16/21] Tampering / Vendor Flavors...');
    var tampering     = getTampering();
    var vendorFlavors = getVendorFlavors();
    var navExtra      = getNavigatorExtra();

    step('[17/21] WebGL Extended / RTC Codecs / Feature Policy...');
    var webglExtra      = getWebGLExtra();
    var rtcCaps         = getRTCCapabilities();
    var featurePolicy   = getFeaturePolicy();
    var perfObsTypes    = getPerformanceObserverTypes();
    var apiPresence     = getAPIPresence();
    var userActivation  = getUserActivation();
    var networkExtended = getNetworkExtended();
    var eventCounts     = getEventCounts();
    var multiMonitor    = await getMultiMonitorAsync();
    var pwInfo          = getPWAInfo();
    var colorContrast   = getColorAndContrast();
    var dtLocale        = getDateTimeLocale();
    var hypervisor      = getHypervisorProbe();
    var memPattern      = getMemoryPattern();
    var fontCSS         = getFontsByCSSTiming();

    step('[18/21] Media Capabilities / UA High Entropy...');
    var mediaCaps     = await getMediaCapabilities();
    var uaHighEntropy = await getUADataHighEntropy();

    step('[19/21] Storage / Font Loading...');
    var storageInfo = await getStorageInfo();
    var fontLoading = await getFontLoadingInfo();

    step('[20/21] Security Context / Visual Viewport / JS Engine...');
    var securityCtx = getSecurityContext();
    var visualVP    = getVisualViewport();
    var mediaConstr = getMediaConstraints();
    var jsEngine    = getJSEngineSignals();

    step('[21/21] Finalising...');
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var dtf  = Intl.DateTimeFormat().resolvedOptions();

    return {
        // ── #1-14 Navigator
        navigator: nav,

        // ── #15-22 Screen
        screen: scr,

        // ── #23-25 Locale/Timezone
        locale: {
            timezone:        dtf.timeZone,
            timezoneOffset:  new Date().getTimezoneOffset(),
            locale:          dtf.locale,
            calendar:        dtf.calendar,
            numberingSystem: dtf.numberingSystem,
            hourCycle:       dtf.hourCycle,
            localeDateString: new Date().toLocaleDateString(),
            localeTimeString: new Date().toLocaleTimeString(),
        },

        // ── #26 Canvas
        canvas: canvas,

        // ── #27-33, #104, #119-120, #124 WebGL
        webgl:  webgl,
        webgl2: webgl2,

        // ── #34-37, #121 Audio
        audio: audio,

        // ── #38-39 Plugins & MIME
        plugins:   pluginData.plugins,
        mimeTypes: pluginData.mimeTypes,

        // ── #40-41 Fonts
        fonts: fonts,

        // ── #42-46, #50-53, #67, #69-70, misc Features
        features: getFeatures(),

        // ── #47-48 WebRTC
        webrtc: webrtc,

        // ── #49 Battery
        battery: battery,

        // ── #54 Media Devices
        mediaDevices: mediaDevices,

        // ── #55-58 Network
        network: conn ? {
            effectiveType: conn.effectiveType,
            downlink:      conn.downlink,
            rtt:           conn.rtt,
            saveData:      conn.saveData,
            type:          conn.type || null,
        } : null,

        // ── #59-65 Media Queries
        mediaQueries: {
            darkMode:           matchMedia('(prefers-color-scheme: dark)').matches,
            lightMode:          matchMedia('(prefers-color-scheme: light)').matches,
            reducedMotion:      matchMedia('(prefers-reduced-motion: reduce)').matches,
            reducedTransparency:matchMedia('(prefers-reduced-transparency: reduce)').matches,
            reducedData:        matchMedia('(prefers-reduced-data: reduce)').matches,
            highContrast:       matchMedia('(forced-colors: active)').matches,
            invertedColors:     matchMedia('(inverted-colors: inverted)').matches,
            hdr:                matchMedia('(dynamic-range: high)').matches,
            coarsePointer:      matchMedia('(pointer: coarse)').matches,
            finePointer:        matchMedia('(pointer: fine)').matches,
            noPointer:          matchMedia('(pointer: none)').matches,
            hover:              matchMedia('(hover: hover)').matches,
            anyHover:           matchMedia('(any-hover: hover)').matches,
            colorGamutSRGB:     matchMedia('(color-gamut: srgb)').matches,
            colorGamutP3:       matchMedia('(color-gamut: p3)').matches,
            colorGamutRec2020:  matchMedia('(color-gamut: rec2020)').matches,
            print:              matchMedia('print').matches,
            monochrome:         matchMedia('(monochrome)').matches,
            overflowInline:     matchMedia('(overflow-inline: scroll)').matches,
        },

        // ── #66 Permissions
        permissions: permissions,

        // ── #68 Speech Voices
        speechVoices: voices,

        // ── #71-73 Document
        document: getDocument(),

        // ── #74 Math
        math: getMath(),

        // ── #75, #103, #112 Performance
        performance: getPerformance(),

        // ── #76 Error Stack
        stackTrace: getStackTrace(),

        // ── #77-78 Internals
        internals: getInternals(),

        // ── #79-80 CSS
        cssSupport: getCSS(),
        cssComputedStyles: getCSSStyles(),

        // ── #101-102 CPU/WASM
        cpu:          cpu,
        architecture: archByte,

        // ── #123 Refresh Rate
        refreshRate: refreshRate,

        // ── #125 Video Decoder
        videoDecoder: videoDecoder,

        // ── #126-133 Behavioral (collected passively)
        behavioral: getBehavioral(),

        // ══ FingerprintJS Extra Parameters ══
        fontPreferences:    fontPrefs,
        webglPrecisions:    webglPrec,
        audioLatency:       audioLatency,
        domBlockers:        domBlockers,
        emojiBoundingBox:   emojiBB,
        mathmlBoundingBox:  mathmlBB,
        screenFrame:        screenFrame,
        colorProfile:       colorContrast,
        vendorFlavors:      vendorFlavors,
        navigatorExtra:     navExtra,
        incognito:          incognito,
        tampering:          tampering,
        mathHash:           getMathHash(),

        // ══ New Extended Parameters ══

        // WebGL unsupported extensions + full params hash
        webglExtra:          webglExtra,

        // DateTime locale via Intl.NumberFormat (FP method)
        dateTimeLocale:      dtLocale,

        // Multi-monitor detection
        multiMonitor:        multiMonitor,

        // PWA / display mode
        pwaInfo:             pwInfo,

        // Media capabilities (codec decode quality)
        mediaCapabilities:   mediaCaps,

        // RTC RTP codec list
        rtcCapabilities:     rtcCaps,

        // PerformanceObserver entry types
        perfObserverTypes:   perfObsTypes,

        // document.featurePolicy allowed features
        featurePolicy:       featurePolicy,

        // Extended API presence (40+ signals)
        apiPresence:         apiPresence,

        // navigator.userActivation
        userActivation:      userActivation,

        // Network extended (downlinkMax etc)
        networkExtended:     networkExtended,

        // performance.eventCounts
        eventCounts:         eventCounts,

        // UA high entropy values (Chrome only)
        uaHighEntropy:       uaHighEntropy,

        // Storage estimate + hasStorageAccess
        storageInfo:         storageInfo,

        // document.fonts.ready timing
        fontLoading:         fontLoading,

        // Hypervisor timing probe (#117)
        hypervisorProbe:     hypervisor,

        // Memory allocation patterns (#114)
        memoryPattern:       memPattern,

        // Font detection via CSS offsetWidth method (#41)
        fontsByCSS:          fontCSS,

        // ══ Final batch — security / viewport / JS engine ══

        // Extended permissions (push, speaker-selection etc)
        extendedPermissions: extPermissions,

        // Security context (crossOriginIsolated, isSecureContext, etc)
        securityContext:     securityCtx,

        // Visual viewport (scale, offset, dimensions)
        visualViewport:      visualVP,

        // Media device getSupportedConstraints
        mediaConstraints:    mediaConstr,

        // JS engine capability signals (WeakRef, Streams, new syntax, etc)
        jsEngine:            jsEngine,

        // Math values as single hash
        mathHash: getMathHash(),
    };
}

// ══════════════════════════════════════════
// RUN
// ══════════════════════════════════════════
(async function() {
    var status = document.getElementById('status');
    var output = document.getElementById('output');
    try {
        var clientData = await collect();
        step('Sending to server...');
        var res = await fetch(window.location.href, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            body:    JSON.stringify(clientData)
        });
        var json = await res.json();
        status.textContent = 'Fingerprint collected — ' + Object.keys(json.client).length + ' client sections | Tampering score: ' + (json.client.tampering ? json.client.tampering.anomalyScore : 'n/a');
        status.className   = 'done';
        progress.textContent = '';
        output.innerHTML   = syntaxHighlight(JSON.stringify(json, null, 2));
        document.getElementById('copy').style.display = 'inline-block';
    } catch(e) {
        status.textContent   = 'Error: ' + e.message;
        status.className     = 'error';
        progress.textContent = '';
        output.textContent   = e.stack || e.message;
    }
})();
</script>
</body>
</html>
<?php
/**
 * Dynamic Fingerprint Spoof Script
 * 
 * Encrypts the spoof code with a new key on every request.
 * The encryption changes each time - can't be statically analyzed.
 * 
 * Usage in HTML:
 *   <script src="spoof.php"></script>
 */

header('Content-Type: application/javascript');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

// The spoof configuration - EDIT THESE VALUES
$config = [
    'navigator' => [
        'userAgent' => 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
        'appVersion' => '5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
        'platform' => 'Linux armv81',
        'language' => 'en-IN',
        'languages' => ['en-IN', 'en-GB', 'en-US', 'en'],
        'hardwareConcurrency' => 8,
        'deviceMemory' => 8,
        'maxTouchPoints' => 5,
        'vendor' => 'Google Inc.',
        'vendorSub' => '',
        'product' => 'Gecko',
        'productSub' => '20030107',
        'webdriver' => false,
        'cookieEnabled' => true,
        'onLine' => true,
        'pdfViewerEnabled' => false,
        'doNotTrack' => null,
    ],
    'screen' => [
        'width' => 384,
        'height' => 832,
        'availWidth' => 384,
        'availHeight' => 832,
        'colorDepth' => 24,
        'pixelDepth' => 24,
    ],
    'window' => [
        'innerWidth' => 384,
        'innerHeight' => 747,
        'outerWidth' => 384,
        'outerHeight' => 832,
        'devicePixelRatio' => 2.8125,
    ],
    'webgl' => [
        'vendor' => 'Qualcomm',
        'renderer' => 'Adreno (TM) 630',
    ],
    'timezone' => [
        'offset' => -330,
        'name' => 'Asia/Calcutta',
    ],
];

// Generate the spoof code
$spoofCode = <<<'JS'
(function(){
  'use strict';
  if(window.__FP_SPOOFED__)return;
  window.__FP_SPOOFED__=true;
  
  var C=__CONFIG__;
  
  // Navigator
  var nav=C.navigator||{};
  Object.keys(nav).forEach(function(p){
    try{
      Object.defineProperty(Navigator.prototype,p,{get:function(){return nav[p]},configurable:true});
      Object.defineProperty(navigator,p,{get:function(){return nav[p]},configurable:true});
    }catch(e){}
  });
  
  // Screen
  var scr=C.screen||{};
  Object.keys(scr).forEach(function(p){
    try{
      Object.defineProperty(Screen.prototype,p,{get:function(){return scr[p]},configurable:true});
      Object.defineProperty(screen,p,{get:function(){return scr[p]},configurable:true});
    }catch(e){}
  });
  
  // Window
  var win=C.window||{};
  Object.keys(win).forEach(function(p){
    try{Object.defineProperty(window,p,{get:function(){return win[p]},configurable:true})}catch(e){}
  });
  
  // Timezone
  var tz=C.timezone||{};
  if(tz.offset!==undefined)Date.prototype.getTimezoneOffset=function(){return tz.offset};
  if(tz.name){
    var origDTF=Intl.DateTimeFormat;
    Intl.DateTimeFormat=function(l,o){o=o||{};if(!o.timeZone)o.timeZone=tz.name;return new origDTF(l,o)};
    Intl.DateTimeFormat.prototype=origDTF.prototype;
    Intl.DateTimeFormat.supportedLocalesOf=origDTF.supportedLocalesOf;
  }
  
  // WebGL
  var webgl=C.webgl||{};
  function spoofGL(proto){
    var origGP=proto.getParameter;
    proto.getParameter=function(p){
      if(p===37445)return webgl.vendor;
      if(p===37446)return webgl.renderer;
      return origGP.call(this,p);
    };
  }
  spoofGL(WebGLRenderingContext.prototype);
  if(typeof WebGL2RenderingContext!=='undefined')spoofGL(WebGL2RenderingContext.prototype);
  
  // Canvas noise
  var origTDU=HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL=function(){
    var ctx=this.getContext('2d');
    if(ctx){
      try{
        var id=ctx.getImageData(0,0,Math.min(this.width,10),Math.min(this.height,10));
        id.data[0]^=1;
        ctx.putImageData(id,0,0);
      }catch(e){}
    }
    return origTDU.apply(this,arguments);
  };
  
  // Plugins
  Object.defineProperty(Navigator.prototype,'plugins',{get:function(){return[]},configurable:true});
  Object.defineProperty(Navigator.prototype,'mimeTypes',{get:function(){return[]},configurable:true});
  
  // Battery
  if(navigator.getBattery)navigator.getBattery=function(){return Promise.resolve({charging:false,level:0.3,addEventListener:function(){}})};
  
  // Connection
  if(navigator.connection)Object.defineProperty(navigator,'connection',{get:function(){return{effectiveType:'4g',rtt:50,downlink:4.05,saveData:false}},configurable:true});
  
  console.log('%c[Protected]','color:#9b59b6;font-weight:bold');
})();
JS;

// Replace config placeholder
$spoofCode = str_replace('__CONFIG__', json_encode($config), $spoofCode);

// Generate random encryption key
function genKey($len = 16) {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $key = '';
    for ($i = 0; $i < $len; $i++) {
        $key .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $key;
}

// XOR encrypt
function xorEncrypt($str, $key) {
    $result = [];
    $keyLen = strlen($key);
    for ($i = 0; $i < strlen($str); $i++) {
        $result[] = ord($str[$i]) ^ ord($key[$i % $keyLen]);
    }
    return $result;
}

// Scramble array
function scramble($arr, $seed) {
    $result = $arr;
    $m = count($result);
    $s = $seed;
    while ($m > 0) {
        $s = ($s * 9301 + 49297) % 233280;
        $i = (int)(($s / 233280) * $m);
        $m--;
        $t = $result[$m];
        $result[$m] = $result[$i];
        $result[$i] = $t;
    }
    return $result;
}

// Random variable name
function randVar() {
    $prefixes = ['_', '$', '__', '$$'];
    return $prefixes[array_rand($prefixes)] . substr(str_shuffle('abcdefghijklmnopqrstuvwxyz'), 0, 6);
}

// Encrypt
$KEY = genKey(16);
$SEED = random_int(10000, 99999);

$encrypted = xorEncrypt($spoofCode, $KEY);
$scrambled = scramble($encrypted, $SEED);
$payload = json_encode($scrambled);

// Variable names
$v = [
    'k' => randVar(),
    's' => randVar(),
    'd' => randVar(),
    'u' => randVar(),
    'x' => randVar(),
    'r' => randVar(),
    'i' => randVar(),
    'a' => randVar(),
    'b' => randVar(),
    'p' => randVar(),
    't' => randVar(),
    'e' => randVar(),
    'f' => randVar(),
];

// Output the encrypted loader
echo "(function(){'use strict';";
echo "var {$v['k']}=\"{$KEY}\";";
echo "var {$v['s']}={$SEED};";
echo "var {$v['d']}={$payload};";

// Unscramble function
echo "function {$v['u']}({$v['a']},{$v['b']}){";
echo "var {$v['r']}=new Array({$v['a']}.length);";
echo "var {$v['i']},{$v['t']},m={$v['a']}.length,s={$v['b']};";
echo "var {$v['p']}=[];";
echo "for({$v['i']}=0;{$v['i']}<m;{$v['i']}++){$v['p']}[{$v['i']}]={$v['i']};";
echo "while(m){s=(s*9301+49297)%233280;{$v['i']}=Math.floor((s/233280)*m--);";
echo "{$v['t']}={$v['p']}[m];{$v['p']}[m]={$v['p']}[{$v['i']}];{$v['p']}[{$v['i']}]={$v['t']};}";
echo "for({$v['i']}=0;{$v['i']}<{$v['a']}.length;{$v['i']}++){$v['r']}[{$v['p']}[{$v['i']}]]={$v['a']}[{$v['i']}];";
echo "return {$v['r']};}";

// XOR decrypt function
echo "function {$v['x']}({$v['a']},{$v['b']}){";
echo "var {$v['r']}='';";
echo "for(var {$v['i']}=0;{$v['i']}<{$v['a']}.length;{$v['i']}++){";
echo "{$v['r']}+=String.fromCharCode({$v['a']}[{$v['i']}]^{$v['b']}.charCodeAt({$v['i']}%{$v['b']}.length));}";
echo "return {$v['r']};}";

// Execute
echo "try{var {$v['e']}={$v['u']}({$v['d']},{$v['s']});";
echo "var {$v['f']}={$v['x']}({$v['e']},{$v['k']});";
echo "(1,eval)({$v['f']});}catch({$v['r']}){}";
echo "})();";

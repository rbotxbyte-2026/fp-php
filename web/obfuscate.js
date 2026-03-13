/**
 * Spoof Script Obfuscator
 * 
 * Run: node obfuscate.js
 * Output: spoof.min.js (encrypted version)
 */

const fs = require('fs');
const path = require('path');

// Read the original spoof script
const spoofCode = fs.readFileSync(path.join(__dirname, 'spoof.js'), 'utf8');

// Encryption key (changes output each time)
const KEY = Math.random().toString(36).substring(2, 15);

// XOR encrypt
function xorEncrypt(str, key) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Convert to hex
function toHex(str) {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return hex;
}

// Encrypt the code
const encrypted = toHex(xorEncrypt(spoofCode, KEY));

// Generate random variable names
const vars = {
  key: '_' + Math.random().toString(36).substring(2, 8),
  data: '_' + Math.random().toString(36).substring(2, 8),
  decode: '_' + Math.random().toString(36).substring(2, 8),
  xor: '_' + Math.random().toString(36).substring(2, 8),
  result: '_' + Math.random().toString(36).substring(2, 8),
  i: '_' + Math.random().toString(36).substring(2, 8),
  hex: '_' + Math.random().toString(36).substring(2, 8),
};

// Create the loader/decryptor
const loader = `(function(){var ${vars.key}="${KEY}",${vars.data}="${encrypted}";function ${vars.hex}(h){var s="";for(var i=0;i<h.length;i+=4)s+=String.fromCharCode(parseInt(h.substr(i,4),16));return s}function ${vars.xor}(s,k){var r="";for(var ${vars.i}=0;${vars.i}<s.length;${vars.i}++)r+=String.fromCharCode(s.charCodeAt(${vars.i})^k.charCodeAt(${vars.i}%k.length));return r}try{eval(${vars.xor}(${vars.hex}(${vars.data}),${vars.key}))}catch(e){}})();`;

// Save the obfuscated version
fs.writeFileSync(path.join(__dirname, 'spoof.enc.js'), loader);

console.log('✓ Created spoof.enc.js');
console.log('  Original size:', spoofCode.length, 'bytes');
console.log('  Encrypted size:', loader.length, 'bytes');
console.log('  Encryption key:', KEY);

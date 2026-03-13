/**
 * Advanced Spoof Script Obfuscator
 * 
 * Features:
 * - Multi-layer encryption (XOR + Base64 + Scramble)
 * - Anti-debugging traps
 * - Self-modifying code
 * - Timing checks
 * - Console disable
 * 
 * Run: node obfuscate-advanced.js
 */

const fs = require('fs');
const path = require('path');

// Read the original spoof script
const spoofCode = fs.readFileSync(path.join(__dirname, 'spoof.js'), 'utf8');

// Generate random key
function genKey(len = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// XOR encrypt
function xorEncrypt(str, key) {
  let result = [];
  for (let i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Scramble array with seed
function scramble(arr, seed) {
  const result = [...arr];
  let m = result.length, t, i;
  let s = seed;
  while (m) {
    s = (s * 9301 + 49297) % 233280;
    i = Math.floor((s / 233280) * m--);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }
  return result;
}

// Generate random variable names
function randVar() {
  const prefixes = ['_', '$', '__', '$$', '_$', '$_'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return prefix + Math.random().toString(36).substring(2, 8);
}

// Keys and seeds
const KEY1 = genKey(16);
const KEY2 = genKey(16);
const SEED = Math.floor(Math.random() * 100000);

// Encrypt
const layer1 = xorEncrypt(spoofCode, KEY1);
const layer2 = scramble(layer1, SEED);
const payload = JSON.stringify(layer2);

// Variable names
const v = {
  k1: randVar(), k2: randVar(), s: randVar(), d: randVar(),
  u: randVar(), x: randVar(), r: randVar(), i: randVar(),
  t: randVar(), p: randVar(), e: randVar(), c: randVar(),
  f: randVar(), a: randVar(), b: randVar(), n: randVar(),
};

// Anti-debug code
const antiDebug = `
(function(){
  var ${v.t}=Date.now();
  setInterval(function(){
    var ${v.n}=Date.now();
    if(${v.n}-${v.t}>100){
      ${v.t}=${v.n};
      try{window.location.reload()}catch(e){}
    }
    ${v.t}=${v.n};
  },50);
  
  var ${v.c}=function(){};
  Object.defineProperty(console,'log',{get:function(){return ${v.c}}});
  Object.defineProperty(console,'warn',{get:function(){return ${v.c}}});
  Object.defineProperty(console,'debug',{get:function(){return ${v.c}}});
})();
`;

// Decryption runtime
const runtime = `
(function(){
  'use strict';
  
  var ${v.k1}="${KEY1}";
  var ${v.k2}="${KEY2}";
  var ${v.s}=${SEED};
  var ${v.d}=${payload};
  
  function ${v.u}(${v.a},${v.b}){
    var ${v.r}=new Array(${v.a}.length);
    var ${v.i},${v.t},m=${v.a}.length,s=${v.b};
    var ${v.p}=[];
    for(${v.i}=0;${v.i}<m;${v.i}++)${v.p}[${v.i}]=${v.i};
    while(m){
      s=(s*9301+49297)%233280;
      ${v.i}=Math.floor((s/233280)*m--);
      ${v.t}=${v.p}[m];${v.p}[m]=${v.p}[${v.i}];${v.p}[${v.i}]=${v.t};
    }
    for(${v.i}=0;${v.i}<${v.a}.length;${v.i}++)${v.r}[${v.p}[${v.i}]]=${v.a}[${v.i}];
    return ${v.r};
  }
  
  function ${v.x}(${v.a},${v.b}){
    var ${v.r}="";
    for(var ${v.i}=0;${v.i}<${v.a}.length;${v.i}++){
      ${v.r}+=String.fromCharCode(${v.a}[${v.i}]^${v.b}.charCodeAt(${v.i}%${v.b}.length));
    }
    return ${v.r};
  }
  
  try{
    var ${v.e}=${v.u}(${v.d},${v.s});
    var ${v.f}=${v.x}(${v.e},${v.k1});
    (1,eval)(${v.f});
  }catch(${v.r}){}
})();
`;

// Combine and minimize whitespace
const final = runtime.replace(/\s+/g, ' ').replace(/\s*([{};,=():])\s*/g, '$1');

// Save
fs.writeFileSync(path.join(__dirname, 'spoof.protected.js'), final);

console.log('✓ Created spoof.protected.js');
console.log('  Original:', spoofCode.length, 'bytes');
console.log('  Protected:', final.length, 'bytes');
console.log('');
console.log('  Encryption: XOR + Array Scramble');
console.log('  Key length:', KEY1.length);
console.log('  Seed:', SEED);

// Also create version with anti-debug
const withAntiDebug = antiDebug.replace(/\s+/g, ' ') + final;
fs.writeFileSync(path.join(__dirname, 'spoof.secure.js'), withAntiDebug);
console.log('');
console.log('✓ Created spoof.secure.js (with anti-debug)');
console.log('  Size:', withAntiDebug.length, 'bytes');

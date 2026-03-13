/*
 * LD_PRELOAD Fingerprint Spoofer for Android Chrome/WebView
 * 
 * Hooks various functions to inject fingerprint spoofing JavaScript.
 * 
 * Build: See build.sh
 * Usage: LD_PRELOAD=/data/local/tmp/libfpspoof.so <app>
 */

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <android/log.h>
#include <pthread.h>

#define LOG_TAG "FPSpoof"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)

// Flag to prevent recursive hooks
static __thread int in_hook = 0;

// ============================================================================
// EMBEDDED SPOOF JAVASCRIPT
// ============================================================================
static const char* SPOOF_JS = 
"(function(){"
"if(window.__fpSpoofed)return;"
"window.__fpSpoofed=true;"

// Navigator spoofs
"Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});"
"Object.defineProperty(navigator,'deviceMemory',{get:()=>8});"
"Object.defineProperty(navigator,'platform',{get:()=>'Win32'});"
"Object.defineProperty(navigator,'vendor',{get:()=>'Google Inc.'});"
"Object.defineProperty(navigator,'language',{get:()=>'en-US'});"
"Object.defineProperty(navigator,'languages',{get:()=>['en-US','en']});"
"Object.defineProperty(navigator,'maxTouchPoints',{get:()=>0});"
"Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"

// Screen spoofs
"Object.defineProperty(screen,'width',{get:()=>1920});"
"Object.defineProperty(screen,'height',{get:()=>1080});"
"Object.defineProperty(screen,'availWidth',{get:()=>1920});"
"Object.defineProperty(screen,'availHeight',{get:()=>1040});"
"Object.defineProperty(screen,'colorDepth',{get:()=>24});"
"Object.defineProperty(screen,'pixelDepth',{get:()=>24});"

// Canvas fingerprint
"const origToDataURL=HTMLCanvasElement.prototype.toDataURL;"
"HTMLCanvasElement.prototype.toDataURL=function(t){"
"const ctx=this.getContext('2d');"
"if(ctx){"
"const imgData=ctx.getImageData(0,0,this.width,this.height);"
"for(let i=0;i<imgData.data.length;i+=4){"
"imgData.data[i]^=0x01;"  // Subtle noise
"}"
"ctx.putImageData(imgData,0,0);"
"}"
"return origToDataURL.apply(this,arguments);"
"};"

// WebGL fingerprint
"const getParam=WebGLRenderingContext.prototype.getParameter;"
"WebGLRenderingContext.prototype.getParameter=function(p){"
"if(p===37445)return'Google Inc. (NVIDIA)';"
"if(p===37446)return'ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0)';"
"return getParam.apply(this,arguments);"
"};"

// Timezone
"Date.prototype.getTimezoneOffset=function(){return 300};"  // EST

// Audio fingerprint
"const origCreateOscillator=AudioContext.prototype.createOscillator;"
"AudioContext.prototype.createOscillator=function(){"
"const osc=origCreateOscillator.apply(this,arguments);"
"const origConnect=osc.connect;"
"osc.connect=function(dest){"
"if(dest instanceof AnalyserNode){"
"const gain=this.context.createGain();"
"gain.gain.value=1.0000001;"  // Tiny variation
"origConnect.call(this,gain);"
"gain.connect(dest);"
"return;"
"}"
"return origConnect.apply(this,arguments);"
"};"
"return osc;"
"};"

"console.log('[FPSpoof] Fingerprint spoofing active');"
"})();";

// Injection marker in HTML
static const char* INJECT_MARKER = "<script>/* FPSpoof */";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Check if data looks like HTML
static int is_html(const char* data, size_t len) {
    if (len < 15) return 0;
    
    // Look for HTML markers
    for (size_t i = 0; i < len - 5 && i < 1024; i++) {
        if (strncasecmp(data + i, "<html", 5) == 0 ||
            strncasecmp(data + i, "<head", 5) == 0 ||
            strncasecmp(data + i, "<!doc", 5) == 0) {
            return 1;
        }
    }
    return 0;
}

// Check if already injected
static int already_injected(const char* data, size_t len) {
    return memmem(data, len, "FPSpoof", 7) != NULL;
}

// Find injection point in HTML
static char* find_inject_point(char* data, size_t len) {
    // Try to find <head>
    for (size_t i = 0; i < len - 6; i++) {
        if (strncasecmp(data + i, "<head>", 6) == 0) {
            return data + i + 6;
        }
        if (strncasecmp(data + i, "<head ", 5) == 0) {
            // Find closing >
            for (size_t j = i + 5; j < len; j++) {
                if (data[j] == '>') {
                    return data + j + 1;
                }
            }
        }
    }
    
    // Fallback: after <html>
    for (size_t i = 0; i < len - 5; i++) {
        if (strncasecmp(data + i, "<html", 5) == 0) {
            for (size_t j = i + 5; j < len; j++) {
                if (data[j] == '>') {
                    return data + j + 1;
                }
            }
        }
    }
    
    return NULL;
}

// ============================================================================
// WRITE HOOK - Intercept data being written
// ============================================================================

typedef ssize_t (*write_func_t)(int fd, const void* buf, size_t count);
static write_func_t real_write = NULL;

ssize_t write(int fd, const void* buf, size_t count) {
    if (!real_write) {
        real_write = (write_func_t)dlsym(RTLD_NEXT, "write");
    }
    
    // Prevent recursion
    if (in_hook) {
        return real_write(fd, buf, count);
    }
    
    // Only process potential HTML responses
    if (count > 100 && buf && is_html((const char*)buf, count)) {
        in_hook = 1;
        
        if (!already_injected((const char*)buf, count)) {
            LOGI("Detected HTML in write(), attempting injection");
            
            // Create modified buffer with injected script
            size_t script_len = strlen(SPOOF_JS) + 20; // <script>...</script>
            char* modified = malloc(count + script_len + 1);
            
            if (modified) {
                memcpy(modified, buf, count);
                modified[count] = '\0';
                
                char* inject_point = find_inject_point(modified, count);
                if (inject_point) {
                    // Shift content and insert script
                    size_t offset = inject_point - modified;
                    size_t remaining = count - offset;
                    
                    memmove(inject_point + script_len, inject_point, remaining);
                    
                    // Insert script
                    char script_tag[8192];
                    snprintf(script_tag, sizeof(script_tag), 
                             "<script>%s</script>", SPOOF_JS);
                    memcpy(inject_point, script_tag, strlen(script_tag));
                    
                    ssize_t result = real_write(fd, modified, count + script_len);
                    free(modified);
                    in_hook = 0;
                    LOGI("Injected spoof script into HTML");
                    return result;
                }
                free(modified);
            }
        }
        
        in_hook = 0;
    }
    
    return real_write(fd, buf, count);
}

// ============================================================================
// SEND HOOK - Intercept socket data
// ============================================================================

typedef ssize_t (*send_func_t)(int sockfd, const void* buf, size_t len, int flags);
static send_func_t real_send = NULL;

ssize_t send(int sockfd, const void* buf, size_t len, int flags) {
    if (!real_send) {
        real_send = (send_func_t)dlsym(RTLD_NEXT, "send");
    }
    
    if (in_hook) {
        return real_send(sockfd, buf, len, flags);
    }
    
    // Similar HTML injection for socket sends
    if (len > 100 && buf && is_html((const char*)buf, len)) {
        in_hook = 1;
        
        if (!already_injected((const char*)buf, len)) {
            LOGD("Detected HTML in send()");
            // Note: Modifying send() is tricky due to socket protocols
            // This is mainly for debugging
        }
        
        in_hook = 0;
    }
    
    return real_send(sockfd, buf, len, flags);
}

// ============================================================================
// DLOPEN HOOK - Track library loading
// ============================================================================

typedef void* (*dlopen_func_t)(const char* filename, int flags);
static dlopen_func_t real_dlopen = NULL;

void* dlopen(const char* filename, int flags) {
    if (!real_dlopen) {
        real_dlopen = (dlopen_func_t)dlsym(RTLD_NEXT, "dlopen");
    }
    
    if (filename) {
        LOGD("dlopen: %s", filename);
        
        // Track interesting libraries
        if (strstr(filename, "libwebviewchromium") ||
            strstr(filename, "libchrome") ||
            strstr(filename, "libcontent") ||
            strstr(filename, "libv8")) {
            LOGI("Detected Chrome/V8 library load: %s", filename);
        }
    }
    
    return real_dlopen(filename, flags);
}

// ============================================================================
// GETENV HOOK - Hide LD_PRELOAD from detection
// ============================================================================

typedef char* (*getenv_func_t)(const char* name);
static getenv_func_t real_getenv = NULL;

char* getenv(const char* name) {
    if (!real_getenv) {
        real_getenv = (getenv_func_t)dlsym(RTLD_NEXT, "getenv");
    }
    
    // Hide LD_PRELOAD from detection
    if (name && strcmp(name, "LD_PRELOAD") == 0) {
        return NULL;
    }
    
    return real_getenv(name);
}

// ============================================================================
// OPEN HOOK - Track file access (debugging)
// ============================================================================

typedef int (*open_func_t)(const char* pathname, int flags, ...);
static open_func_t real_open = NULL;

int open(const char* pathname, int flags, ...) {
    if (!real_open) {
        real_open = (open_func_t)dlsym(RTLD_NEXT, "open");
    }
    
    // Log interesting file accesses
    if (pathname) {
        if (strstr(pathname, ".js") || strstr(pathname, ".html")) {
            LOGD("open: %s", pathname);
        }
    }
    
    // Handle variadic mode argument
    va_list args;
    va_start(args, flags);
    mode_t mode = va_arg(args, int);
    va_end(args);
    
    return real_open(pathname, flags, mode);
}

// ============================================================================
// CONSTRUCTOR - Runs when library is loaded
// ============================================================================

__attribute__((constructor))
static void fpspoof_init(void) {
    LOGI("===========================================");
    LOGI("FPSpoof LD_PRELOAD Library Loaded");
    LOGI("===========================================");
    LOGI("Spoof JS length: %zu bytes", strlen(SPOOF_JS));
    
    // Initialize function pointers
    real_write = (write_func_t)dlsym(RTLD_NEXT, "write");
    real_send = (send_func_t)dlsym(RTLD_NEXT, "send");
    real_dlopen = (dlopen_func_t)dlsym(RTLD_NEXT, "dlopen");
    real_getenv = (getenv_func_t)dlsym(RTLD_NEXT, "getenv");
    real_open = (open_func_t)dlsym(RTLD_NEXT, "open");
    
    LOGI("Hooks initialized");
}

__attribute__((destructor))
static void fpspoof_fini(void) {
    LOGI("FPSpoof unloading");
}

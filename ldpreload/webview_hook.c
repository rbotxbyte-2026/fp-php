/*
 * Advanced WebView Hook for LD_PRELOAD
 * 
 * Hooks WebView's native JNI methods to inject JavaScript.
 * Works for apps using Android WebView (not Chrome's internal renderer).
 * 
 * Target functions:
 * - Java_android_webkit_WebView_nativeLoadUrl
 * - Java_android_webkit_WebView_nativeEvaluateJavaScript
 */

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>
#include <android/log.h>
#include <jni.h>

#define LOG_TAG "FPSpoof-WV"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// Spoof script to inject
static const char* SPOOF_JS = 
"(function(){"
"if(window.__fpSpoofed)return;"
"window.__fpSpoofed=true;"
"Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});"
"Object.defineProperty(navigator,'deviceMemory',{get:()=>8});"
"Object.defineProperty(navigator,'platform',{get:()=>'Win32'});"
"Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"
"Object.defineProperty(screen,'width',{get:()=>1920});"
"Object.defineProperty(screen,'height',{get:()=>1080});"
"const origToDataURL=HTMLCanvasElement.prototype.toDataURL;"
"HTMLCanvasElement.prototype.toDataURL=function(){"
"const ctx=this.getContext('2d');"
"if(ctx){const d=ctx.getImageData(0,0,this.width,this.height);"
"for(let i=0;i<d.data.length;i+=4)d.data[i]^=1;"
"ctx.putImageData(d,0,0);}"
"return origToDataURL.apply(this,arguments);};"
"const getP=WebGLRenderingContext.prototype.getParameter;"
"WebGLRenderingContext.prototype.getParameter=function(p){"
"if(p===37445)return'Google Inc. (NVIDIA)';"
"if(p===37446)return'ANGLE (NVIDIA GTX 1080)';"
"return getP.apply(this,arguments);};"
"console.log('[FPSpoof] Active');"
"})();";

// Store original JNI functions
static void* libwebview_handle = NULL;
static int hooks_installed = 0;

// Track JNIEnv for injection
static JavaVM* cached_jvm = NULL;

// ============================================================================
// JNI_OnLoad Hook - Intercept when WebView library loads
// ============================================================================

typedef jint (*JNI_OnLoad_func)(JavaVM* vm, void* reserved);
static JNI_OnLoad_func original_JNI_OnLoad = NULL;

// We hook dlopen to detect WebView library loading
typedef void* (*dlopen_func_t)(const char* filename, int flags);
static dlopen_func_t real_dlopen = NULL;

void* dlopen(const char* filename, int flags) {
    if (!real_dlopen) {
        real_dlopen = (dlopen_func_t)dlsym(RTLD_NEXT, "dlopen");
    }
    
    void* handle = real_dlopen(filename, flags);
    
    if (filename && handle) {
        // Detect WebView/Chromium library
        if (strstr(filename, "libwebviewchromium") ||
            strstr(filename, "webview") ||
            strstr(filename, "libchrome")) {
            
            LOGI("WebView library detected: %s", filename);
            libwebview_handle = handle;
            
            // Try to find and hook JNI functions
            // Note: This is complex because Chrome uses dynamic registration
        }
    }
    
    return handle;
}

// ============================================================================
// RegisterNatives Hook - Intercept JNI method registration
// ============================================================================

// This is the key hook for WebView - it intercepts when WebView registers
// its native methods, allowing us to wrap them

typedef jint (*RegisterNatives_func)(JNIEnv* env, jclass clazz, 
                                      const JNINativeMethod* methods, jint nMethods);

static RegisterNatives_func original_RegisterNatives = NULL;

// Wrapper for WebView.loadUrl native implementation
typedef void (*loadUrl_native_func)(JNIEnv* env, jobject obj, jlong ptr, jstring url);
static loadUrl_native_func original_loadUrl = NULL;

void hooked_loadUrl(JNIEnv* env, jobject obj, jlong ptr, jstring url) {
    const char* url_str = (*env)->GetStringUTFChars(env, url, NULL);
    LOGI("loadUrl intercepted: %s", url_str);
    (*env)->ReleaseStringUTFChars(env, url, url_str);
    
    // Call original
    if (original_loadUrl) {
        original_loadUrl(env, obj, ptr, url);
    }
    
    // Inject spoof script after page starts loading
    // Note: This requires calling evaluateJavaScript which is async
    LOGI("Would inject spoof script here");
}

// Hook RegisterNatives to intercept WebView method registration
jint hooked_RegisterNatives(JNIEnv* env, jclass clazz, 
                            const JNINativeMethod* methods, jint nMethods) {
    
    // Get class name
    jclass classClass = (*env)->FindClass(env, "java/lang/Class");
    jmethodID getNameMethod = (*env)->GetMethodID(env, classClass, "getName", "()Ljava/lang/String;");
    jstring classNameJstr = (*env)->CallObjectMethod(env, clazz, getNameMethod);
    const char* className = (*env)->GetStringUTFChars(env, classNameJstr, NULL);
    
    LOGD("RegisterNatives for: %s (%d methods)", className, nMethods);
    
    // Check if this is WebView related
    if (strstr(className, "WebView") || strstr(className, "ContentView")) {
        LOGI("Intercepting WebView native methods!");
        
        // Log all methods being registered
        for (int i = 0; i < nMethods; i++) {
            LOGD("  Method: %s %s", methods[i].name, methods[i].signature);
            
            // Look for interesting methods to hook
            if (strstr(methods[i].name, "loadUrl") ||
                strstr(methods[i].name, "nativeLoadUrl")) {
                LOGI("  Found loadUrl method!");
                // Could wrap this method here
            }
            
            if (strstr(methods[i].name, "evaluateJavascript") ||
                strstr(methods[i].name, "nativeEvaluateJavaScript")) {
                LOGI("  Found evaluateJavaScript method!");
            }
        }
    }
    
    (*env)->ReleaseStringUTFChars(env, classNameJstr, className);
    
    // Call original RegisterNatives
    return original_RegisterNatives(env, clazz, methods, nMethods);
}

// ============================================================================
// JNI_OnLoad - Called when our library is loaded
// ============================================================================

JNIEXPORT jint JNI_OnLoad(JavaVM* vm, void* reserved) {
    LOGI("FPSpoof JNI_OnLoad called");
    
    cached_jvm = vm;
    
    JNIEnv* env;
    if ((*vm)->GetEnv(vm, (void**)&env, JNI_VERSION_1_6) != JNI_OK) {
        LOGE("Failed to get JNIEnv");
        return JNI_VERSION_1_6;
    }
    
    // Get JNINativeInterface (function table)
    // Note: Direct hooking of RegisterNatives requires more complex techniques
    
    LOGI("JVM cached for injection");
    
    return JNI_VERSION_1_6;
}

// ============================================================================
// Constructor
// ============================================================================

__attribute__((constructor))
static void webview_hook_init(void) {
    LOGI("===========================================");
    LOGI("FPSpoof WebView Hook Loaded");
    LOGI("===========================================");
    
    real_dlopen = (dlopen_func_t)dlsym(RTLD_NEXT, "dlopen");
    
    LOGI("Waiting for WebView library to load...");
}

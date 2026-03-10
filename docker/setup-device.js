#!/usr/bin/env node
/**
 * setup-device.js
 * Reads original.json and configures Android device via ADB
 * Sets device-level properties that Chrome reads natively (UNDETECTABLE)
 */

const { loadProfile, adb, waitForAdb, waitForBoot, sleep, extractDeviceInfo } = require('./utils');
const fs = require('fs');
const path = require('path');

const PROFILE_PATH = process.env.PROFILE_PATH || './profiles/original.json';

async function main() {
    console.log('========================================');
    console.log('  Fingerprint Device Setup');
    console.log('========================================\n');
    
    // Load profile
    console.log(`Loading profile from: ${PROFILE_PATH}`);
    const profile = loadProfile(PROFILE_PATH);
    const deviceInfo = extractDeviceInfo(profile);
    
    console.log('\nExtracted device info:');
    console.log(JSON.stringify(deviceInfo, null, 2));
    
    // Connect to ADB (may already be connected from entrypoint)
    await waitForAdb();
    
    // Verify device is responsive
    try {
        const devices = adb('devices', { ignoreError: true });
        console.log('Connected devices:', devices);
    } catch (e) {
        console.log('Could not list devices');
    }
    
    // Set device properties
    console.log('\n--- Setting Device Properties ---\n');
    
    const properties = {
        // Device Identity
        'ro.product.model': deviceInfo.model,
        'ro.product.brand': deviceInfo.brand,
        'ro.product.manufacturer': deviceInfo.manufacturer,
        'ro.product.device': deviceInfo.device,
        'ro.product.name': deviceInfo.product,
        'ro.build.product': deviceInfo.product,
        
        // Hardware
        'ro.product.board': deviceInfo.board,
        'ro.hardware': deviceInfo.hardware,
        'ro.arch': 'arm64',
        
        // OS Version
        'ro.build.version.release': deviceInfo.androidVersion,
        'ro.build.version.sdk': deviceInfo.sdkVersion,
        'ro.build.version.incremental': `${deviceInfo.brand}${Date.now()}`,
        
        // Build Info
        'ro.build.display.id': `${deviceInfo.brand}/${deviceInfo.device}/${deviceInfo.androidVersion}`,
        'ro.build.fingerprint': `${deviceInfo.brand}/${deviceInfo.product}/${deviceInfo.device}:${deviceInfo.androidVersion}/${deviceInfo.sdkVersion}/${Date.now()}:user/release-keys`,
        
        // Locale & Timezone (persist.sys for runtime changes)
        'persist.sys.timezone': deviceInfo.timezone,
        'persist.sys.locale': deviceInfo.locale,
        'persist.sys.language': deviceInfo.language,
        'persist.sys.country': deviceInfo.country,
        
        // Additional properties
        'ro.setupwizard.mode': 'OPTIONAL',
        'ro.com.google.gmsversion': `${deviceInfo.androidVersion}_202403`,
    };
    
    for (const [prop, value] of Object.entries(properties)) {
        try {
            console.log(`Setting ${prop} = ${value}`);
            adb(`shell setprop ${prop} "${value}"`);
        } catch (e) {
            console.log(`  Warning: Could not set ${prop}`);
        }
    }
    
    // Additional settings via settings command
    console.log('\n--- Setting System Settings ---\n');
    
    const settings = {
        'system': {
            'screen_brightness': '128',
            'screen_brightness_mode': '0',
        },
        'secure': {
            'android_id': generateAndroidId(),
        },
        'global': {
            'device_name': deviceInfo.model,
        }
    };
    
    for (const [namespace, pairs] of Object.entries(settings)) {
        for (const [key, value] of Object.entries(pairs)) {
            try {
                console.log(`Setting ${namespace}:${key} = ${value}`);
                adb(`shell settings put ${namespace} ${key} ${value}`);
            } catch (e) {
                console.log(`  Warning: Could not set ${namespace}:${key}`);
            }
        }
    }
    
    // Set timezone via additional method
    console.log('\n--- Setting Timezone ---\n');
    try {
        adb(`shell service call alarm 3 s16 ${deviceInfo.timezone}`);
        console.log(`Timezone set to: ${deviceInfo.timezone}`);
    } catch (e) {
        console.log('Could not set timezone via service call');
    }
    
    // Verify settings
    console.log('\n--- Verifying Settings ---\n');
    
    const verifyProps = ['ro.product.model', 'ro.product.brand', 'persist.sys.timezone', 'persist.sys.locale'];
    for (const prop of verifyProps) {
        try {
            const value = adb(`shell getprop ${prop}`);
            console.log(`${prop} = ${value}`);
        } catch (e) {
            console.log(`Could not read ${prop}`);
        }
    }
    
    // Save device info for CDP injection
    const cdpConfig = generateCdpConfig(profile);
    const cdpConfigPath = path.join(path.dirname(PROFILE_PATH), 'cdp-config.json');
    fs.writeFileSync(cdpConfigPath, JSON.stringify(cdpConfig, null, 2));
    console.log(`\nCDP config saved to: ${cdpConfigPath}`);
    
    console.log('\n========================================');
    console.log('  Device Setup Complete!');
    console.log('========================================\n');
    
    return { deviceInfo, cdpConfig };
}

/**
 * Generate Android ID
 */
function generateAndroidId() {
    return Array.from({ length: 16 }, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

/**
 * Generate config for CDP injection (values ADB cannot set)
 */
function generateCdpConfig(profile) {
    const client = profile.client || {};
    const nav = client.navigator || {};
    const screen = client.screen || {};
    const webgl = client.webgl || {};
    const audio = client.audio || {};
    const audioLatency = client.audioLatency || {};
    const battery = client.battery || {};
    const network = client.network || client.networkExtended || {};
    const touchSupport = client.touchSupport || {};
    const mediaQueries = client.mediaQueries || {};
    const uaHighEntropy = client.uaHighEntropy || {};
    const arch = client.architecture || {};
    const webrtc = client.webrtc || {};
    const sensors = client.behavioral?.sensors || {};
    const locale = client.locale || {};
    const permissions = client.permissions || {};
    const features = client.features || {};
    
    return {
        // Navigator (CDP can inject these)
        navigator: {
            hardwareConcurrency: nav.hardwareConcurrency || 8,
            deviceMemory: nav.deviceMemory || 8,
            maxTouchPoints: nav.maxTouchPoints || touchSupport.maxTouchPoints || 5,
            language: nav.language,
            languages: nav.languages,
            platform: nav.platform,
            vendor: nav.vendor,
            vendorSub: nav.vendorSub || '',
            product: nav.product,
            productSub: nav.productSub,
            appName: nav.appName,
            appCodeName: nav.appCodeName,
            appVersion: nav.appVersion,
            userAgent: nav.userAgent,
            cookieEnabled: nav.cookieEnabled ?? true,
            doNotTrack: nav.doNotTrack,
            webdriver: false,
            pdfViewerEnabled: nav.pdfViewerEnabled ?? false,
            onLine: nav.onLine ?? true,
        },
        
        // Screen
        screen: {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth || 24,
            pixelDepth: screen.pixelDepth || 24,
            devicePixelRatio: screen.devicePixelRatio,
            orientationType: screen.orientationType || 'portrait-primary',
            orientationAngle: screen.orientationAngle || 0,
            innerWidth: screen.innerWidth,
            innerHeight: screen.innerHeight,
            outerWidth: screen.outerWidth,
            outerHeight: screen.outerHeight,
        },
        
        // WebGL
        webgl: {
            vendor: webgl.vendor,
            renderer: webgl.renderer,
            unmaskedVendor: webgl.unmaskedVendor,
            unmaskedRenderer: webgl.unmaskedRenderer,
            version: webgl.version,
            shadingLanguageVersion: webgl.shadingLanguageVersion,
            maxTextureSize: webgl.maxTextureSize,
            maxViewportDims: webgl.maxViewportDims,
            maxRenderbufferSize: webgl.maxRenderbufferSize,
            maxVertexAttribs: webgl.maxVertexAttribs,
            maxVertexUniformVectors: webgl.maxVertexUniformVectors,
            maxFragmentUniformVectors: webgl.maxFragmentUniformVectors,
        },
        
        // Audio
        audio: {
            sampleRate: audio.sampleRate || 48000,
            sampleRateLive: audio.sampleRateLive || 48000,
            maxChannelCount: audio.maxChannelCount || 2,
            contextState: audio.contextState || 'suspended',
            baseLatency: audioLatency.baseLatency || client.audioBaseLatencySimple || 0.003,
            outputLatency: audioLatency.outputLatency || 0,
        },
        
        // Battery
        battery: {
            charging: battery.charging ?? true,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            level: battery.level ?? 1,
        },
        
        // Network
        network: {
            type: network.type || 'wifi',
            effectiveType: network.effectiveType || '4g',
            downlink: network.downlink || 10,
            rtt: network.rtt || 50,
            saveData: network.saveData ?? false,
        },
        
        // Touch
        touchSupport: {
            maxTouchPoints: touchSupport.maxTouchPoints || 5,
            touchEvent: touchSupport.touchEvent ?? true,
            touchStart: touchSupport.touchStart ?? true,
        },
        
        // Media Queries
        mediaQueries: {
            darkMode: mediaQueries.darkMode ?? false,
            lightMode: mediaQueries.lightMode ?? true,
            reducedMotion: mediaQueries.reducedMotion ?? false,
            coarsePointer: mediaQueries.coarsePointer ?? true,
            finePointer: mediaQueries.finePointer ?? false,
            hover: mediaQueries.hover ?? false,
            anyHover: mediaQueries.anyHover ?? false,
        },
        
        // UA High Entropy
        uaHighEntropy: {
            brands: uaHighEntropy.brands || [],
            fullVersionList: uaHighEntropy.fullVersionList || [],
            mobile: uaHighEntropy.mobile ?? true,
            model: uaHighEntropy.model || arch.uaDataModel,
            platform: uaHighEntropy.platform || arch.uaDataPlatform || 'Android',
            platformVersion: uaHighEntropy.platformVersion || arch.uaDataPlatformVersion,
            architecture: uaHighEntropy.architecture || arch.uaDataArch || '',
            bitness: uaHighEntropy.bitness || arch.uaDataBitness || '',
            uaFullVersion: uaHighEntropy.uaFullVersion || '',
        },
        
        // WebRTC (block or spoof)
        webrtc: {
            block: !webrtc.ips || webrtc.ips.length === 0,
            ips: webrtc.ips || [],
        },
        
        // Sensors
        sensors: {
            motion: sensors.motion || {},
            orientation: sensors.orientation || {},
        },
        
        // Locale
        locale: {
            timezone: locale.timezone,
            timezoneOffset: locale.timezoneOffset,
            locale: locale.locale,
        },
        
        // Permissions
        permissions: permissions,
        
        // Features
        features: features,
        
        // Plugins (mobile usually empty)
        plugins: client.plugins || [],
        mimeTypes: client.mimeTypes || [],
    };
}

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Setup failed:', err);
        process.exit(1);
    });
}

module.exports = { main, generateCdpConfig };

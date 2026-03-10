/**
 * Utility functions for fingerprint spoofing
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');

/**
 * Load and parse profile JSON
 */
function loadProfile(profilePath) {
    const content = fs.readFileSync(profilePath, 'utf8');
    return JSON.parse(content);
}

/**
 * Execute ADB command
 */
function adb(command, options = {}) {
    const host = process.env.REDROID_HOST || 'localhost';
    const port = process.env.REDROID_ADB_PORT || '5555';
    // Use -s for direct device connection
    const fullCmd = `adb -s ${host}:${port} ${command}`;
    
    if (options.async) {
        return new Promise((resolve, reject) => {
            exec(fullCmd, (err, stdout, stderr) => {
                if (err && !options.ignoreError) reject(err);
                else resolve(stdout.trim());
            });
        });
    }
    
    try {
        return execSync(fullCmd, { encoding: 'utf8', ...options }).trim();
    } catch (e) {
        if (!options.ignoreError) throw e;
        return '';
    }
}

/**
 * Wait for ADB connection
 */
async function waitForAdb(maxRetries = 30) {
    const host = process.env.REDROID_HOST || 'localhost';
    const port = process.env.REDROID_ADB_PORT || '5555';
    
    console.log(`Connecting to ADB at ${host}:${port}...`);
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Try to connect
            execSync(`adb connect ${host}:${port}`, { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
            await sleep(500);
            
            // Check if connected
            const devices = execSync('adb devices', { encoding: 'utf8', stdio: 'pipe' });
            if (devices.includes(host) && !devices.includes('offline')) {
                console.log('ADB connected successfully');
                return true;
            }
        } catch (e) {
            // Ignore errors, keep retrying
        }
        
        console.log(`Waiting for ADB... (${i + 1}/${maxRetries})`);
        await sleep(2000);
    }
    
    throw new Error('Failed to connect to ADB');
}

/**
 * Wait for device boot
 */
async function waitForBoot(maxRetries = 60) {
    console.log('Waiting for device to boot...');
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const bootCompleted = adb('shell getprop sys.boot_completed', { ignoreError: true });
            if (bootCompleted === '1') {
                console.log('Device booted successfully');
                return true;
            }
        } catch (e) {}
        
        console.log(`Waiting for boot... (${i + 1}/${maxRetries})`);
        await sleep(2000);
    }
    
    throw new Error('Device failed to boot');
}

/**
 * Sleep helper
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract device info from profile
 */
function extractDeviceInfo(profile) {
    const client = profile.client || {};
    const nav = client.navigator || {};
    const arch = client.architecture || {};
    const screen = client.screen || {};
    const locale = client.locale || {};
    const uaHighEntropy = client.uaHighEntropy || {};
    
    // Parse user agent for Android version
    const uaMatch = nav.userAgent?.match(/Android\s+(\d+)/);
    const androidVersion = uaMatch ? uaMatch[1] : '11';
    
    // Parse model from user agent or architecture
    let model = arch.uaDataModel || 'Generic';
    const modelMatch = nav.userAgent?.match(/;\s*([^;)]+)\s*Build/);
    if (modelMatch) model = modelMatch[1].trim();
    
    return {
        // Device identity
        model: model,
        brand: getBrandFromModel(model),
        manufacturer: getBrandFromModel(model),
        device: getDeviceCodename(model),
        product: getDeviceCodename(model),
        
        // OS
        androidVersion: androidVersion,
        sdkVersion: getSdkVersion(androidVersion),
        
        // Locale
        timezone: locale.timezone || 'UTC',
        language: nav.language?.split('-')[0] || 'en',
        country: nav.language?.split('-')[1] || 'US',
        locale: nav.language || 'en-US',
        
        // Screen (for Redroid boot params)
        screenWidth: screen.width ? Math.round(screen.width * (screen.devicePixelRatio || 1)) : 1080,
        screenHeight: screen.height ? Math.round(screen.height * (screen.devicePixelRatio || 1)) : 2340,
        dpi: Math.round((screen.devicePixelRatio || 2.75) * 160),
        
        // Hardware
        hardware: getHardwareFromModel(model),
        board: getBoardFromModel(model),
        platform: arch.uaDataPlatform || 'Android',
        platformVersion: arch.uaDataPlatformVersion || '11.0.0',
    };
}

/**
 * Get brand from model name
 */
function getBrandFromModel(model) {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('oneplus')) return 'OnePlus';
    if (modelLower.includes('samsung') || modelLower.startsWith('sm-')) return 'samsung';
    if (modelLower.includes('pixel')) return 'google';
    if (modelLower.includes('xiaomi') || modelLower.startsWith('m') || modelLower.includes('redmi')) return 'Xiaomi';
    if (modelLower.includes('huawei')) return 'HUAWEI';
    if (modelLower.includes('oppo')) return 'OPPO';
    if (modelLower.includes('vivo')) return 'vivo';
    if (modelLower.includes('realme')) return 'realme';
    if (modelLower.includes('nokia')) return 'Nokia';
    if (modelLower.includes('motorola') || modelLower.startsWith('moto')) return 'motorola';
    if (modelLower.includes('lg')) return 'LGE';
    if (modelLower.includes('sony') || modelLower.includes('xperia')) return 'Sony';
    if (modelLower.includes('asus')) return 'asus';
    return 'Generic';
}

/**
 * Get device codename from model
 */
function getDeviceCodename(model) {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('a6010')) return 'OnePlus6T';
    if (modelLower.includes('a6000')) return 'OnePlus6';
    if (modelLower.includes('pixel 6')) return 'oriole';
    if (modelLower.includes('pixel 7')) return 'panther';
    // Default: use model without spaces
    return model.replace(/\s+/g, '_');
}

/**
 * Get hardware name from model
 */
function getHardwareFromModel(model) {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('oneplus') || modelLower.includes('a6010') || modelLower.includes('a6000')) return 'qcom';
    if (modelLower.includes('samsung')) return 'exynos';
    if (modelLower.includes('pixel')) return 'tensor';
    if (modelLower.includes('xiaomi') || modelLower.includes('redmi')) return 'qcom';
    return 'qcom';
}

/**
 * Get board name from model
 */
function getBoardFromModel(model) {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('a6010') || modelLower.includes('a6000')) return 'sdm845';
    if (modelLower.includes('pixel 6')) return 'oriole';
    if (modelLower.includes('pixel 7')) return 'panther';
    return 'unknown';
}

/**
 * Get SDK version from Android version
 */
function getSdkVersion(androidVersion) {
    const map = {
        '14': '34', '13': '33', '12': '32', '11': '30',
        '10': '29', '9': '28', '8': '26', '7': '24'
    };
    return map[androidVersion] || '30';
}

module.exports = {
    loadProfile,
    adb,
    waitForAdb,
    waitForBoot,
    sleep,
    extractDeviceInfo
};

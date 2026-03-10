#!/usr/bin/env node
/**
 * test-extension.js
 * Tests the FP Spoofer extension using Chrome for Testing
 * Works in GitHub Actions CI/CD
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const TARGET_URL = process.env.TARGET_URL || 'https://botxbyte.com/fp.php';
const PROFILE_PATH = process.env.PROFILE_PATH || './original.json';
const RESULT_PATH = process.env.RESULT_PATH || './result.json';
const EXTENSION_PATH = process.env.EXTENSION_PATH || './extension';

async function main() {
    console.log('========================================');
    console.log('  FP Spoofer Extension Test');
    console.log('========================================\n');
    
    console.log('Configuration:');
    console.log(`  Target URL:  ${TARGET_URL}`);
    console.log(`  Profile:     ${PROFILE_PATH}`);
    console.log(`  Extension:   ${EXTENSION_PATH}`);
    console.log('');
    
    // Find Chrome for Testing
    let chromePath = process.env.CHROME_PATH;
    
    if (!chromePath) {
        // Try common locations
        const possiblePaths = [
            // Installed via @puppeteer/browsers
            './chrome/linux-*/chrome-linux64/chrome',
            './chrome/mac-*/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
            './chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
            './chrome/win64-*/chrome-win64/chrome.exe',
            // System chrome for testing
            '/opt/chrome-for-testing/chrome',
            // Snap chromium (GitHub Actions)
            '/snap/bin/chromium',
            // Standard chromium
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            // Google Chrome (fallback, extension flags may not work)
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
        ];
        
        for (const p of possiblePaths) {
            // Handle glob patterns
            if (p.includes('*')) {
                try {
                    const resolved = execSync(`ls -1 ${p} 2>/dev/null | head -1`, { encoding: 'utf8' }).trim();
                    if (resolved && fs.existsSync(resolved)) {
                        chromePath = resolved;
                        break;
                    }
                } catch (e) {}
            } else if (fs.existsSync(p)) {
                chromePath = p;
                break;
            }
        }
    }
    
    if (!chromePath) {
        console.error('ERROR: Chrome for Testing not found');
        console.error('Install it with: npx @puppeteer/browsers install chrome@stable');
        process.exit(1);
    }
    
    console.log(`Using Chrome: ${chromePath}`);
    
    // Verify extension exists
    const extManifest = path.join(EXTENSION_PATH, 'manifest.json');
    if (!fs.existsSync(extManifest)) {
        console.error(`ERROR: Extension not found at ${EXTENSION_PATH}`);
        process.exit(1);
    }
    
    // Load profile and prepare extension config
    console.log('\nLoading fingerprint profile...');
    const profile = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
    
    // Create a temporary extension directory with the profile pre-loaded
    const tempExtPath = '/tmp/fp-spoofer-ext';
    if (fs.existsSync(tempExtPath)) {
        fs.rmSync(tempExtPath, { recursive: true });
    }
    fs.mkdirSync(tempExtPath, { recursive: true });
    
    // Copy extension files
    const extFiles = fs.readdirSync(EXTENSION_PATH);
    for (const file of extFiles) {
        const src = path.join(EXTENSION_PATH, file);
        const dst = path.join(tempExtPath, file);
        fs.copyFileSync(src, dst);
    }
    
    // Create an injection script that pre-loads the profile
    const preloadScript = `
// Pre-load profile into localStorage for content.js
(function() {
    const profile = ${JSON.stringify(profile)};
    try {
        localStorage.setItem('__fp_spoof_config__', JSON.stringify(profile));
        localStorage.setItem('__fp_spoof_enabled__', 'true');
        console.log('[FP Spoofer] Profile pre-loaded:', profile.client?.navigator?.userAgent?.substring(0, 50));
    } catch (e) {
        console.error('[FP Spoofer] Failed to pre-load profile:', e);
    }
})();
`;
    
    // Read original content.js and prepend the preload
    const contentJs = fs.readFileSync(path.join(EXTENSION_PATH, 'content.js'), 'utf8');
    fs.writeFileSync(path.join(tempExtPath, 'content.js'), preloadScript + '\n' + contentJs);
    
    console.log('Extension prepared with profile pre-loaded');
    
    // Resolve to absolute path
    const absoluteExtPath = path.resolve(tempExtPath);
    
    // Launch browser
    console.log('\nLaunching Chrome for Testing with extension...');
    
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: [
            `--disable-extensions-except=${absoluteExtPath}`,
            `--load-extension=${absoluteExtPath}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor',
            '--window-size=1920,1080',
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
    });
    
    console.log('Browser launched');
    
    // Get pages (extension may have created some)
    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();
    
    // Set up localStorage before navigation
    console.log('\nSetting up extension configuration...');
    
    // First navigate to the target origin to set localStorage
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Inject the profile into localStorage
    await page.evaluate((profileStr) => {
        localStorage.setItem('__fp_spoof_config__', profileStr);
        localStorage.setItem('__fp_spoof_enabled__', 'true');
    }, JSON.stringify(profile));
    
    console.log('Profile injected into localStorage');
    
    // Now reload to apply the spoofing
    console.log(`\nNavigating to: ${TARGET_URL}`);
    await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
    
    // Wait for content to load
    await new Promise(r => setTimeout(r, 5000));
    
    // Capture the fingerprint result
    console.log('\nCapturing fingerprint result...');
    
    const result = await page.evaluate(() => {
        // Try various ways to get the fingerprint data
        const pre = document.querySelector('pre');
        if (pre) return pre.textContent;
        
        const code = document.querySelector('code');
        if (code) return code.textContent;
        
        // Try to find JSON in body
        const body = document.body.innerText;
        if (body.startsWith('{')) return body;
        
        return body;
    });
    
    // Save result
    if (result) {
        let parsed;
        try {
            parsed = JSON.parse(result);
            fs.writeFileSync(RESULT_PATH, JSON.stringify(parsed, null, 2));
            console.log(`\nResult saved to: ${RESULT_PATH}`);
            console.log('\nSample data:');
            console.log(JSON.stringify(parsed, null, 2).substring(0, 500) + '...');
        } catch (e) {
            fs.writeFileSync(RESULT_PATH, result);
            console.log(`\nRaw result saved to: ${RESULT_PATH}`);
            console.log('Result preview:', result.substring(0, 500));
        }
    } else {
        console.log('\nWARNING: No result captured');
        
        // Take a screenshot for debugging
        const screenshotPath = './screenshot.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to: ${screenshotPath}`);
        
        // Get page content for debugging
        const html = await page.content();
        fs.writeFileSync('./page.html', html);
        console.log('Page HTML saved to: ./page.html');
    }
    
    // Cleanup
    await browser.close();
    
    // Cleanup temp extension
    try {
        fs.rmSync(tempExtPath, { recursive: true });
    } catch (e) {}
    
    console.log('\n========================================');
    console.log('  Test Complete!');
    console.log('========================================\n');
}

main().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});

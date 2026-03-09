// background.js - Service worker for FP Spoofer extension

// Update HTTP headers using declarativeNetRequest
async function updateHeaderRules(profile, enabled) {
  // Clear existing rules first
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(r => r.id);
    
    if (existingRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds
      });
    }
  } catch (e) {
    console.log('[FP Spoofer] Error clearing rules:', e);
  }
  
  if (!enabled || !profile) return;
  
  const server = profile.server || {};
  const navigator = profile.client?.navigator || {};
  
  // Build header modifications
  const requestHeaders = [];
  
  // User-Agent - use navigator.userAgent for actual header
  if (navigator.userAgent) {
    requestHeaders.push({
      header: 'User-Agent',
      operation: 'set',
      value: navigator.userAgent
    });
  }
  
  // Accept-Language from server headers
  if (server.accept_language) {
    requestHeaders.push({
      header: 'Accept-Language',
      operation: 'set',
      value: server.accept_language
    });
  }
  
  // Sec-Ch-Ua headers from server
  if (server.ch_ua) {
    requestHeaders.push({
      header: 'Sec-Ch-Ua',
      operation: 'set',
      value: server.ch_ua
    });
  }
  
  if (server.ch_ua_mobile) {
    requestHeaders.push({
      header: 'Sec-Ch-Ua-Mobile',
      operation: 'set',
      value: server.ch_ua_mobile
    });
  }
  
  if (server.ch_ua_platform) {
    requestHeaders.push({
      header: 'Sec-Ch-Ua-Platform',
      operation: 'set',
      value: server.ch_ua_platform
    });
  }
  
  // DNT header from server
  if (server.dnt !== undefined && server.dnt !== null) {
    requestHeaders.push({
      header: 'DNT',
      operation: 'set',
      value: String(server.dnt)
    });
  }
  
  if (requestHeaders.length === 0) return;
  
  // Add the rule - remove first then add in same call to ensure uniqueness
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: [{
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: requestHeaders
        },
        condition: {
          urlFilter: '|http',
          resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet', 'font', 'media', 'other']
        }
      }]
    });
    
    console.log('[FP Spoofer] Header rules updated:', requestHeaders.length, 'headers:', requestHeaders.map(h => h.header).join(', '));
  } catch (e) {
    console.error('[FP Spoofer] Failed to update header rules:', e);
  }
}

// Inject spoof config into pages before they load
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame
  
  // Skip chrome://, edge://, about:, and other restricted URLs
  if (!details.url || 
      details.url.startsWith('chrome://') || 
      details.url.startsWith('chrome-extension://') ||
      details.url.startsWith('edge://') ||
      details.url.startsWith('about:') ||
      details.url.startsWith('moz-extension://') ||
      details.url.startsWith('devtools://')) {
    return;
  }
  
  try {
    const data = await chrome.storage.local.get(['spoofEnabled', 'spoofProfile']);
    
    if (!data.spoofEnabled || !data.spoofProfile) return;
    
    // Inject config via executeScript
    await chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: (config, enabled) => {
        try {
          localStorage.setItem('__fp_spoof_config__', JSON.stringify(config));
          localStorage.setItem('__fp_spoof_enabled__', enabled.toString());
        } catch (e) {
          console.error('[FP Spoofer] Failed to inject config:', e);
        }
      },
      args: [data.spoofProfile, data.spoofEnabled],
      world: 'MAIN',
      injectImmediately: true
    });
    
  } catch (e) {
    // Silently ignore injection errors for restricted pages
    if (!e.message?.includes('Cannot access')) {
      console.error('[FP Spoofer] Background error:', e);
    }
  }
});

// Handle extension icon click - show badge status
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace !== 'local') return;
  
  if (changes.spoofEnabled || changes.spoofProfile) {
    const data = await chrome.storage.local.get(['spoofEnabled', 'spoofProfile']);
    updateBadge(data.spoofEnabled);
    await updateHeaderRules(data.spoofProfile, data.spoofEnabled);
  }
});

// Update badge based on enabled state
async function updateBadge(enabled) {
  if (enabled) {
    await chrome.action.setBadgeText({ text: 'ON' });
    await chrome.action.setBadgeBackgroundColor({ color: '#00d4ff' });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

// Initialize badge on startup
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get(['spoofEnabled', 'spoofProfile']);
  updateBadge(data.spoofEnabled || false);
  await updateHeaderRules(data.spoofProfile, data.spoofEnabled);
});

// Also initialize when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['spoofEnabled', 'spoofProfile']);
  updateBadge(data.spoofEnabled || false);
  await updateHeaderRules(data.spoofProfile, data.spoofEnabled);
  
  console.log('[FP Spoofer] Extension installed/updated');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getConfig') {
    chrome.storage.local.get(['spoofEnabled', 'spoofProfile']).then(data => {
      sendResponse(data);
    });
    return true; // Keep channel open for async response
  }
  
  // Handle window resize for mobile emulation
  if (message.type === 'resizeWindow') {
    const { width, height } = message;
    resizeCurrentWindow(width, height).then(result => {
      sendResponse(result);
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});

// Resize browser window to match profile screen dimensions
async function resizeCurrentWindow(targetWidth, targetHeight) {
  try {
    // Get the current window
    const currentWindow = await chrome.windows.getCurrent();
    
    // Add browser chrome height (tabs, address bar, etc.) - approximately 80-100px
    // This varies by OS but we'll use a reasonable estimate
    const chromeHeight = 100;
    const chromeWidth = 0; // Sides are usually accurate
    
    const newWidth = targetWidth + chromeWidth;
    const newHeight = targetHeight + chromeHeight;
    
    // Update the window size
    await chrome.windows.update(currentWindow.id, {
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    });
    
    console.log(`[FP Spoofer] Window resized to ${newWidth}x${newHeight} (viewport: ${targetWidth}x${targetHeight})`);
    return { success: true, width: newWidth, height: newHeight };
  } catch (e) {
    console.error('[FP Spoofer] Failed to resize window:', e);
    return { success: false, error: e.message };
  }
}

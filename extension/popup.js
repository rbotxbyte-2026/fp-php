// popup.js - Handles import/export and UI interactions

document.addEventListener('DOMContentLoaded', async () => {
  const enableSpoof = document.getElementById('enableSpoof');
  const fileInput = document.getElementById('fileInput');
  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');
  const reloadBtn = document.getElementById('reloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const status = document.getElementById('status');
  const loadedProfile = document.getElementById('loadedProfile');
  const loadedUA = document.getElementById('loadedUA');
  const loadedPlatform = document.getElementById('loadedPlatform');
  const statSignals = document.getElementById('statSignals');
  const statWebGL = document.getElementById('statWebGL');

  // Load saved state
  const data = await chrome.storage.local.get(['spoofEnabled', 'spoofProfile']);
  enableSpoof.checked = data.spoofEnabled || false;
  
  if (data.spoofProfile) {
    displayProfileInfo(data.spoofProfile);
  }

  // Toggle spoofing
  enableSpoof.addEventListener('change', async () => {
    await chrome.storage.local.set({ spoofEnabled: enableSpoof.checked });
    showStatus(enableSpoof.checked ? 'Spoofing enabled' : 'Spoofing disabled', 'success');
  });

  // Import button click
  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // File selection
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const profile = JSON.parse(text);
      
      // Validate it has expected structure
      if (!profile.client && !profile.server) {
        throw new Error('Invalid profile format. Expected output.json structure.');
      }

      await chrome.storage.local.set({ spoofProfile: profile });
      displayProfileInfo(profile);
      showStatus(`Profile imported successfully!`, 'success');
      
      // Auto-enable spoofing
      enableSpoof.checked = true;
      await chrome.storage.local.set({ spoofEnabled: true });
      
    } catch (err) {
      showStatus(`Import failed: ${err.message}`, 'error');
    }
    
    fileInput.value = '';
  });

  // Export current profile
  exportBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get(['spoofProfile']);
    if (!data.spoofProfile) {
      showStatus('No profile loaded to export', 'warning');
      return;
    }

    const blob = new Blob([JSON.stringify(data.spoofProfile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spoof-profile.json';
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Profile exported', 'success');
  });

  // Reload active tab
  reloadBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.reload(tab.id);
      showStatus('Tab reloaded', 'success');
    }
  });

  // Clear profile
  clearBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['spoofProfile']);
    enableSpoof.checked = false;
    await chrome.storage.local.set({ spoofEnabled: false });
    loadedProfile.style.display = 'none';
    showStatus('Profile cleared', 'success');
  });

  function displayProfileInfo(profile) {
    loadedProfile.style.display = 'block';
    
    const client = profile.client || {};
    const navigator = client.navigator || {};
    const webgl = client.webgl || {};
    
    // User Agent (truncated)
    const ua = navigator.userAgent || profile.server?.user_agent || '-';
    loadedUA.textContent = ua.length > 30 ? ua.substring(0, 30) + '...' : ua;
    loadedUA.title = ua;
    
    // Platform
    loadedPlatform.textContent = navigator.platform || '-';
    
    // Count signals
    const signalCount = countSignals(profile);
    statSignals.textContent = signalCount;
    
    // WebGL info
    const renderer = webgl.renderer || webgl.unmaskedRenderer || '-';
    statWebGL.textContent = renderer.length > 10 ? renderer.substring(0, 10) + '..' : renderer;
    statWebGL.title = renderer;
  }

  function countSignals(obj, count = 0) {
    for (const key in obj) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        count = countSignals(obj[key], count);
      } else {
        count++;
      }
    }
    return count;
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    setTimeout(() => {
      status.className = 'status';
    }, 3000);
  }
});

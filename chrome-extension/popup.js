let settings = {
  enabled: true,
  autoScan: true,
  showWarnings: true,
  emailsScanned: 0,
  threatsBlocked: 0
};

// Load saved settings
chrome.storage.sync.get(['settings'], (result) => {
  if (result.settings) {
    settings = { ...settings, ...result.settings };
    updateUI();
  }
});

// Update UI elements based on current settings
function updateUI() {
  document.getElementById('toggleProtection').textContent = 
    settings.enabled ? 'Disable' : 'Enable';
  document.querySelector('.status-dot').classList.toggle('active', settings.enabled);
  document.querySelector('.status-text').textContent = 
    settings.enabled ? 'Active' : 'Disabled';
  
  document.getElementById('autoScan').checked = settings.autoScan;
  document.getElementById('showWarnings').checked = settings.showWarnings;
  document.getElementById('emailsScanned').textContent = settings.emailsScanned;
  document.getElementById('threatsBlocked').textContent = settings.threatsBlocked;
}

// Toggle protection
document.getElementById('toggleProtection').addEventListener('click', () => {
  settings.enabled = !settings.enabled;
  chrome.storage.sync.set({ settings });
  updateUI();
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { 
      action: 'toggleProtection',
      enabled: settings.enabled 
    });
  });
});

// Handle settings changes
document.getElementById('autoScan').addEventListener('change', (e) => {
  settings.autoScan = e.target.checked;
  chrome.storage.sync.set({ settings });
});

document.getElementById('showWarnings').addEventListener('change', (e) => {
  settings.showWarnings = e.target.checked;
  chrome.storage.sync.set({ settings });
});

// Open dashboard
document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://phishingshield-ai.netlify.app' });
});
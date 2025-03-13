// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    settings: {
      enabled: true,
      autoScan: true,
      showWarnings: true,
      emailsScanned: 0,
      threatsBlocked: 0
    }
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStats') {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || {
        enabled: true,
        autoScan: true,
        showWarnings: true,
        emailsScanned: 0,
        threatsBlocked: 0
      };

      const newSettings = {
        ...settings,
        emailsScanned: settings.emailsScanned + (request.emailsScanned || 0),
        threatsBlocked: settings.threatsBlocked + (request.threatsBlocked || 0)
      };

      chrome.storage.sync.set({ settings: newSettings }, () => {
        updateBadge(newSettings.threatsBlocked);
        // Send response to confirm update
        sendResponse({ success: true });
      });
    });

    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

// Update extension badge
function updateBadge(threatsBlocked) {
  if (threatsBlocked > 0) {
    chrome.action.setBadgeText({ text: threatsBlocked.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#C53030' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}
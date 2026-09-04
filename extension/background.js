// MViewer Chrome Extension Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('MViewer Extension installed successfully.');
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSidePanel') {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.windows.getCurrent((win) => {
        if (win.id) {
          chrome.sidePanel.open({ windowId: win.id });
        }
      });
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'openFullTab') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    sendResponse({ success: true });
    return true;
  }
});

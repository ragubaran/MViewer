document.getElementById('openFullTab').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  window.close();
});

document.getElementById('openSidePanel').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openSidePanel' }, () => {
    window.close();
  });
});

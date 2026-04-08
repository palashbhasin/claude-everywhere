const apiKeyInput = document.getElementById('apiKey');
const showOverlay = document.getElementById('showOverlay');
const contextMode = document.getElementById('contextMode');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

// Load saved settings
chrome.storage.sync.get(['apiKey', 'showOverlay', 'contextMode'], (data) => {
  if (data.apiKey) apiKeyInput.value = data.apiKey;
  if (data.showOverlay !== undefined) showOverlay.checked = data.showOverlay;
  if (data.contextMode !== undefined) contextMode.checked = data.contextMode;
});

saveBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    status.textContent = 'API key is required.';
    status.style.color = '#c66';
    return;
  }

  chrome.storage.sync.set({
    apiKey: key,
    showOverlay: showOverlay.checked,
    contextMode: contextMode.checked
  }, () => {
    status.textContent = 'Settings saved!';
    status.style.color = '#6c6';

    // Notify all tabs to update overlay visibility
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          showOverlay: showOverlay.checked,
          contextMode: contextMode.checked
        }).catch(() => {});
      }
    });

    setTimeout(() => { status.textContent = ''; }, 2000);
  });
});

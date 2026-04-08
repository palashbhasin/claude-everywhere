// Claude Everywhere — Content Script (Overlay)
(function () {
  if (document.getElementById('claude-everywhere-fab')) return;

  const messages = [];
  let isLoading = false;

  // --- Floating Action Button ---
  const fab = document.createElement('button');
  fab.id = 'claude-everywhere-fab';
  fab.textContent = '\u2728';
  fab.title = 'Claude Everywhere';
  document.body.appendChild(fab);

  // --- Chat Panel ---
  const panel = document.createElement('div');
  panel.id = 'claude-everywhere-panel';
  panel.innerHTML = `
    <div class="ce-header">
      <h2>Claude Everywhere</h2>
      <button id="ce-close">\u2715</button>
    </div>
    <div class="ce-messages" id="ce-messages"></div>
    <div class="ce-input-row">
      <textarea id="ce-input" rows="1" placeholder="Ask Claude anything\u2026"></textarea>
      <button id="ce-send">\u2191</button>
    </div>
  `;
  document.body.appendChild(panel);

  const messagesContainer = panel.querySelector('#ce-messages');
  const input = panel.querySelector('#ce-input');
  const sendBtn = panel.querySelector('#ce-send');
  const closeBtn = panel.querySelector('#ce-close');

  // --- Toggle panel ---
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // --- Send message ---
  function addMessage(role, text) {
    messages.push({ role, content: text });
    const div = document.createElement('div');
    div.className = `ce-msg ${role}`;
    div.textContent = text;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function send() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    addMessage('user', text);
    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    // Gather page context
    let context = null;
    try {
      const { contextMode } = await chrome.storage.sync.get('contextMode');
      if (contextMode !== false) {
        context = getPageContext();
      }
    } catch {}

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CHAT_REQUEST',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        context
      });

      if (response.error) {
        const div = document.createElement('div');
        div.className = 'ce-msg error';
        div.textContent = response.error;
        messagesContainer.appendChild(div);
      } else {
        addMessage('assistant', response.content);
      }
    } catch (err) {
      const div = document.createElement('div');
      div.className = 'ce-msg error';
      div.textContent = 'Failed to reach Claude. Check your API key.';
      messagesContainer.appendChild(div);
    }

    isLoading = false;
    sendBtn.disabled = false;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  // --- Page context extraction ---
  function getPageContext() {
    const host = window.location.hostname;

    // Try site-specific extractors
    if (host.includes('mail.google.com')) return extractGmail();
    if (host.includes('discord.com')) return extractDiscord();
    if (host.includes('replit.com')) return extractReplit();

    // Generic fallback: grab visible text (truncated)
    const selection = window.getSelection().toString().trim();
    if (selection) return `Selected text:\n${selection.slice(0, 2000)}`;

    const title = document.title;
    const meta = document.querySelector('meta[name="description"]')?.content || '';
    const bodyText = document.body.innerText.slice(0, 3000);
    return `Page: ${title}\nDescription: ${meta}\n\nContent:\n${bodyText}`;
  }

  function extractGmail() {
    const subject = document.querySelector('h2[data-thread-perm-id]')?.textContent || document.querySelector('.hP')?.textContent || '';
    const emailBodies = [...document.querySelectorAll('.a3s')].map(el => el.innerText).join('\n---\n');
    return `Gmail Email\nSubject: ${subject}\n\n${emailBodies.slice(0, 3000)}`;
  }

  function extractDiscord() {
    const channel = document.querySelector('[class*="title-"]')?.textContent || '';
    const msgs = [...document.querySelectorAll('[id^="chat-messages-"]')]
      .slice(-20)
      .map(el => el.innerText)
      .join('\n');
    return `Discord Channel: ${channel}\n\nRecent messages:\n${msgs.slice(0, 3000)}`;
  }

  function extractReplit() {
    const title = document.querySelector('.repl-title')?.textContent || document.title;
    // Try to grab visible editor content
    const editorLines = [...document.querySelectorAll('.cm-line')].map(el => el.textContent).join('\n');
    return `Replit Project: ${title}\n\nEditor content:\n${editorLines.slice(0, 3000)}`;
  }

  // --- Listen for settings updates ---
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SETTINGS_UPDATED') {
      fab.style.display = msg.showOverlay ? 'flex' : 'none';
      panel.classList.remove('open');
    }
  });

  // Check initial visibility setting
  chrome.storage.sync.get('showOverlay', (data) => {
    if (data.showOverlay === false) fab.style.display = 'none';
  });
})();

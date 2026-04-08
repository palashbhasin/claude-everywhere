// Claude Everywhere — Background Service Worker
// Handles Claude API calls from content scripts

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-6';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHAT_REQUEST') {
    handleChatRequest(message).then(sendResponse).catch((err) => {
      sendResponse({ error: err.message });
    });
    return true; // keep channel open for async response
  }
});

async function handleChatRequest({ messages, context }) {
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (!apiKey) {
    return { error: 'No API key configured. Click the extension icon to set your key.' };
  }

  const systemPrompt = context
    ? `You are Claude, embedded in a browser extension called "Claude Everywhere". The user is currently on a webpage. Here is context from the page:\n\n${context}\n\nHelp the user with whatever they need based on this context.`
    : 'You are Claude, embedded in a browser extension called "Claude Everywhere". Help the user with whatever they need.';

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    return { error: `API error ${response.status}: ${errBody}` };
  }

  const data = await response.json();
  return { content: data.content[0].text };
}

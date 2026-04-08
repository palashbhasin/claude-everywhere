# Claude Everywhere

> Connect Claude to anything. Gmail. Discord. Replit. Any website. Have Claude at your side at all times.

**Claude Everywhere** is an open-source toolkit that brings Claude to every corner of your digital life through two surfaces:

- **Browser Extension** — A floating Claude chat overlay on any webpage, with context-aware actions for Gmail, Discord, Replit, and more.
- **MCP Servers** — Backend integrations that plug into Claude Code and Claude Desktop, giving Claude direct access to Gmail, Discord, Replit, and other services.

> **Note:** This project is not affiliated with or licensed by Anthropic. It uses the public Claude API.

## Quick Start

### Browser Extension

1. Clone this repo: `git clone https://github.com/palashbhasin/claude-everywhere.git`
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the `extension/` folder
5. Click the extension icon and enter your [Anthropic API key](https://console.anthropic.com/)
6. Visit any website — click the floating button to chat with Claude

### MCP Servers

1. Install the Gmail server:
   ```bash
   cd mcp-servers/gmail
   npm install
   cp .env.example .env
   # Fill in your Gmail OAuth2 credentials in .env
   ```

2. Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "claude-everywhere-gmail": {
         "command": "node",
         "args": ["/path/to/claude-everywhere/mcp-servers/gmail/index.js"]
       }
     }
   }
   ```

3. Restart Claude Desktop — you can now ask Claude to read and send emails.

## Project Structure

```
claude-everywhere/
├── website/              # Promotional landing page
├── extension/            # Chrome browser extension (Manifest V3)
│   ├── manifest.json     # Extension config
│   ├── popup/            # Settings popup (API key, preferences)
│   ├── content/          # Content scripts (overlay + site extractors)
│   ├── background/       # Service worker (Claude API calls)
│   └── assets/           # Icons
├── mcp-servers/          # MCP server packages
│   ├── gmail/            # Gmail integration (fully implemented)
│   ├── discord/          # Discord integration (stub)
│   ├── replit/           # Replit integration (stub)
│   └── shared/           # Shared MCP utilities
└── docs/                 # Documentation
```

## Supported Integrations

| Service | Extension (context-aware) | MCP Server |
|---------|:------------------------:|:----------:|
| Gmail   | Yes                      | Yes        |
| Discord | Yes                      | Stub       |
| Replit  | Yes                      | Stub       |
| Any webpage | Yes (generic)        | —          |

## How It Works

### Browser Extension
The extension injects a floating chat button on every page. When you click it, a slide-out panel opens where you can chat with Claude. On supported sites (Gmail, Discord, Replit), the extension automatically extracts page context (email content, chat messages, code) and sends it to Claude so responses are relevant to what you're looking at.

### MCP Servers
MCP (Model Context Protocol) servers give Claude direct access to external services. When added to Claude Desktop or Claude Code, they expose tools like `list_emails`, `read_email`, and `send_email` that Claude can call during conversations.

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for how to add new integrations.

## License

MIT

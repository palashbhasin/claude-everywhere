# Installation Guide

## Browser Extension

### Prerequisites
- Google Chrome (or any Chromium-based browser: Edge, Brave, Arc)
- An [Anthropic API key](https://console.anthropic.com/)

### Steps

1. **Download the extension**
   ```bash
   git clone https://github.com/palashbhasin/claude-everywhere.git
   ```

2. **Load in Chrome**
   - Open `chrome://extensions`
   - Enable **Developer mode** (toggle in the top right)
   - Click **Load unpacked**
   - Select the `extension/` folder from the cloned repo

3. **Configure**
   - Click the Claude Everywhere extension icon in the toolbar
   - Enter your Anthropic API key
   - Toggle **Show floating button** (on by default)
   - Toggle **Context-aware mode** (on by default — sends page context to Claude)
   - Click **Save Settings**

4. **Use it**
   - Visit any webpage
   - Click the floating button (bottom-right corner)
   - Type your message and press Enter
   - On Gmail, Discord, or Replit, Claude automatically sees the page context

### Troubleshooting
- **Button not appearing?** Check that the extension is enabled in `chrome://extensions`
- **API errors?** Verify your API key is correct and has credits
- **No context on Gmail?** Make sure Context-aware mode is toggled on

---

## MCP Servers

### Prerequisites
- Node.js 18+
- Claude Desktop or Claude Code

### Gmail MCP Server

1. **Install dependencies**
   ```bash
   cd mcp-servers/gmail
   npm install
   ```

2. **Set up Gmail OAuth2 credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth2 client (Desktop app type)
   - Enable the Gmail API
   - Download the credentials and note the Client ID and Client Secret
   - Generate a refresh token using the OAuth2 playground or a script
   - Copy `.env.example` to `.env` and fill in your credentials:
     ```bash
     cp .env.example .env
     ```

3. **Add to Claude Desktop**
   
   Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "claude-everywhere-gmail": {
         "command": "node",
         "args": ["/absolute/path/to/claude-everywhere/mcp-servers/gmail/index.js"]
       }
     }
   }
   ```

4. **Add to Claude Code**
   
   Edit `.claude/settings.json`:
   ```json
   {
     "mcpServers": {
       "claude-everywhere-gmail": {
         "command": "node",
         "args": ["/absolute/path/to/claude-everywhere/mcp-servers/gmail/index.js"]
       }
     }
   }
   ```

5. **Restart** Claude Desktop or Claude Code. You should see the Gmail tools available.

### Discord MCP Server (Coming Soon)

The Discord server is currently a stub. To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).

### Replit MCP Server (Coming Soon)

The Replit server is currently a stub. To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).

# Contributing to Claude Everywhere

Thanks for your interest in contributing! Here's how to add new integrations.

## Adding a New MCP Server

1. Create a new directory under `mcp-servers/`:
   ```bash
   mkdir mcp-servers/your-service
   ```

2. Create a `package.json`:
   ```json
   {
     "name": "@claude-everywhere/mcp-your-service",
     "version": "0.1.0",
     "type": "module",
     "main": "index.js"
   }
   ```

3. Create `index.js` following the pattern in `mcp-servers/gmail/index.js`:
   - Import shared utilities from `../shared/index.js`
   - Define your tools with proper input schemas
   - Handle `initialize`, `tools/list`, and `tools/call` MCP methods
   - Implement the actual API calls for each tool

4. Add a `.env.example` with required credentials.

5. Test locally by running `node index.js` and piping JSON-RPC messages to stdin.

## Adding a Site Extractor (Browser Extension)

To add context-aware support for a new website:

1. Open `extension/content/overlay.js`
2. Add a new condition in `getPageContext()`:
   ```js
   if (host.includes('yoursite.com')) return extractYourSite();
   ```
3. Add the extractor function:
   ```js
   function extractYourSite() {
     // Use DOM queries to extract relevant content
     return `YourSite Context:\n${relevantContent}`;
   }
   ```

## Code Style
- ES modules (`import`/`export`)
- No build step required for MCP servers
- Keep dependencies minimal

## Pull Requests
- One integration per PR
- Include a `.env.example` for any new credentials
- Update the README table with your new integration

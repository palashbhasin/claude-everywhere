#!/usr/bin/env node
// Claude Everywhere — Replit MCP Server (stub)
// TODO: Implement Replit API integration
import { loadEnv, mcpResponse, mcpError, readMessages, sendMessage } from '../shared/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(__dirname);

const SERVER_INFO = { name: 'claude-everywhere-replit', version: '0.1.0' };

const TOOLS = [
  {
    name: 'list_repls',
    description: 'List your Replit projects.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'read_file',
    description: 'Read a file from a Replit project.',
    inputSchema: {
      type: 'object',
      properties: {
        replId: { type: 'string', description: 'Repl ID' },
        path: { type: 'string', description: 'File path within the repl' }
      },
      required: ['replId', 'path']
    }
  },
  {
    name: 'run_repl',
    description: 'Run a Replit project and get output.',
    inputSchema: {
      type: 'object',
      properties: {
        replId: { type: 'string', description: 'Repl ID' }
      },
      required: ['replId']
    }
  }
];

async function handleMessage(msg) {
  const { id, method, params } = msg;
  switch (method) {
    case 'initialize':
      return sendMessage(mcpResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO
      }));
    case 'tools/list':
      return sendMessage(mcpResponse(id, { tools: TOOLS }));
    case 'tools/call':
      return sendMessage(mcpResponse(id, {
        content: [{ type: 'text', text: 'Replit MCP server is a stub. Implement tool handlers to use.' }],
        isError: true
      }));
    case 'notifications/initialized':
      return;
    default:
      return sendMessage(mcpError(id, -32601, `Method not found: ${method}`));
  }
}

async function main() {
  for await (const msg of readMessages()) {
    await handleMessage(msg);
  }
}

main().catch(console.error);

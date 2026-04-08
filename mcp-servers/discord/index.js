#!/usr/bin/env node
// Claude Everywhere — Discord MCP Server (stub)
// TODO: Implement Discord bot integration
import { loadEnv, mcpResponse, mcpError, readMessages, sendMessage } from '../shared/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(__dirname);

const SERVER_INFO = { name: 'claude-everywhere-discord', version: '0.1.0' };

const TOOLS = [
  {
    name: 'list_channels',
    description: 'List available Discord channels in a server.',
    inputSchema: {
      type: 'object',
      properties: {
        guildId: { type: 'string', description: 'Discord server (guild) ID' }
      },
      required: ['guildId']
    }
  },
  {
    name: 'read_messages',
    description: 'Read recent messages from a Discord channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: { type: 'string', description: 'Discord channel ID' },
        limit: { type: 'number', description: 'Number of messages (default 20)', default: 20 }
      },
      required: ['channelId']
    }
  },
  {
    name: 'send_message',
    description: 'Send a message to a Discord channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: { type: 'string', description: 'Discord channel ID' },
        content: { type: 'string', description: 'Message content' }
      },
      required: ['channelId', 'content']
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
        content: [{ type: 'text', text: 'Discord MCP server is a stub. Implement tool handlers to use.' }],
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

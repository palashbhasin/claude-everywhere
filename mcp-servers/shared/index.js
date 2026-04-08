// Claude Everywhere — Shared MCP Utilities
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Load environment variables from a .env file if present.
 */
export function loadEnv(dir) {
  const envPath = join(dir, '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

/**
 * Create a JSON-RPC response for MCP.
 */
export function mcpResponse(id, result) {
  return JSON.stringify({ jsonrpc: '2.0', id, result });
}

/**
 * Create a JSON-RPC error response for MCP.
 */
export function mcpError(id, code, message) {
  return JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
}

/**
 * Read JSON-RPC messages from stdin line-by-line.
 */
export async function* readMessages() {
  const decoder = new TextDecoder();
  const reader = process.stdin;
  let buffer = '';

  reader.setEncoding('utf-8');
  for await (const chunk of reader) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        yield JSON.parse(trimmed);
      } catch {}
    }
  }
}

/**
 * Send a message to stdout (MCP transport).
 */
export function sendMessage(msg) {
  process.stdout.write(msg + '\n');
}

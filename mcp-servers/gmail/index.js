#!/usr/bin/env node
// Claude Everywhere — Gmail MCP Server
import { google } from 'googleapis';
import { loadEnv, mcpResponse, mcpError, readMessages, sendMessage } from '../shared/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(__dirname);

const SERVER_INFO = {
  name: 'claude-everywhere-gmail',
  version: '0.1.0'
};

const TOOLS = [
  {
    name: 'list_emails',
    description: 'List recent emails from your Gmail inbox.',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: { type: 'number', description: 'Number of emails to return (default 10)', default: 10 },
        query: { type: 'string', description: 'Gmail search query (e.g. "from:alice@example.com")' }
      }
    }
  },
  {
    name: 'read_email',
    description: 'Read the full content of a specific email by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        messageId: { type: 'string', description: 'The Gmail message ID' }
      },
      required: ['messageId']
    }
  },
  {
    name: 'send_email',
    description: 'Send an email via Gmail.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body (plain text)' }
      },
      required: ['to', 'subject', 'body']
    }
  }
];

// --- Auth ---
function getAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );
  auth.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });
  return auth;
}

function getGmail() {
  return google.gmail({ version: 'v1', auth: getAuth() });
}

// --- Tool implementations ---
async function listEmails({ maxResults = 10, query = '' }) {
  const gmail = getGmail();
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: query
  });

  if (!res.data.messages) return { emails: [] };

  const emails = await Promise.all(
    res.data.messages.map(async (msg) => {
      const full = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'metadata', metadataHeaders: ['From', 'Subject', 'Date'] });
      const headers = full.data.payload.headers;
      return {
        id: msg.id,
        from: headers.find(h => h.name === 'From')?.value || '',
        subject: headers.find(h => h.name === 'Subject')?.value || '',
        date: headers.find(h => h.name === 'Date')?.value || '',
        snippet: full.data.snippet
      };
    })
  );

  return { emails };
}

async function readEmail({ messageId }) {
  const gmail = getGmail();
  const res = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
  const headers = res.data.payload.headers;
  const parts = res.data.payload.parts || [res.data.payload];
  let body = '';
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      body += Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
  }
  return {
    id: messageId,
    from: headers.find(h => h.name === 'From')?.value || '',
    to: headers.find(h => h.name === 'To')?.value || '',
    subject: headers.find(h => h.name === 'Subject')?.value || '',
    date: headers.find(h => h.name === 'Date')?.value || '',
    body
  };
}

async function sendEmail({ to, subject, body }) {
  const gmail = getGmail();
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  ).toString('base64url');
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  return { messageId: res.data.id, status: 'sent' };
}

// --- MCP Protocol Handler ---
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

    case 'tools/call': {
      const { name, arguments: args } = params;
      try {
        let result;
        switch (name) {
          case 'list_emails': result = await listEmails(args || {}); break;
          case 'read_email': result = await readEmail(args); break;
          case 'send_email': result = await sendEmail(args); break;
          default: return sendMessage(mcpError(id, -32601, `Unknown tool: ${name}`));
        }
        return sendMessage(mcpResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }));
      } catch (err) {
        return sendMessage(mcpResponse(id, {
          content: [{ type: 'text', text: `Error: ${err.message}` }],
          isError: true
        }));
      }
    }

    case 'notifications/initialized':
      return; // no response needed

    default:
      return sendMessage(mcpError(id, -32601, `Method not found: ${method}`));
  }
}

// --- Main loop ---
async function main() {
  for await (const msg of readMessages()) {
    await handleMessage(msg);
  }
}

main().catch(console.error);

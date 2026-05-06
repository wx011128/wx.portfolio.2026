import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

declare const process: {
  cwd: () => string;
  env: Record<string, string | undefined>;
};

type ChatResponse = {
  end: (value?: string) => void;
  flushHeaders: () => void;
  setHeader: (key: string, value: string) => ChatResponse;
  status: (code: number) => ChatResponse;
  write: (value: string) => void;
};

type DevRequest = {
  method?: string;
  on(event: 'data', handler: (chunk: string) => void): void;
  on(event: 'end', handler: () => void): void;
  setEncoding: (encoding: string) => void;
};

type DevResponse = {
  end: (value?: string) => void;
  flushHeaders?: () => void;
  setHeader: (key: string, value: string) => void;
  statusCode: number;
  write: (value: string) => void;
};

type ChatHandler = (
  request: { body: unknown; method?: string },
  response: ChatResponse,
) => Promise<void>;

function localChatApi(): Plugin {
  return {
    name: 'local-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (request, response, next) => {
        const devRequest = request as unknown as DevRequest;
        const devResponse = response as unknown as DevResponse;

        if (devRequest.method !== 'POST') {
          next();
          return;
        }

        let rawBody = '';
        devRequest.setEncoding('utf8');

        devRequest.on('data', (chunk: string) => {
          rawBody += chunk;
        });

        devRequest.on('end', async () => {
          let body = {};

          try {
            body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            devResponse.statusCode = 400;
            devResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
            devResponse.end(JSON.stringify({ error: 'Invalid JSON body' }));
            return;
          }

          const chatModulePath = `${process.cwd()}/api/chat.js`;
          const { default: handler } = (await import(chatModulePath)) as {
            default: ChatHandler;
          };
          const serverResponse = {
            end(value = '') {
              devResponse.end(value);
            },
            flushHeaders() {
              devResponse.flushHeaders?.();
            },
            setHeader(key: string, value: string) {
              devResponse.setHeader(key, value);
              return serverResponse;
            },
            status(code: number) {
              devResponse.statusCode = code;
              return serverResponse;
            },
            write(value: string) {
              devResponse.write(value);
            },
          };

          await handler({ body, method: devRequest.method }, serverResponse);
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [localChatApi(), react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  };
});

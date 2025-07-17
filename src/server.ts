import wsAdapter from 'crossws/adapters/node';
import { getPort } from 'get-port-please';
import { createApp, toNodeListener } from 'h3';
import { createServer as createNodeServer } from 'node:http';

import { endpointWs } from '../shared/data.js';
import socketHandler from './handler/socket.js';
import staticHandler from './handler/static.js';
import { createLogger } from './utils.js';

type ServerUserOptions = {
  cwd?: string;
  host?: string;
  port?: number;
};

type ServerOptions = Required<ServerUserOptions> & {
  url: string;
};

const log = createLogger('host');

const defaultHost = '127.0.0.1';
const defaultPort = 7777;

export async function getServerSettings(options: ServerUserOptions): Promise<ServerOptions> {
  const cwd = options.cwd ?? process.cwd();
  const host = process.env.HOST ?? options.host ?? defaultHost;
  const port = await getPort({
    host,
    portRange: [defaultPort, 9000],
    port: process.env.PORT
      ? Number(process.env.PORT)
      : options.port ?? defaultPort,
  });

  return {
    url: `http://${host === defaultHost ? 'localhost' : host}:${port}`,
    cwd,
    host,
    port,
  };
}

export function createServer() {
  const app = createApp({
    debug: process.env.NODE_ENV === 'development',
    onRequest: (event) => {
      log(`Received ${event.req.method} Request on '${event.req.url}'`);
    },
    onError: (error) => {
      log('Error:', error);
    },
  });

  app.use(endpointWs, socketHandler);

  app.use(staticHandler);

  // @ts-expect-error https://v1.h3.dev/adapters/node#websocket-support
  const { handleUpgrade } = wsAdapter(app.websocket);

  const server = createNodeServer(toNodeListener(app));

  server.on('upgrade', handleUpgrade);

  return {
    app,
    server,
  };
}

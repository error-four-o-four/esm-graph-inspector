import wsAdapter from 'crossws/adapters/node';
import { getPort } from 'get-port-please';
import { createApp, toNodeListener } from 'h3';
import { createServer as createNodeServer } from 'node:http';

import { endpointWs } from '../shared/data.js';
import socketHandler from './handler/socket.js';
import staticHandler from './handler/static.js';
import { hostLogger } from './utils.js';

type ServerUserOptions = {
  host?: string;
  port?: number;
};

const defaultHost = '127.0.0.1';
const defaultPort = 7777;

export async function createServer(options: ServerUserOptions) {
  const host = process.env.HOST ?? options.host ?? defaultHost;
  const port = await getPort({
    host,
    portRange: [defaultPort, 9000],
    port: process.env.PORT
      ? Number(process.env.PORT)
      : options.port ?? defaultPort,
  });

  const url = `http://${host === defaultHost ? 'localhost' : host}:${port}`;

  const app = createApp({
    debug: process.env.NODE_ENV === 'development',
    onRequest: (event) => {
      hostLogger(`Received ${event.req.method} Request on '${event.req.url}'`);
    },
    onError: (error) => {
      hostLogger('Error:', error);
    },
  });

  app.use(endpointWs, socketHandler);
  app.use(staticHandler);

  // @ts-expect-error https://v1.h3.dev/adapters/node#websocket-support
  const { handleUpgrade } = wsAdapter(app.websocket);

  const server = createNodeServer(toNodeListener(app));
  server.on('upgrade', handleUpgrade);
  server.on('error', error => hostLogger('Error:', error));

  return {
    app,
    server,
    host,
    port,
    url,
  };
}

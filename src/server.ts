import { plugin as ws } from 'crossws/server';
import { getPort } from 'get-port-please';
import { H3, onError, onRequest, serve } from 'h3/node';

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

export function createServer(port: number) {
  const app = new H3({ debug: process.env.NODE_ENV === 'development' });

  app.use(onRequest((event) => {
    log(`Received ${event.req.method} Request on '${event.req.url}'`);
  }));

  app.use(onError((error) => {
    log('Error:', error);
  }));

  app.use(endpointWs, socketHandler);

  app.use(staticHandler);

  const server = serve(app, {
    port,
    reusePort: true,
    plugins: [
      // @ts-expect-error https://github.com/h3js/h3/blob/main/examples/websocket.mjs
      ws({ resolve: async req => (await app.fetch(req)).crossws }),
    ],
  });

  return {
    app,
    server,
  };
}

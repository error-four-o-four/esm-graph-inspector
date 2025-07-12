import { cli } from 'cleye';
import open from 'open';

import { PKG_NAME, PKG_VERSION } from './constants.js';
import { createServer, getServerSettings } from './server.js';
import { cyan } from './utils.js';

const argv = cli({
  name: PKG_NAME,
  version: PKG_VERSION,

  flags: {
    host: {
      type: String,
      description: 'Host',
    },
    port: {
      type: Number,
      description: 'Port',
    },
  },
});

console.log(`Starting ${cyan('ESM Graph Inspector')} ...`);

const { url, port } = await getServerSettings(argv.flags);
const { server } = createServer(port);

await server.ready();
await open(url);

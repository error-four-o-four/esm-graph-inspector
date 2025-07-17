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

const { url, host, port } = await getServerSettings(argv.flags);
const { server } = createServer();

server.listen(port, host, async () => {
  console.log(`Started ${cyan('ESM Graph Inspector')} ...`);

  await open(url);
});

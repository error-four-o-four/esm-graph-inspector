import { cli } from 'cleye';
import open from 'open';

import { PKG_NAME, PKG_VERSION } from './constants.js';
import { initialize } from './data.js';
import { createServer } from './server.js';
import { cyan, hostLogger } from './utils.js';

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

// @todo create, parse and pass argv.flags.entry
initialize();

const { server, port, host, url } = await createServer(argv.flags);

server.listen(port, host, async () => {
  hostLogger(`Started ${cyan('ESM Graph Inspector')} ...`);

  if (process.env.NODE_ENV !== 'development') {
    await open(url);
  } else {
    hostLogger(`Listening on ${cyan(url)} ...`);
  }
});

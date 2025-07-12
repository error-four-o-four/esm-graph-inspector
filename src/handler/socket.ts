import { defineWebSocketHandler } from 'h3/node';

import type { Filetree } from '../../shared/types.js';

import { createFileTree } from '../graph/filesystem.js';
import { createLogger } from '../utils.js';

const wssLog = createLogger('wss');

// @todo
// cli flag --watch
// implement chokidar
let filetree: Filetree;

export default defineWebSocketHandler(({
  async open(peer) {
    wssLog('open: id', peer.id);

    filetree ??= (await createFileTree());

    console.log(filetree);

    peer.send(JSON.stringify({ type: 'filetree', data: filetree }));
  },

  async message(peer, message) {
    wssLog('from: ', peer.id);
    wssLog('msg:', message.id, message);
  },

  close(peer, details) {
    wssLog('close: id', peer.id, details);
  },

  error(peer, error) {
    wssLog('error', peer.id);
    console.error(error);
  },
}));

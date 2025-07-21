import { defineWebSocketHandler } from 'h3';

import { createPayload } from '../payload.js';
import { createLogger, yellow } from '../utils.js';

const wssLog = createLogger('wss');

export default defineWebSocketHandler(({
  async open(peer) {
    wssLog('open: id', peer.id);

    const payload = await createPayload();

    peer.send(JSON.stringify(payload));
  },

  async message(peer, message) {
    wssLog(`received msg ${yellow(message.id)} from ${yellow(peer.id)}`);
  },

  close(peer, details) {
    wssLog('close: id', peer.id, details);
  },

  error(peer, error) {
    wssLog('error', peer.id);
    console.error(error);
  },
}));

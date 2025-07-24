import { defineWebSocketHandler } from 'h3';

import type { Payload, PayloadRequest } from '../../shared/types.js';

import { createFiletreePayload } from '../payload/filetree.js';
import { createModuleGraphPayload } from '../payload/graph.js';
import { createLogger, red, yellow } from '../utils.js';

const wssLog = createLogger('wss');

// @todo => src/index.ts
const filetreePayload = createFiletreePayload();

export default defineWebSocketHandler(({
  async open(peer) {
    wssLog('open: id', peer.id);
  },

  close(peer, details) {
    wssLog('close: id', peer.id, details);
  },

  error(peer, error) {
    wssLog(red('Error'), peer.id);
    wssLog(String(error));
  },

  async message(peer, message) {
    wssLog(`received msg ${yellow(message.id)} from ${yellow(peer.id)}`);

    let payload: Payload;

    try {
      const request = message.json<PayloadRequest>();

      // @todo consider a switch/getter statement
      if (request.type === 'tree') {
        // await new Promise(res => setTimeout(res, 2000));
        payload = await filetreePayload;
      } else if (request.type === 'graph') {
        payload = await createModuleGraphPayload(request);
      } else {
        throw new Error('Not implemented yet');
      }
    } catch (catched) {
      // @todo differentiate errors from getModuleGraph
      const message = catched instanceof Error
        && catched.message.startsWith('Parse error')
        ? 'Unable to get module graph.'
        : 'An unexpected error occurred!';

      payload = {
        type: 'error',
        error: catched, // @todo NODE_ENV production
        message,
      };

      wssLog(red('Error'), peer.id);
      wssLog(String(catched));
    }

    wssLog('sending', payload.type);

    peer.send(JSON.stringify(payload));
  },
}));

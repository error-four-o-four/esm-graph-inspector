import { defineWebSocketHandler } from 'h3';

import type { ChangedPayload, Payload, PayloadRequest } from '../../shared/types/payload.js';

import { setUserEntryPoint } from '../data.js';
import { createFileTreePayload, createModuleGraphPayload } from '../payload.js';
import { red, wssLogger, yellow } from '../utils.js';

// https://github.com/h3js/h3/issues/716
type Peer = Parameters<NonNullable<Parameters<typeof defineWebSocketHandler>[0]['open']>>[0];

export const peers: Set<Peer> = new Set();

export function notifyClients(type: ChangedPayload['type'], path: string) {
  const payload = JSON.stringify({
    type,
    data: {
      path,
    },
  });

  for (const peer of peers) {
    peer.send(payload);
  }
}

// const requestHandler: {
//   [K in PayloadRequest['type']]: (req: GenericPayloadRequest<K>) => Promise<GenericPayload<K> | ErrorPayload>
// } = {
//   tree: createFileTreePayload,
//   graph: async (req: GenericPayloadRequest<'graph'>) => {
//     if (req.file) {
//       setUserEntryPoint(req.file);
//     }
//     return createModuleGraphPayload();
//   },
// };

export default defineWebSocketHandler(({
  async open(peer) {
    peers.add(peer);
    wssLogger('open: id', peer.id, peers.size);
  },

  close(peer, details) {
    peers.delete(peer);
    wssLogger('close: id', peer.id, details);
  },

  error(peer, error) {
    wssLogger(red('Error'), peer.id);
    wssLogger(String(error));
  },

  async message(peer, message) {
    wssLogger(`received message from ${yellow(peer.id)}`);

    let payload: Payload;

    try {
      const request = message.json<PayloadRequest>();

      // @todo consider a switch/getter statement
      // Argument of type 'PayloadRequest' is not assignable to parameter of type 'never'.
      // The intersection 'FileTreeDataRequest & GraphDataRequest' was reduced to 'never' because property 'type' has conflicting types in some constituents.
      // payload = await requestHandler[request.type](request);

      if (request.type === 'tree') {
        // await new Promise(res => setTimeout(res, 2000));
        payload = await createFileTreePayload();
      } else if (request.type === 'graph') {
        if (request.file) setUserEntryPoint(request.file);
        payload = await createModuleGraphPayload();
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

      wssLogger(red('Error'), peer.id);
      wssLogger(String(catched));
    }

    wssLogger('sending', payload.type);

    peer.send(JSON.stringify(payload));
  },
}));

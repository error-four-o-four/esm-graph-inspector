import type { Payload, PayloadRequest } from '~~/shared/types/payload.js';

import { endpointWs } from '~~/shared/data.js';
import { shallowRef } from 'vue';

const url = `ws://${location.host}${endpointWs}`;

const payload = shallowRef<Payload | undefined>();

const { send, status: socketStatus } = useWebSocket(url, {
  // heartbeat: {
  //   message: 'ping',
  //   interval: 10 * 1000,
  // },
  autoReconnect: {
    retries: 3,
    delay: 1000,
    onFailed: () => {
      payload.value = { type: 'error', message: 'Unable to create WebSocket connection.' };
    },
  },
  onError(_, e) {
    console.warn('[ws] error', e.timeStamp);
    const message = (e instanceof ErrorEvent)
      ? e.message
      : 'A WebSocket Error occured.';

    payload.value = Object.freeze({ type: 'error', message });
  },
  onDisconnected() {
    // console.log('[ws] disconnected', e.timeStamp);
    // @todo differntiate payload.error & warning
    // payload.value = Object.freeze({
    //   type: 'warning',
    //   message: 'Closed WebSocket conection.',
    // });
  },
  onMessage(_, e) {
    const result: Payload = JSON.parse(e.data);

    if (!result || result.type === 'warning' || result.type === 'error') {
      // @todo
      console.warn(result.message || 'An unexpected error occured!');
    }

    console.log('[ws] message', e.timeStamp, result.type);

    // if ('data' in result) {
    //   console.log(`received ${result.type}`);
    //   // console.log(result.type, result.data);
    // }

    payload.value = Object.freeze(result);
  },
});

function requestPayload<T = PayloadRequest>(request: T) {
  send(JSON.stringify(request));
}

export {
  payload,
  requestPayload,
  socketStatus,
};

export default function usePayload() {
  return {
    socketStatus,
    payload,
    requestPayload,
  };
}

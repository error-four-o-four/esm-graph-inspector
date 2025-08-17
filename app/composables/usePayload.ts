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
    retries: 2,
    delay: 1000,
    onFailed: () => {
      const message = 'Unable to create WebSocket connection.';

      console.warn('[ws] error', message);
      payload.value = Object.freeze({ type: 'error', message });
    },
  },
  onError(_, e) {
    const message = (e instanceof ErrorEvent)
      ? e.message
      : 'A WebSocket Error occured.';

    console.warn('[ws] error', e.timeStamp, message);
    payload.value = Object.freeze({ type: 'error', message });
  },
  onDisconnected() {
    payload.value = Object.freeze({
      type: 'warning',
      message: 'Closed WebSocket connection.',
    });
  },
  onMessage(_, e) {
    const result: Payload = JSON.parse(e.data);

    // @todo differntiate payload.error & warning
    // if (result.type === 'warning' || result.type === 'error') {
    if (result.type === 'error') {
      const message = result.message || 'An unexpected error occured!';
      console.warn('[ws]', result.type, e.timeStamp, message);
    }

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

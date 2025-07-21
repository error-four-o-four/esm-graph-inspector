import type { Payload } from '~~/shared/types';

import { endpointWs } from '~~/shared/data.js';
import { shallowRef } from 'vue';

const url = `ws://${location.host}${endpointWs}`;

export const wsStatus = ref<WsStatus>('idle');
export const wsError = shallowRef<Error>();

type WsStatus = 'idle' | 'working' | 'connected' | 'error';

const { data, ws } = useWebSocket(url, {
  // heartbeat: {
  //   message: 'ping',
  //   interval: 10 * 1000,
  // },
  autoReconnect: {
    retries: 3,
    delay: 1000,
    onFailed: () => {
      wsStatus.value = 'error';
      wsError.value = new Error('Unable to create WebSocket connection.');
    },
  },
});

ws.value?.addEventListener('open', (e) => {
  console.log('[ws] connected', e.timeStamp);
  wsStatus.value = 'connected';
});

ws.value?.addEventListener('error', (e) => {
  const message = (e instanceof ErrorEvent)
    ? e.message
    : 'A WebSocket Error occured.';

  wsStatus.value = 'error';
  wsError.value = new Error(message);
});

ws.value?.addEventListener('message', (e) => {
  console.log('[ws] message', e.timeStamp);
  wsStatus.value = 'connected';
});

ws.value?.addEventListener('close', (e) => {
  console.log('[ws] disconnected', e.timeStamp);
  wsStatus.value = 'idle';
});

export const payload = shallowRef<Payload | undefined>();

watch(data, async (newData) => {
  // payload.value = JSON.parse(typeof newData === 'string' ? newData : await newData.text());
  payload.value = JSON.parse(newData);
});

// export function requestPayload<T = PayloadRequest>(data: T) {
//   if (wsStatus.value === 'connected') {
//     wsStatus.value = 'working';
//     // const stat = send(JSON.stringify(data));
//     // console.log(stat);

//     send(JSON.stringify(data));
//   }
// }

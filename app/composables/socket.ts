import type { Payload } from '~~/shared/types';

import { endpointWs } from '~~/shared/data.js';

import { parseFileTreeData } from './filetree.js';

const url = `ws://${location.host}${endpointWs}`;
const { status: socketStatus, data: socketData } = useWebSocket(url);

export { socketStatus };

watch(socketData, async (newData) => {
  const json: Payload = JSON.parse(typeof newData === 'string' ? newData : await newData.text());

  if (json.type === 'filetree') {
    parseFileTreeData(json.data);
  }
});

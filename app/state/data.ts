import type { FileTreeData, ModuleGraphData } from '~~/shared/types/data.js';
import type { ErrorPayload } from '~~/shared/types/payload';

import { shallowRef, watch } from 'vue';

import { usePayload } from '~/composables/usePayload.js';

const { payload } = usePayload();

export const errorData = shallowRef<ErrorPayload>();

export const treeData = shallowRef<FileTreeData>();

export const graphData = shallowRef<ModuleGraphData>();

watch(payload, (value) => {
  // console.log('watching payload');
  // console.log(value);

  if (value && value.type === 'tree') {
    treeData.value = value.data;
    return;
  }

  if (value && value.type === 'tree-change') {
    treeData.value = undefined;
    graphData.value = undefined;
    return;
  }

  if (value && value.type === 'graph') {
    graphData.value = value.data;
    return;
  }

  if (value && value.type === 'graph-change') {
    graphData.value = undefined;
    return;
  }

  if (value && (value.type === 'error' || value.type === 'warning')) {
    errorData.value = value;
  }
}, { immediate: true });

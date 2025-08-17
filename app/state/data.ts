import type { FileTreeData, ModuleGraphData } from '~~/shared/types/data.js';

import { shallowRef, watch } from 'vue';

import type { ToastProps } from '~/composables/useToasts.js';

import { payload } from '~/composables/usePayload.js';

export const treeData = shallowRef<FileTreeData>();
export const graphData = shallowRef<ModuleGraphData>();
export const appStateData = shallowRef<ToastProps>();

watch(
  payload,
  (value) => {
    if (!value) return;

    switch (value.type) {
      case 'tree':
        appStateData.value = undefined;
        treeData.value = value.data;
        break;

      case 'tree-change':
        treeData.value = undefined;
        graphData.value = undefined;
        appStateData.value = {
          type: 'info',
          message: `${value.data.path} changed, clearing all data`,
        };
        break;

      case 'graph':
        if (value.data === undefined) {
          appStateData.value = Object.freeze({
            type: 'warning',
            message: 'Unable to determine entry point.',
          });
        } else {
          appStateData.value = undefined;
          graphData.value = value.data;
        }

        break;

      case 'graph-change':
        graphData.value = undefined;
        appStateData.value = {
          type: 'info',
          message: `${value.data.path} changed, clearing graph data`,
        };
        break;

      case 'error':
      case 'warning':
        appStateData.value = value;
        break;

      default:
        // @todo
        console.warn('Unknown payload type:', value);
    }
  },
  // @todo doublecheck neccessity
  { immediate: true },
);

// watch(payload, (value) => {
//   if (value && value.type === 'tree') {
//     treeData.value = value.data;
//     return;
//   }

//   if (value && value.type === 'tree-change') {
//     treeData.value = undefined;
//     graphData.value = undefined;
//     return;
//   }

//   if (value && value.type === 'graph') {
//     graphData.value = value.data;
//     return;
//   }

//   if (value && value.type === 'graph-change') {
//     graphData.value = undefined;
//     return;
//   }

//   if (value && (value.type === 'error')) {
//     errorData.value = value;
//   }
// }, { immediate: true });

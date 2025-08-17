import type { FileData } from '~~/shared/types/data';

import { shallowRef } from 'vue';

// import { payload } from '~/composables/socket.js';

export const selectedFile = shallowRef<FileData>();

export function selectFile(file: FileData) {
  selectedFile.value = file;
}

// export const imports = computed<string[] | undefined>(() => {
//   const values = selectedNode.value?.data?.data?.imports;

//   if (values === undefined || values.length === 0 || payload.value === undefined) return;

//   const result = new Set<string>();

//   for (const value of values) {
//     result.add(`'${value.module}'`);
//   }

//   return [...result];
// });

// export const exports = computed<string[] | undefined>(() => {
//   const values = selectedNode.value?.data?.data?.exports;

//   if (values === undefined || values.length === 0 || payload.value === undefined) return;

//   const result = new Set<string>();

//   for (const value of values) {
//     result.add(`'${value.name}'`);
//   }

//   return [...result];
// });

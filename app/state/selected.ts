import type { FileNode } from '~~/shared/types';
import type { HierarchyPointNode } from 'd3-hierarchy';

import { computed, shallowRef } from 'vue';

import { payload } from '~/composables/socket.js';

export const selectedNode = shallowRef<HierarchyPointNode<FileNode>>();

export const selectedSpecs = computed(() => {
  if (!selectedNode.value) return;

  const { id, name, parentPath } = selectedNode.value.data;

  return {
    id,
    name,
    parentPath,
  };
});

export const imports = computed<string[] | undefined>(() => {
  const values = selectedNode.value?.data?.data?.imports;

  if (values === undefined || values.length === 0 || payload.value === undefined) return;

  const result = new Set<string>();

  for (const value of values) {
    result.add(`'${value.module}'`);
  }

  return [...result];
});

export const exports = computed<string[] | undefined>(() => {
  const values = selectedNode.value?.data?.data?.exports;

  if (values === undefined || values.length === 0 || payload.value === undefined) return;

  const result = new Set<string>();

  for (const value of values) {
    result.add(`'${value.name}'`);
  }

  return [...result];
});

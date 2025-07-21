<script setup lang="ts">
import type { FileNode } from '~~/shared/types.js';
import type { HierarchyPointNode } from 'd3-hierarchy';

import { useElementHover } from '@vueuse/core';
import { computed } from 'vue';

import { selectedNode } from '~/state/selected.js';

const { node } = defineProps<{
  node: HierarchyPointNode<FileNode>;
}>();

const elementRef = useTemplateRef<HTMLDivElement>('elementRef');

const icon = 'tabler:file';

const isGraphNode = Boolean(node.data.data);
const isHovered = useElementHover(elementRef);

const color = computed(() => {
  if (!isGraphNode) return 'text-neutral-500';

  return isHovered.value
    ? 'text-neutral-50'
    : 'text-neutral-200';
});

const bg = computed(() => {
  if (!isGraphNode) return '';

  return isHovered.value
    ? 'bg-neutral-800'
    : 'bg-neutral-900';
});

const border = computed(() => {
  if (!isGraphNode) return '';

  return isHovered.value
    ? ['border', 'border-neutral-700']
    : ['border', 'border-neutral-800'];
});

function onClick() {
  if (!isGraphNode) return;

  selectedNode.value = node as HierarchyPointNode<FileNode>;
  // console.log(selectedNode.value);
}
</script>

<template>
  <div
    ref="elementRef"
    :style="{ left: `${node.x}px`, top: `${node.y}px` }"
    class="absolute h-10 px-2 flex items-center gap-1.5 rounded-md"
    :class="[color, bg, ...border]"
    @click="onClick"
  >
    <Icon
      class="w-5 h-5 mt-1"
      :name="icon"
      size="20"
    />
    <span>{{ node.data.name }}</span>
  </div>
</template>

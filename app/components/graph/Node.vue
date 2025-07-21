<script setup lang="ts">
import type { TreeNode } from '~~/shared/types.js';
import type { HierarchyPointNode } from 'd3-hierarchy';

const { node } = defineProps<{
  node: HierarchyPointNode<TreeNode>;
}>();

const icon = node.data.type === 'file' ? 'tabler:file' : 'tabler:folder-open';

const color = (node.data.type === 'dir')
  ? 'text-neutral-300'
  : node.data.data
    ? 'text-text-neutral-50'
    : 'text-neutral-500';
</script>

<template>
  <div
    class="flex items-center-safe gap-1.5"
    :style="{
      position: 'absolute',
      left: `${node.x}px`,
      top: `${node.y}px`,
    }"
  >
    <Icon
      :name="icon"
      size="20"
      :class="color"
    />
    <span :class="color">{{ node.data.name }}</span>
  </div>
</template>

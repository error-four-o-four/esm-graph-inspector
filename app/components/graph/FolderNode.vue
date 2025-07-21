<script setup lang="ts">
import type { FolderNode } from '~~/shared/types.js';
import type { HierarchyPointNode } from 'd3-hierarchy';

const { node } = defineProps<{
  node: HierarchyPointNode<FolderNode>;
}>();

const elementRef = useTemplateRef<HTMLDivElement>('elementRef');

const icon = 'tabler:folder-open';
const color = 'text-neutral-300';

// @todo
const nodeHeight = 48;

const nextFolderNode = getNextSibling(node) || getNextSibling(node.parent);

const lineHeight = nextFolderNode ? nextFolderNode.y - node.y - nodeHeight : 0;

function getNextSibling(node: HierarchyPointNode<FolderNode> | null) {
  if (!node) return;

  if (!node.parent || !node.parent.children) return undefined;

  return node.parent.children[node.parent.children.indexOf(node) + 1];
}
</script>

<template>
  <div
    class="absolute"
    :class="[color]"
    :style="{ left: `${node.x}px`, top: `${node.y}px` }"
  >
    <div
      ref="elementRef"
      class="h-8 flex gap-1.5"
    >
      <Icon
        class="w-5 h-5 mt-1"
        :name="icon"
        size="20"
      />
      <span>{{ node.data.name }}</span>
    </div>
    <svg
      class="absolute pointer-events-none left-2"
      width="2"
      :height="lineHeight"
    >
      <line
        x1="0"
        y1="0"
        x2="0"
        :y2="lineHeight"
        fill="none"
        class="stroke-neutral-800 stroke-2"
      />
    </svg>
  </div>
</template>

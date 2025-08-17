<script setup lang="ts">
import type { FolderData } from '~~/shared/types/data.js';

import { computed } from 'vue';

import { offsetsX, offsetsY } from '~/composables/useTreeOffsets.js';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH, FOLDER_SPACING_X } from '~/lib/tree-offsets.js';

const { specs } = defineProps<{ specs: FolderData }>();

const deltaY = 0.5 * DEFAULT_NODE_HEIGHT;

const lastFolderId = computed(() => specs.folderIds[specs.folderIds.length - 1]);

const sourceX = computed(() => offsetsX[specs.depth].value + DEFAULT_NODE_WIDTH);
const sourceY = computed(() => offsetsY[specs.id].value + deltaY);

const targetX = offsetsX[specs.depth + 1];
const targetY = computed(() => offsetsY[lastFolderId.value].value + deltaY);

const linkX = computed(() => targetX.value - 0.5 * FOLDER_SPACING_X);
const linkY = computed(() => specs.folderIds.map(folderId => offsetsY[folderId].value + deltaY));
</script>

<template>
  <g>
    <line :x1="sourceX" :y1="sourceY" :x2="linkX" :y2="sourceY" />
    <line :x1="linkX" :y1="sourceY" :x2="linkX" :y2="targetY" />
    <template v-for="y, i of linkY" :key="`link-${i}`">
      <line :x1="linkX" :y1="y" :x2="targetX" :y2="y" />
    </template>
  </g>
</template>

<script setup lang="ts">
import type { FolderLinkData } from '~~/shared/types/data.js';

import { computed } from 'vue';

import { offsetsX, offsetsY } from '~/composables/useTreeOffsets.js';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH, FOLDER_SPACING_X } from '~/lib/tree-offsets.js';

// @todo draw one line from top to bottom => performance
const { source, target } = defineProps<FolderLinkData>();

const deltaY = 0.5 * DEFAULT_NODE_HEIGHT;

const sourceX = computed(() => offsetsX[source.depth].value + DEFAULT_NODE_WIDTH);
const sourceY = computed(() => offsetsY[source.id].value + deltaY);

const targetX = offsetsX[target.depth];
const targetY = computed(() => offsetsY[target.id].value + deltaY);

const linkX = computed(() => targetX.value - 0.5 * FOLDER_SPACING_X);
</script>

<template>
  <g :id="id">
    <line v-if="initial" :x1="sourceX" :y1="sourceY" :x2="linkX" :y2="sourceY" />
    <line :x1="linkX" :y1="sourceY" :x2="linkX" :y2="sourceY" />
    <line :x1="linkX" :y1="sourceY" :x2="linkX" :y2="targetY" />
    <line :x1="linkX" :y1="targetY" :x2="targetX" :y2="targetY" />
  </g>
</template>

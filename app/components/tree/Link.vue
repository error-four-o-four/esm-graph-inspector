<script setup lang="ts">
import type { FolderLinkData } from '~~/shared/types/data.js';

import { computed } from 'vue';

import { offsetX, offsetY } from '~/composables/useTreeOffsets.js';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from '~/lib/tree-offsets.js';

const { source, target } = defineProps<FolderLinkData>();

const deltaY = 0.5 * DEFAULT_NODE_HEIGHT;

const sourceX = computed(() => offsetX[source.depth].value + DEFAULT_NODE_WIDTH);
const sourceY = computed(() => offsetY[source.id].value + deltaY);

const targetX = offsetX[target.depth];
const targetY = computed(() => offsetY[target.id].value + deltaY);

const linkX = computed(() => targetX.value - 0.1 * DEFAULT_NODE_WIDTH);
</script>

<template>
  <g :id="id">
    <line v-if="initial" :x1="sourceX" :y1="sourceY" :x2="linkX" :y2="sourceY" />
    <line :x1="linkX" :y1="sourceY" :x2="linkX" :y2="sourceY" />
    <line :x1="linkX" :y1="sourceY" :x2="linkX" :y2="targetY" />
    <line :x1="linkX" :y1="targetY" :x2="targetX" :y2="targetY" />
  </g>
</template>

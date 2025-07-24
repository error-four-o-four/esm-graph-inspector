<script setup lang="ts">
import { computed } from 'vue';

import type { GraphLinkData } from '~/types/tree.js';

import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from '~/composables/layout.js';
import useNodeOffsets from '~/composables/useNodeOffsets.js';

const { id, source, target, bundle } = defineProps<GraphLinkData>();

const { fileOffset } = useNodeOffsets();

const sourceFileOffset = fileOffset[source.file.id];
const targetFileOffset = fileOffset[target.file.id];

const marginX = 6;
// different y for inbound outbound
const marginInboundY = -0.2 * DEFAULT_NODE_HEIGHT;
const marginOutboundY = 0.05 * DEFAULT_NODE_HEIGHT;

const directionXOutbound = source.folder.depth > target.folder.depth ? -1 : 1; // to left : right
const directionXInbound = source.folder.depth >= target.folder.depth ? -1 : 1;

// source coords
const sourceX = computed(() => {
  return sourceFileOffset.x.value + (
    (directionXOutbound > 0)
      ? sourceFileOffset.width + marginX
      : -marginX
  );
});

const sourceY = computed(() => sourceFileOffset.y.value + marginOutboundY);

// target coords
const targetX = computed(() => {
  return targetFileOffset.x.value + (
    (directionXInbound > 0)
      ? -marginX
      : targetFileOffset.width + marginX
  );
});

const targetY = computed(() => targetFileOffset.y.value + marginInboundY);

const directionY = sourceY.value > targetY.value ? -1 : 1; // top top : bottom
const curveRadius = Math.min(0.5 * Math.abs(targetY.value - sourceY.value), 0.5 * DEFAULT_NODE_HEIGHT);

// @todo nested level > 1
const bundleDelta = 6 * bundle;
const bundleX = computed(() => {
  return (directionXOutbound > 0
    ? sourceFileOffset.x.value
    : targetFileOffset.x.value
  ) + DEFAULT_NODE_WIDTH + bundleDelta; // inside of folder
});

function createPath() {
  // 1 => cw - 0 => ccw
  const sweepOutbound = directionXOutbound > 0
    ? directionY > 0 ? 1 : 0
    : directionY > 0 ? 0 : 1;

  const sweepInbound = directionXInbound > 0
    ? directionY > 0 ? 0 : 1
    : directionY > 0 ? 1 : 0;

  return [
    `M${sourceX.value},${sourceY.value}`,
    `L${bundleX.value - directionXOutbound * curveRadius},${sourceY.value}`,
    `A${curveRadius},${curveRadius} 0 0 ${sweepOutbound} ${bundleX.value},${sourceY.value + directionY * curveRadius}`,
    `L${bundleX.value},${targetY.value - directionY * curveRadius}`,
    `A${curveRadius},${curveRadius} 0 0 ${sweepInbound} ${bundleX.value + directionXInbound * curveRadius},${targetY.value}`,
    `L${targetX.value},${targetY.value}`,
  ].join('\n');
}

function createArrowPath() {
  const size = 3;

  return `
  M${targetX.value - directionXInbound * size}, ${targetY.value - size}
  L${targetX.value}, ${targetY.value}
  L${targetX.value - directionXInbound * size}, ${targetY.value + size}
  `;
}

const color = `hsl(${60 + (bundle * 30) % 360}, 40%, 40%)`;
</script>

<template>
  <g :id="id" :stroke="color" :fill="color">
    <circle :cx="sourceX + 2" :cy="sourceY" r="2" stroke="none" />
    <path :d="createPath()" fill="none" />
    <!-- @todo overlapping paths (!) -->
    <path :d="createArrowPath()" fill="none" />
  </g>
  <!-- <text :x="sourceX" :y="sourceY" fill="#ccc" stroke="none" class="text-xs">
    {{ specs.sourceFileId }}
  </text> -->
</template>

<script setup lang="ts">
import type { ModuleGraphData, ModuleGraphLinkData } from '~~/shared/types/data.js';

import { computed } from 'vue';

import { useFileOffsets } from '~/composables/useTreeDimensions.js';
import {
  BUNDLE_SPACING_X,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  FOLDER_SPACING_X,
  GRAPH_LINK_MARGIN_X,
} from '~/lib/tree-offsets.js';

type Props = ModuleGraphLinkData & {
  levels: ModuleGraphData['levels'];
};

const props = defineProps<Props>();

const sourceFileOffset = useFileOffsets(props.source.file);
const targetFileOffset = useFileOffsets(props.target.file);

// source coords
const sourceX = computed(() => {
  // choose left or right side depending on direction x
  const value = (props.direction.x >= 0)
    ? sourceFileOffset.width + GRAPH_LINK_MARGIN_X
    : -GRAPH_LINK_MARGIN_X;

  return sourceFileOffset.x.value + value;
});

const sourceY = computed(() => {
  // different y for source outbound
  // @todo doublecheck
  const value = (props.source.hasInbound)
    ? 0.05 * DEFAULT_NODE_HEIGHT
    : -0.1 * DEFAULT_NODE_HEIGHT;

  return sourceFileOffset.y.value + value;
});

// target coords
const targetX = computed(() => {
  // choose left or right side depending on height && direction x
  const value = (props.direction.x <= 0)
    ? targetFileOffset.width + GRAPH_LINK_MARGIN_X
    : -GRAPH_LINK_MARGIN_X + 3; // consider source circle radius

  return targetFileOffset.x.value + value;
});

const targetY = computed(() => {
  // different y for target inbound
  const value = (props.target.hasOutbound)
    ? -0.2 * DEFAULT_NODE_HEIGHT
    : -0.1 * DEFAULT_NODE_HEIGHT;

  return targetFileOffset.y.value + value;
});

const pathLink = computed(() => {
  const bundleX = calcDeltaX();
  const deltaY = targetY.value - sourceY.value;
  const curveRadius = Math.min(0.5 * Math.abs(deltaY), 0.25 * DEFAULT_NODE_HEIGHT);

  const dirXOutbound = props.direction.x >= 0 ? 1 : -1;
  const dirXInbound = props.direction.x > 0 ? 1 : -1;
  const dirY = Math.sign(deltaY);

  // 1 => cw - 0 => ccw
  // const sweepOutbound = props.direction.x >= 0
  //   ? deltaY > 0 ? 1 : 0
  //   : deltaY > 0 ? 0 : 1;

  // const sweepInbound = props.direction.x > 0
  //   ? deltaY > 0 ? 0 : 1
  //   : deltaY > 0 ? 1 : 0;

  return [
    `M${sourceX.value},${sourceY.value}`,
    `L${bundleX - dirXOutbound * curveRadius},${sourceY.value}`,
    `L${bundleX},${sourceY.value + dirY * curveRadius}`,
    // `A${curveRadius},${curveRadius} 0 0 ${sweepOutbound} ${deltaX},${sourceY.value + deltaY * curveRadius}`,
    `L${bundleX},${targetY.value - dirY * curveRadius}`,
    // `A${curveRadius},${curveRadius} 0 0 ${sweepInbound} ${deltaX + dirX * curveRadius},${targetY.value}`,
    `${bundleX + dirXInbound * curveRadius},${targetY.value}`,
    `L${targetX.value},${targetY.value}`,
  ].join('\n');
});

function calcDeltaX() {
  // @todo props.height > 1 (!)
  const y = DEFAULT_NODE_WIDTH + 0.25 * FOLDER_SPACING_X + (
    (props.direction.x >= 0)
      ? sourceFileOffset.x.value
      : targetFileOffset.x.value
  );

  const depth = (props.direction.x >= 0)
    ? props.source.folder.depth
    : props.target.folder.depth;

  const index = props.levels[depth].indexOf(props.bundle.id);

  if (index < 0) {
    console.warn('Nope', props.id, props.folderIds);
    return y;
  }

  return y + index * BUNDLE_SPACING_X;
}

const pathArrow = computed(() => {
  const size = 3;
  const dir = props.direction.x > 0 ? 1 : -1;

  return `
  M${targetX.value - dir * size}, ${targetY.value - size}
  L${targetX.value}, ${targetY.value}
  L${targetX.value - dir * size}, ${targetY.value + size}
  `;
});

// function createPath() {
//   // 1 => cw - 0 => ccw
//   const sweepOutbound = directionXOutbound > 0
//     ? deltaY.value > 0 ? 1 : 0
//     : deltaY.value > 0 ? 0 : 1;

//   const sweepInbound = directionXInbound > 0
//     ? deltaY.value > 0 ? 0 : 1
//     : deltaY.value > 0 ? 1 : 0;

//   return [
//     `M${sourceX.value},${sourceY.value}`,
//     `L${bundleX.value - directionXOutbound * curveRadius},${sourceY.value}`,
//     `A${curveRadius},${curveRadius} 0 0 ${sweepOutbound} ${bundleX.value},${sourceY.value + deltaY.value * curveRadius}`,
//     `L${bundleX.value},${targetY.value - deltaY.value * curveRadius}`,
//     `A${curveRadius},${curveRadius} 0 0 ${sweepInbound} ${bundleX.value + directionXInbound * curveRadius},${targetY.value}`,
//     `L${targetX.value},${targetY.value}`,
//   ].join('\n');
// }

const color = `hsl(${60 + (props.bundle.index * 30) % 360}, 40%, 40%)`;
</script>

<template>
  <g :id="id" :stroke="color" :fill="color">
    <circle :cx="sourceX + 2" :cy="sourceY" r="3" stroke="none" />
    <path
      :d="pathLink"
      fill="none"
      stroke-dasharray="8 3"
    />
    <!-- @todo overlapping paths (!) -->
    <path
      :d="pathArrow"
      fill="none"
      stroke-width="2"
      stroke-linecap="butt"
      stroke-linejoin="round"
    />
  </g>
  <!-- <text :x="sourceX" :y="sourceY" fill="#ccc" stroke="none" class="text-xs">
    {{ specs.sourceFileId }}
  </text> -->
</template>

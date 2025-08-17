import type { UseTransitionOptions } from '@vueuse/core';

export const DEFAULT_NODE_WIDTH = 180;
export const DEFAULT_NODE_HEIGHT = 32;

export const TREE_PADDING_X = 0.5 * DEFAULT_NODE_WIDTH;
export const TREE_PADDING_Y = 2 * DEFAULT_NODE_HEIGHT;

export const FOLDER_SPACING_X = 0.25 * DEFAULT_NODE_WIDTH;
export const FOLDER_SPACING_Y = 0.5 * DEFAULT_NODE_HEIGHT;

export const BUNDLE_SPACING_X = 8;
export const BUNDLE_SPACING_Y = 4;

export const GRAPH_LINK_MARGIN_X = 6;

// based on hierarchy depth index
export const calcOffsetX = (i: number) => Math.floor(TREE_PADDING_X + i * (DEFAULT_NODE_WIDTH + FOLDER_SPACING_X));

// based on hierarchy tree index
export const calcOffsetY = (i: number) => Math.floor(TREE_PADDING_Y + i * (DEFAULT_NODE_HEIGHT + FOLDER_SPACING_Y));

export const transitionDefaults: UseTransitionOptions = {
  duration: 200,
  transition: [0.25, 0.1, 0.25, 1.0],
};

export const DEFAULT_NODE_WIDTH = 180;
export const DEFAULT_NODE_HEIGHT = 32;

export const PADDING_X = 0.5 * DEFAULT_NODE_WIDTH;
export const PADDING_Y = 2 * DEFAULT_NODE_HEIGHT;

export const SPACING_X = 0.375 * DEFAULT_NODE_WIDTH;
export const SPACING_Y = 0.75 * DEFAULT_NODE_HEIGHT;

// based on hierarchy depth index
export const calcOffsetX = (i: number) => Math.floor(PADDING_X + i * (DEFAULT_NODE_WIDTH + SPACING_X));

// based on hierarchy tree index
export const calcOffsetY = (i: number) => Math.floor(PADDING_Y + i * (DEFAULT_NODE_HEIGHT + SPACING_Y));

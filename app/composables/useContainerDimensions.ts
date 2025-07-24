import type { FileTreeData, FolderID } from '~~/shared/types.js';

import { ref } from 'vue';

import { calcOffsetX, PADDING_X, PADDING_Y } from './layout.js';
import useLayoutOffsets from './useLayoutOffsets.js';
import useNodeOffsets from './useNodeOffsets.js';

const width = ref(window.innerWidth);
const height = ref(window.innerHeight);

const { offsetYBase } = useLayoutOffsets();
const { folderHeights } = useNodeOffsets();

// @todo consider bundles per level
// store filetree depth
let folderIds: FolderID[];

function initContainerDimensions(data: FileTreeData) {
  folderIds = data.levels.map(level => level[level.length - 1]);
  updateContainerDimensions();
}

function updateContainerDimensions() {
  // @todo consider sidebar width
  width.value = Math.max(
    window.innerWidth,
    calcOffsetX(folderIds.length) + 2 * PADDING_X,
  );

  height.value = folderIds.reduce((max, id) => {
    const h = offsetYBase[id].value + folderHeights[id] + PADDING_Y;
    return h > max ? h : max;
  }, window.innerHeight);
}

export default function useContainerDimensions() {
  return {
    width,
    height,
    initContainerDimensions,
    updateContainerDimensions,
  };
}

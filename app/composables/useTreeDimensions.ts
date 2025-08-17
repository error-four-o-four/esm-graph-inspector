import type { FileData, FileID, FolderID } from '~~/shared/types/data.js';

import { ref } from 'vue';

import type { FolderInstance } from '~/types/components.js';

import { DEFAULT_NODE_WIDTH, FOLDER_SPACING_Y, TREE_PADDING_X, TREE_PADDING_Y } from '../lib/tree-offsets.js';
import { folderIdsAtBottom, offsetsX, offsetsXBase, offsetsY, offsetsYBase } from './useTreeOffsets.js';

export const dimensions = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const folderHeights: Record<FolderID, number> = {};

// const fileWidths: Record<FileID, number> = {};
// const fileOffsetsTop: Record<FileID, number> = {};

// @todo performance !
const fileOffsets: Record<FileID, {
  x: ComputedRef<number>;
  y: ComputedRef<number>;
  width: number;
}> = {};

export function useFileOffsets(file: FileData) {
  // const width = fileWidths[file.id];
  // const top = fileOffsetsTop[file.id];

  // const x = computed(() => offsetsX[file.depth].value)
  // const y = computed(() => offsetsY[file.parent].value + top);

  return fileOffsets[file.id];
}

/**
 * Used to indicate that the Folder Components are mounted.
 */
export const isInitialized = ref(false);

/**
 * Depends on the mounted Folder Components. Sets `useTreeDimensions#folderHeights` when initialized.
 * Sets `isInitialized`. Calls `updateTreeDimensions`
 * @param folderRefs - the component refs
 */
export function initTreeDimensions(folderRefs: FolderInstance[]) {
  initFolderHeights(folderRefs);

  isInitialized.value = true;
}

function initFolderHeights(folderRefs: FolderInstance[]) {
  for (const folder of folderRefs) {
    const { id: folderId, depth } = folder.$props;

    if (!(folder.$el instanceof HTMLDivElement)) throw new Error('Nope');

    const ulEl = folder.$el.querySelector('ul');

    if (!ulEl) throw new Error('Nope');

    // set folder height
    folderHeights[folderId] = ulEl.offsetTop + ulEl.offsetHeight + FOLDER_SPACING_Y;

    // use li elements to set file offsets
    const liEls = ulEl.querySelectorAll('li');

    for (const liEl of liEls) {
      const btnEl = liEl.querySelector('button');

      if (!btnEl) throw new Error('Nope');

      const levelOffsetRef = offsetsX[depth];
      const folderOffsetRef = offsetsY[folderId];

      const { offsetLeft, offsetTop, offsetHeight } = liEl;
      const { offsetWidth } = btnEl;

      // fileWidths[liEl.id] = offsetWidth;
      // fileOffsetsTop[liEl.id] = offsetTop + 0.5 * offsetHeight;

      fileOffsets[liEl.id] = {
        x: computed(() => levelOffsetRef.value + offsetLeft),
        y: computed(() => folderOffsetRef.value + offsetTop + 0.5 * offsetHeight),
        width: offsetWidth,
      };
    }
  }
}

export function resetTreeDimensions() {
  // @todo
  // consider to set dimensions to window.innerWidth & .innerHeight
  // doublecheck neccessity
  // folderHeights = {}
}

export function updateTreeDimensions() {
  // @todo consider sidebar width
  // @todo call on watched graphdata change
  dimensions.width = Math.max(
    window.innerWidth,
    offsetsXBase[offsetsXBase.length - 1].value + DEFAULT_NODE_WIDTH + 2 * TREE_PADDING_X,
  );

  dimensions.height = folderIdsAtBottom.reduce((max, id) => {
    const h = offsetsYBase[id].value + folderHeights[id] + TREE_PADDING_Y;
    return h > max ? h : max;
  }, window.innerHeight);
}

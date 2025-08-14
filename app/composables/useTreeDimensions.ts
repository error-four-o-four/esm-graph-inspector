import type { FileID, FileTreeData, FolderID } from '~~/shared/types/data.js';

import { ref } from 'vue';

import type { FolderInstance } from '~/types/components.js';

import { calcOffsetX, PADDING_X, PADDING_Y, SPACING_Y } from '../lib/tree-offsets.js';
import { offsetX, offsetY, offsetYBase } from './useTreeOffsets.js';

export const dimensions = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
});

// reference the last folder element per level
// to calculate the max height
// @todo consider bundles per level
let folderIds: FolderID[];

export const folderHeights: Record<FolderID, number> = {};

export const fileOffsets: Record<FileID, {
  x: ComputedRef<number>;
  y: ComputedRef<number>;
  width: number;
}> = {};

export const isInitialized = ref(false);

export function initTreeDimensions(data: FileTreeData, folderRefs: FolderInstance[]) {
  folderIds = data.levels.map(level => level[level.length - 1]);

  initFolderHeights(folderRefs);
  updateTreeDimensions();

  isInitialized.value = true;
}

function initFolderHeights(folderRefs: FolderInstance[]) {
  for (const folder of folderRefs) {
    const { id: folderId, depth } = folder.$props;

    if (!(folder.$el instanceof HTMLDivElement)) throw new Error('Nope');

    const ulEl = folder.$el.querySelector('ul');

    if (!ulEl) throw new Error('Nope');

    // set folder height
    folderHeights[folderId] = ulEl.offsetTop + ulEl.offsetHeight + SPACING_Y;

    // use li elements to set file offsets
    const liEls = ulEl.querySelectorAll('li');

    for (const liEl of liEls) {
      const btnEl = liEl.querySelector('button');

      if (!btnEl) throw new Error('Nope');

      const levelOffsetRef = offsetX[depth];
      const folderOffsetRef = offsetY[folderId];

      const { offsetLeft, offsetTop, offsetHeight } = liEl;
      const { offsetWidth } = btnEl;

      fileOffsets[liEl.id] = {
        x: computed(() => levelOffsetRef.value + offsetLeft),
        y: computed(() => folderOffsetRef.value + offsetTop + 0.5 * offsetHeight),
        width: offsetWidth,
      };
    }
  }
}

export function updateTreeDimensions() {
  // @todo consider sidebar width
  dimensions.width = Math.max(
    window.innerWidth,
    calcOffsetX(folderIds.length) + 2 * PADDING_X,
  );

  dimensions.height = folderIds.reduce((max, id) => {
    const h = offsetYBase[id].value + folderHeights[id] + PADDING_Y;
    return h > max ? h : max;
  }, window.innerHeight);
}

// export default function useLayoutDimensions() {
//   return {
//     dimensions,
//     fileOffsets,
//     folderHeights,
//     initLayoutDimensions,
//   };
// }

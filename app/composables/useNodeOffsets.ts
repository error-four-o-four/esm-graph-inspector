import type { FileID, FolderID } from '~~/shared/types/data.js';

import type { FolderInstance } from '~/types/components.js';

import { SPACING_Y } from '~/composables/layout.js';

import useLayoutOffsets from './useLayoutOffsets.js';

const { offsetX, offsetY } = useLayoutOffsets();

const folderHeights: Record<FolderID, number> = {};

const fileOffset: Record<FileID, {
  x: ComputedRef<number>;
  y: ComputedRef<number>;
  width: number;
}> = {};

function initNodeOffsets(folderRefs: FolderInstance[]) {
  // console.log('calling initNodeOffsets');

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

      fileOffset[liEl.id] = {
        x: computed(() => levelOffsetRef.value + offsetLeft),
        y: computed(() => folderOffsetRef.value + offsetTop + 0.5 * offsetHeight),
        width: offsetWidth,
      };
    }
  }

  // console.log('called initNodeOffsets');
  // console.log(folderHeights, fileOffset);
}

export default function useNodeOffsets() {
  return {
    initNodeOffsets,
    fileOffset,
    folderHeights,
  };
}

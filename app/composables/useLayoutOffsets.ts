import type { UseTransitionOptions } from '@vueuse/core';
import type { FileTreeData, FolderID } from '~~/shared/types/data.js';
import type { ComputedRef, Ref } from 'vue';

import { useTransition } from '@vueuse/core';
import { ref } from 'vue';

import { calcOffsetX, calcOffsetY } from '~/composables/layout.js';

const transitionDefaults: UseTransitionOptions = {
  duration: 200,
  transition: [0.25, 0.1, 0.25, 1.0],
};

// @todo
// based on hierarchy depth index
const offsetXBase: Ref<number>[] = [];
const offsetX: ComputedRef<number>[] = [];

// based on hierarchy tree index
const offsetYInitial: Record<FolderID, number> = {};
const offsetYBase: Record<FolderID, Ref<number>> = {};
const offsetY: Record<FolderID, ComputedRef<number>> = {};

const offsetYUpdateQueue = new Map<FolderID, number>();

function initLayoutOffsets(data: FileTreeData) {
  for (let i = 0; i < data.levels.length; i += 1) {
    offsetXBase[i] = ref(calcOffsetX(i));
    offsetX[i] = useTransition(offsetXBase[i], transitionDefaults);
  }

  for (const folder of Object.values(data.folders)) {
    const y = calcOffsetY(folder.index);

    offsetYInitial[folder.id] = y;
    offsetYBase[folder.id] = ref(y);
    offsetY[folder.id] = useTransition(offsetYBase[folder.id], transitionDefaults);
  }
}

function resetLayoutOffsets() {
  for (const [folderId, offsetY] of Object.entries(offsetYInitial)) {
    offsetYBase[folderId].value = offsetY;
  }
}

function enqueueOffsetYUpdate(
  folderId: FolderID,
  deltaY: number,
) {
  const y = offsetYUpdateQueue.get(folderId) || offsetY[folderId].value;
  offsetYUpdateQueue.set(folderId, y + deltaY);
}

function dequeueOffsetYUpdate() {
  for (const [id, y] of offsetYUpdateQueue.entries()) {
    offsetYBase[id].value = y;
  }

  offsetYUpdateQueue.clear();
}

export default function useLayoutOffsets() {
  return {
    offsetX,
    offsetY,
    offsetYBase,
    offsetYInitial,
    initLayoutOffsets,
    resetLayoutOffsets,
    enqueueOffsetYUpdate,
    dequeueOffsetYUpdate,
  };
}

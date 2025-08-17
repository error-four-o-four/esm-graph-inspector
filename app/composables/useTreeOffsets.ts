import type { FileTreeData, FolderData, FolderID, ModuleGraphData } from '~~/shared/types/data.js';
import type { ComputedRef, Ref } from 'vue';

import { useTransition } from '@vueuse/core';
import { ref } from 'vue';

import {
  BUNDLE_SPACING_X,
  calcOffsetX,
  calcOffsetY,
  FOLDER_SPACING_X,
  transitionDefaults,
} from '~/lib/tree-offsets.js';

// @todo => composable useTranstioning
export const isTransitioning = ref(false);

// store and reference the last folder element at the bottom of a level
// to calculate the max height
// @todo => computed value ?
export const folderIdsAtBottom: FolderID[] = [];

/** @note based on hierarchy tree folder depth */
const offsetsXInitial: number[] = [];
export const offsetsXBase: Ref<number>[] = [];
export const offsetsX: ComputedRef<number>[] = [];

/** @note based on hierarchy tree folder index */
export const offsetsYInitial: Record<FolderID, number> = {};
export const offsetsYBase: Record<FolderID, Ref<number>> = {};
export const offsetsY: Record<FolderID, ComputedRef<number>> = {};

const offsetYUpdateQueue = new Map<FolderID, number>();

/**
 * Uses `FolderData.depth` and `FolderData.index` to calculate horizontal and vertical offsets.
 * Sets `offsetsX` & `offsetsY`.
 * @param data - the FileTreeData
 */
export function initTreeOffsets(data: FileTreeData) {
  const onStarted = () => {
    if (!isTransitioning.value) isTransitioning.value = true;
  };

  const onFinished = () => {
    if (isTransitioning.value) isTransitioning.value = false;
  };

  folderIdsAtBottom.length = 0;

  for (const level of data.levels) {
    folderIdsAtBottom.push(level[level.length - 1]);
  }

  for (let i = 0; i < data.levels.length; i += 1) {
    const x = calcOffsetX(i);
    offsetsXInitial[i] = x;
    offsetsXBase[i] = ref(x);

    if (i === data.levels.length - 1) {
      // applies only to the last elements => performance
      offsetsX[i] = useTransition(offsetsXBase[i], {
        ...transitionDefaults,
        onStarted,
        onFinished,
      });
    } else {
      offsetsX[i] = useTransition(offsetsXBase[i], transitionDefaults);
    }
  }

  for (const folder of Object.values(data.folders)) {
    const y = calcOffsetY(folder.index);

    offsetsYInitial[folder.id] = y;
    offsetsYBase[folder.id] = ref(y);

    if (folderIdsAtBottom.includes(folder.id)) {
      // applies only to the last elements => performance
      offsetsY[folder.id] = useTransition(offsetsYBase[folder.id], {
        ...transitionDefaults,
        onStarted,
        onFinished,
      });
    } else {
      offsetsY[folder.id] = useTransition(offsetsYBase[folder.id], transitionDefaults);
    }
  }
}

/**
 * Resets `offsetsX` & `offsetsY` to initial values.
 */
export function resetTreeOffsets() {
  for (const level of offsetsXInitial) {
    offsetsXBase[level].value = offsetsXInitial[level];
  }

  for (const [folderId, offsetY] of Object.entries(offsetsYInitial)) {
    offsetsYBase[folderId].value = offsetY;
  }
}

export function updateToggledFolderOffsets(
  collapse: boolean,
  toggledIds: FolderID[],
  tree: FileTreeData,
  graph?: ModuleGraphData,
) {
  if (graph) updateOffsetX(graph);

  const folders = getFolderData(tree, toggledIds);
  const others = getOtherFolderData(tree, folders[0]);

  for (const folder of folders) {
    // @todo => useTreeOffsets
    // to avoid calling getFolderData etc every time
    updateOffsetY(others, folder, collapse);
  }

  dequeueOffsetYUpdate();
}

function getFolderData(tree: FileTreeData, folderIds: FolderID[]) {
  const folders = folderIds.map(folderId => tree.folders[folderId]);

  return (folders.length > 1)
    ? folders.sort((a, b) => a.index - b.index)
    : folders;
}

function getOtherFolderData(tree: FileTreeData, folder: FolderData) {
  return Object.values(tree.folders).slice(folder.index + 1);
}

/**
 * Counts bundles from `ModuleGraphData` and adds extra spacing for each bundle on each level.
 * @param data - the ModuleGraphData
 */
function updateOffsetX(data: ModuleGraphData) {
  const spacings = data.levels.map(level => level.length * BUNDLE_SPACING_X);

  let acc = 0;
  for (let level = 0; level < spacings.length - 1; level += 1) {
    acc += spacings[level] + 0.25 * FOLDER_SPACING_X;
    offsetsXBase[level + 1].value = offsetsXInitial[level + 1] + acc;
  }
}

function updateOffsetY(
  others: FolderData[],
  folder: FolderData,
  collapse: boolean,
) {
  const nextLevelSibling = others
    .filter(sibling => sibling.depth === folder.depth)
    .find(sibling => sibling.level === folder.level + 1);

  // console.log(folder.id, nextLevelSibling?.id);

  // // it's a node at the bottom
  if (!nextLevelSibling) return;

  // @todo additionally check delta offset to parent sibling (! oh noo)
  let deltaOffset = offsetsYInitial[folder.id] + folderHeights[folder.id] - offsetsYInitial[nextLevelSibling.id];

  // the space between the nodes is big enough
  if (deltaOffset < 0) return;

  if (collapse) deltaOffset *= -1;

  for (const sibling of others) {
    if (sibling.index < nextLevelSibling.index) continue;
    enqueueOffsetYUpdate(sibling.id, deltaOffset);
  }
}

/**
 * Accumulates calculated vertical offsets.
 * @param folderId - a folder identifier e.g. `./src/`
 * @param deltaY - the vertical offset which is added to or subtracted from offsetsY
 */
function enqueueOffsetYUpdate(
  folderId: FolderID,
  deltaY: number,
) {
  const y = offsetYUpdateQueue.get(folderId) || offsetsY[folderId].value;
  offsetYUpdateQueue.set(folderId, y + deltaY);
}

/**
 * Applies accumulated vertical offsets to trigger a redraw.
 */
function dequeueOffsetYUpdate() {
  for (const [id, y] of offsetYUpdateQueue.entries()) {
    offsetsYBase[id].value = y;
  }

  offsetYUpdateQueue.clear();
}

// @todo import and set for each Folder Component (?)
// export default function useLayoutOffsets() {
//   return {
//     offsetX,
//     offsetY,
//     offsetYBase,
//     offsetYInitial,
//     initLayoutOffsets,
//     resetLayoutOffsets,
//     enqueueOffsetYUpdate,
//     dequeueOffsetYUpdate,
//   };
// }

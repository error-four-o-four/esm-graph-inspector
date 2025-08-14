import type { FolderData, FolderID } from '~~/shared/types/data';

import { shallowRef } from 'vue';

import { folderHeights, isInitialized, updateTreeDimensions } from '~/composables/useTreeDimensions.js';
import { dequeueOffsetYUpdate, enqueueOffsetYUpdate } from '~/composables/useTreeOffsets.js';
import { graphData, treeData } from '~/state/data.js';

export const openedFolderIds = shallowRef<Set<FolderID>>(new Set());

export function addFolderIds(...folderIds: FolderID[]) {
  if (!isInitialized.value) throw new Error('Layout Dimensions aren\'t initialized yet');

  const toggledIds = folderIds.filter(folderId => !openedFolderIds.value.has(folderId));

  if (!toggledIds.length) return;

  openedFolderIds.value = new Set([...openedFolderIds.value, ...folderIds]);

  handleToggledFolders(toggledIds, false);
}

export function deleteFolderIds(...folderIds: FolderID[]) {
  if (!isInitialized.value) throw new Error('Layout Dimensions aren\'t initialized yet');

  const openedIds = [...openedFolderIds.value].filter(folderId => !folderIds.includes(folderId));
  const toggledIds = folderIds.filter(folderId => openedFolderIds.value.has(folderId));

  if (!toggledIds.length) return;

  openedFolderIds.value = new Set(openedIds);

  handleToggledFolders(toggledIds, true);
}

export function clearFolderIds() {
  const toggledIds = [...openedFolderIds.value];

  if (!toggledIds.length) return;

  openedFolderIds.value = new Set();

  // handleToggledFolders(toggledIds, true);
  // @todo await queue ??
}

function handleToggledFolders(folderIds: FolderID[], collapse: boolean) {
  const folders = getFolderData(folderIds);
  const others = getOtherFolderData(folders[0]);

  for (const folder of folders) {
    updateFolderOffset(others, folder, collapse);
  }

  dequeueOffsetYUpdate();
  updateTreeDimensions();
}

function getFolderData(folderIds: FolderID[]) {
  if (!treeData.value) throw new Error('No tree data');

  const folders = folderIds.map(folderId => treeData.value!.folders[folderId]);

  return (folders.length > 1)
    ? folders.sort((a, b) => a.index - b.index)
    : folders;
}

function getOtherFolderData(folder: FolderData) {
  if (!treeData.value) throw new Error('No tree data');

  return Object.values(treeData.value.folders).slice(folder.index + 1);
}

function updateFolderOffset(
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
  let deltaOffset = offsetYInitial[folder.id] + folderHeights[folder.id] - offsetYInitial[nextLevelSibling.id];

  // the space between the nodes is big enough
  if (deltaOffset < 0) return;

  if (collapse) deltaOffset *= -1;

  for (const sibling of others) {
    if (sibling.index < nextLevelSibling.index) continue;
    enqueueOffsetYUpdate(sibling.id, deltaOffset);
  }
}

watch(
  treeData,
  (next) => {
    if (!next) {
      // triggered file tree change
      clearFolderIds();
    }
  },
  {
    immediate: true,
  },
);

watch(
  graphData,
  (next) => {
    if (next) {
      // triggered module graph change
      addFolderIds(...next.folderIds);
    }
  },
  {
    immediate: true,
  },
);

// export default function useTreeFolders() {
//   // onMounted(() => console.log(folderRefsKey));

//   return {
//     openedFolderIds,
//     addFolderIds,
//     deleteFolderIds,
//     clearFolderIds,
//   };
// }

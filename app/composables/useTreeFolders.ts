import type { FolderID } from '~~/shared/types/data';

import { shallowRef } from 'vue';

import { isInitialized } from '~/composables/useTreeDimensions.js';

export const openedFolderIds = shallowRef<Set<FolderID>>(new Set());

export function addFolderIds(...folderIds: FolderID[]): FolderID[] {
  if (!isInitialized.value) throw new Error('Layout Dimensions aren\'t initialized yet');

  const toggledIds = folderIds.filter(folderId => !openedFolderIds.value.has(folderId));

  if (!toggledIds.length) return [];

  openedFolderIds.value = new Set([...openedFolderIds.value, ...folderIds]);

  return toggledIds;
}

export function deleteFolderIds(...folderIds: FolderID[]): FolderID[] {
  if (!isInitialized.value) throw new Error('Layout Dimensions aren\'t initialized yet');

  const openedIds = [...openedFolderIds.value].filter(folderId => !folderIds.includes(folderId));
  const toggledIds = folderIds.filter(folderId => openedFolderIds.value.has(folderId));

  if (!toggledIds.length) return [];

  openedFolderIds.value = new Set(openedIds);

  return toggledIds;
}

export function clearFolderIds() {
  const toggledIds = [...openedFolderIds.value];

  if (!toggledIds.length) return;

  openedFolderIds.value = new Set();
}

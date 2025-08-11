import type { FolderID } from '~~/shared/types/data';

import { shallowRef } from 'vue';

const openedFolderIds = shallowRef<Set<FolderID>>(new Set());

function add(folderId: FolderID) {
  openedFolderIds.value = new Set([...openedFolderIds.value.values(), folderId]);
}

function remove(folderId: FolderID) {
  const _opened = new Set(openedFolderIds.value);

  _opened.delete(folderId);

  openedFolderIds.value = _opened;
}

function clear() {
  openedFolderIds.value = new Set();
}

export default function useOpenedFolders() {
  return {
    openedFolderIds,
    add,
    remove,
    clear,
  };
}

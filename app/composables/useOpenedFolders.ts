import type { FolderID } from '~~/shared/types';

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

export default function useOpenedFolders() {
  return {
    openedFolderIds,
    add,
    remove,
  };
}

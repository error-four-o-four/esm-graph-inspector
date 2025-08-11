<script setup lang="ts">
import type { FileTreeData, FolderData, FolderID } from '~~/shared/types/data.js';

import { useTemplateRef, watch } from 'vue';

import type { FolderInstance } from '~/types/components.js';

import useContainerDimensions from '~/composables/useContainerDimensions.js';
import useLayoutOffsets from '~/composables/useLayoutOffsets.js';
import useNodeOffsets from '~/composables/useNodeOffsets.js';
import useOpenedFolders from '~/composables/useOpenedFolders.js';

type Props = Pick<FileTreeData, 'files' | 'folders' | 'folderLinks' | 'levels'>;

const props = defineProps<Props>();

const folderRefs = useTemplateRef<FolderInstance[]>('folders');

defineExpose({ folderRefs });

const {
  width,
  height,
  updateContainerDimensions,
} = useContainerDimensions();

const {
  offsetYInitial,
  enqueueOffsetYUpdate,
  dequeueOffsetYUpdate,
} = useLayoutOffsets();

const { folderHeights } = useNodeOffsets();

const { openedFolderIds, clear } = useOpenedFolders();

function handleOpenedFoldersUpdate(
  next: typeof openedFolderIds.value,
  prev: typeof openedFolderIds.value = new Set<FolderID>(),
) {
  const others = Object.values(props.folders);

  // @todo guard case next.size to exit early

  // closed folders
  [...prev.difference(next)]
    .map(folderId => props.folders[folderId])
    .forEach(folder => updateFolderOffset(others, folder, true));

  // opened folders
  [...next.difference(prev)]
    .map(folderId => props.folders[folderId])
    .forEach(folder => updateFolderOffset(others, folder, false));

  dequeueOffsetYUpdate();
  updateContainerDimensions();
}

function updateFolderOffset(
  others: FolderData[],
  folder: FolderData,
  collapse: boolean,
) {
  const nextLevelSibling = others
    .filter(sibling => sibling.depth === folder.depth)
    .find(sibling => sibling.level === folder.level + 1);

  // it's a node at the bottom
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

// ####

onMounted(() => {
  // console.log('mounted LAYOUT');
  watch(openedFolderIds, handleOpenedFoldersUpdate);
});

// onUpdated(() => console.log('updated LAYOUT'));
onUnmounted(() => {
  // console.log('unmounted LAYOUT', folderRefs.value);
  clear();
});

// onUnmounted(() => {
//   // @todo
//   // unmountOffsets();
//   // console.clear();
//   console.log('unmounted LAYOUT', folderRefs.value);
// });
</script>

<template>
  <svg
    class="pointer-events-none absolute left-0 top-0 stroke-1 stroke-neutral-700 fill-none"
    :width="width"
    :height="height"
  >
    <TreeLink
      v-for="link of folderLinks"
      :id="link.id"
      :key="link.id"
      :initial="link.initial"
      :source="link.source"
      :target="link.target"
    />
  </svg>

  <TreeFolder
    v-for="folder of folders"
    :id="folder.id"
    ref="folders"
    :key="folder.id"
    :name="folder.name"
    :parent="folder.parent"
    :index="folder.index"
    :level="folder.level"
    :depth="folder.depth"
    :files="folder.fileIds.map(fileId => files[fileId])"
  />
</template>

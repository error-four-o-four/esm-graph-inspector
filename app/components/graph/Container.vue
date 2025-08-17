<script setup lang="ts">
import type { FileTreeData, FolderID } from '~~/shared/types/data.js';

import { useTemplateRef, watch } from 'vue';

import type { FolderInstance } from '~/types/components.js';

import { dimensions, initTreeDimensions, isInitialized, updateTreeDimensions } from '~/composables/useTreeDimensions.js';
import { addFolderIds, clearFolderIds } from '~/composables/useTreeFolders.js';
import { initTreeOffsets, updateToggledFolderOffsets } from '~/composables/useTreeOffsets.js';
import { graphData } from '~/state/data.js';

const props = defineProps<{
  tree: FileTreeData;
}>();

const folderRefsKey = 'folders';
const folderRefs = useTemplateRef<FolderInstance[]>(folderRefsKey);

// ###

onBeforeMount(() => {
  initTreeOffsets(props.tree);
  // console.log('before mounted CONTAINER');
});

onMounted(() => {
  if (!folderRefs.value) throw new Error('Gnaaa!');

  initTreeDimensions(folderRefs.value);
  updateTreeDimensions();
  // console.log('mounted CONTAINER');
});

onUpdated(() => {
  // console.log('updated CONTAINER');
});

onUnmounted(() => {
  clearFolderIds();
  // @todo on 'tree-change'
  // TypeError: can't access property "value", offsetsXBase[level] is undefined
  // resetTreeOffsets();
  isInitialized.value = false;
  // console.log('unmounted CONTAINER');
});

// ###

watch(
  graphData,
  (next) => {
    if (next) {
      /**
       * @note
       * graphData will be defined after offets are initiialized
       * executed when an update of the module graph was triggered
       * @todo doublecheck correct offsets when rerendered
       */
      const toggledIds = addFolderIds(...next.folderIds);

      if (toggledIds.length) {
        updateToggledFolderOffsets(false, toggledIds, props.tree, next);
        updateTreeDimensions();
      }
    }
  },
  {
    immediate: true,
  },
);

// ###

function handleToggledFolder(folderId: FolderID, value: boolean) {
  if (value) {
    addFolderIds(folderId);
  } else {
    deleteFolderIds(folderId);
  }
  updateToggledFolderOffsets(!value, [folderId], props.tree);
}

// ###
</script>

<template>
  <Draggable :width="dimensions.width" :height="dimensions.height">
    <svg
      class="pointer-events-none absolute left-0 top-0 stroke-1 stroke-neutral-700 fill-none"
      :width="dimensions.width"
      :height="dimensions.height"
    >
      <!-- @todo draw one line from top to bottom => performance -->
      <TreeLink
        v-for="link of tree.folderLinks"
        :id="link.id"
        :key="link.id"
        :initial="link.initial"
        :source="link.source"
        :target="link.target"
      />
    </svg>

    <TreeFolder
      v-for="folder of tree.folders"
      :id="folder.id"
      :ref="folderRefsKey"
      :key="folder.id"
      :name="folder.name"
      :parent="folder.parent"
      :index="folder.index"
      :level="folder.level"
      :depth="folder.depth"
      :files="folder.fileIds.map(fileId => tree.files[fileId])"
      @toggle="handleToggledFolder"
    />
    <Transition name="graph">
      <svg
        v-if="isInitialized && graphData"
        class="pointer-events-none absolute left-0 top-0 stroke-2"
        :width="dimensions.width"
        :height="dimensions.height"
      >
        <!-- @todo refactor -->
        <GraphLink
          v-for="link of graphData.links"
          :id="link.id"
          :key="link.id"
          :bundle="link.bundle"
          :levels="graphData.levels"
          :direction="link.direction"
          :folder-ids="link.folderIds"
          :height="link.height"
          :source="link.source"
          :target="link.target"
        />
      </svg>
    </Transition>
  </Draggable>
</template>

<style>
.graph-enter-active,
.graph-leave-active {
  transition: opacity 300ms ease;
}
.graph-enter-from,
.graph-leave-to {
  opacity: 0;
}
</style>

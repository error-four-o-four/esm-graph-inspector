<script setup lang="ts">
import type { FileTreeData } from '~~/shared/types/data.js';

import { useTemplateRef } from 'vue';

import type { FolderInstance } from '~/types/components.js';

import { dimensions, initTreeDimensions, isInitialized } from '~/composables/useTreeDimensions.js';
import { initTreeOffsets } from '~/composables/useTreeOffsets.js';
import { graphData } from '~/state/data.js';

const props = defineProps<{
  tree: FileTreeData;
}>();

const folderRefsKey = 'folders';
const folderRefs = useTemplateRef<FolderInstance[]>(folderRefsKey);

onBeforeMount(() => {
  initTreeOffsets(props.tree);
  // console.log('before mounted CONTAINER');
});

onMounted(() => {
  if (!folderRefs.value) throw new Error('Gnaaa!');
  initTreeDimensions(props.tree, folderRefs.value);
  // console.log('mounted CONTAINER');
});

onUpdated(() => {
  // console.log('updated CONTAINER');
});

onUnmounted(() => {
  isInitialized.value = false;
  // console.log('unmounted CONTAINER');
});
</script>

<template>
  <Draggable :width="dimensions.width" :height="dimensions.height">
    <svg
      class="pointer-events-none absolute left-0 top-0 stroke-1 stroke-neutral-700 fill-none"
      :width="dimensions.width"
      :height="dimensions.height"
    >
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
    />
    <Transition name="graph">
      <svg
        v-if="isInitialized && graphData"
        class="pointer-events-none absolute left-0 top-0 stroke-2"
        :width="dimensions.width"
        :height="dimensions.height"
      >
        <GraphLink
          v-for="link of graphData.links"
          :id="link.id"
          :key="link.id"
          :bundle="link.bundle"
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

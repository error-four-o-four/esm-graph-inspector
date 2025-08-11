<script setup lang="ts">
import type { FileTreeData } from '~~/shared/types/data.js';

import { ref } from 'vue';

import type { LayoutInstance } from '~/types/components.js';

import useContainerDimensions from '~/composables/useContainerDimensions.js';
import useLayoutOffsets from '~/composables/useLayoutOffsets.js';
import useNodeOffsets from '~/composables/useNodeOffsets.js';

const props = defineProps<{
  tree: FileTreeData;
}>();

const isInitiated = ref(false);

defineExpose({ isInitiated });

const { initContainerDimensions, width, height } = useContainerDimensions();
const { initLayoutOffsets, resetLayoutOffsets } = useLayoutOffsets();
const { initNodeOffsets } = useNodeOffsets();

const layoutRef = ref<LayoutInstance | null>(null);

onBeforeMount(() => {
  initLayoutOffsets(props.tree);
  // console.log('before mounted CONTAINER');
});

onMounted(() => {
  if (!layoutRef.value || !layoutRef.value.folderRefs) throw new Error('Gnaaa!');

  initNodeOffsets(layoutRef.value.folderRefs);
  initContainerDimensions(props.tree);

  isInitiated.value = true;
  // console.log('mounted CONTAINER');
});

onUpdated(() => {
  // console.log('updated CONTAINER');
});

onUnmounted(() => {
  resetLayoutOffsets();
  // console.log('unmounted CONTAINER');
});
</script>

<template>
  <Draggable :width="width" :height="height">
    <TreeLayout
      ref="layoutRef"
      :files="tree.files"
      :folders="tree.folders"
      :folder-links="tree.folderLinks"
      :levels="tree.levels"
    />
    <GraphCanvas
      v-if="isInitiated"
      :width="width"
      :height="height"
    />
  </Draggable>
</template>

<script lang="ts" setup>
import type { FileData, FolderData } from '~~/shared/types/data.js';

import { computed, ref } from 'vue';

import { folderHeights } from '~/composables/useTreeDimensions.js';
import { addFolderIds, deleteFolderIds, openedFolderIds } from '~/composables/useTreeFolders.js';
import { offsetX, offsetY } from '~/composables/useTreeOffsets.js';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from '~/lib/tree-offsets.js';
import { graphData } from '~/state/data.js';

type Props = Omit<FolderData, 'fileIds' | 'folderIds'> & {
  // opened: boolean;
  // active: boolean;
  files: FileData[];
};

const props = defineProps<Props>();

const left = computed(() => `${offsetX[props.depth].value}px`);
const top = computed(() => `${offsetY[props.id].value}px`);

const height = ref(`${DEFAULT_NODE_HEIGHT}px`);

const isOpened = computed(() => openedFolderIds.value.has(props.id));
const isActive = computed(() => graphData.value?.folderIds.includes(props.id) || false);
const isDisabled = props.files.length === 0;

defineExpose({
  isOpened,
  isActive,
  isDisabled,
});

function toggleOpenedState() {
  // if (props.active) return;
  if (isActive.value) return;

  // if (props.opened) {
  if (isOpened.value) {
    deleteFolderIds(props.id);
  } else {
    addFolderIds(props.id);
  }
}

async function updateHeight() {
  // if (props.opened) {
  if (isOpened.value) {
    // expand
    height.value = `${folderHeights[props.id]}px`;
  } else {
    // wait for transition end
    await new Promise(resolve => setTimeout(resolve, 250));
    // collapse
    height.value = `${DEFAULT_NODE_HEIGHT}px`;
  }
}

onMounted(() => updateHeight());
onUpdated(() => updateHeight());
</script>

<template>
  <div
    :id="id"
    class="absolute overflow-hidden"
    :style="{
      left,
      top,
      height,
    }"
  >
    <UButton
      type="button"
      color="neutral"
      variant="outline"
      class="pb-2"
      :class="{
        // 'bg-neutral-900': opened,
        'bg-neutral-900': isOpened,
        // 'hover:bg-neutral-900': active,
        'hover:bg-neutral-900': isActive,
      }"
      size="sm"
      :style="{
        width: `${DEFAULT_NODE_WIDTH}px`,
        height: `${DEFAULT_NODE_HEIGHT}px`,
      }"
      :disabled="isDisabled"
      @click="toggleOpenedState"
    >
      <Icon
        :name="isOpened ? 'tabler:folder-open' : 'tabler-folder'"
        size="1rem"
        class="inline-block mt-0.5"
      />{{ name }}
      <!-- :name="opened ? 'tabler:folder-open' : 'tabler-folder'" -->
    </UButton>
    <ul
      class="px-3 py-2"
      :style="{
        transition: 'opacity 300ms ease',
        // opacity: opened ? 1 : 0,
        opacity: isOpened ? 1 : 0,
      }"
    >
      <TreeFile v-for="file of files" :key="file.id" :specs="file" />
    </ul>
  </div>
</template>

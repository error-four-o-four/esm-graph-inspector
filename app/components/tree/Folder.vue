<script lang="ts" setup>
import type { FileData, FolderData } from '~~/shared/types/data.js';

import { computed, ref, watch } from 'vue';

import { DEFAULT_NODE_HEIGHT } from '~/composables/layout.js';
import useLayoutOffsets from '~/composables/useLayoutOffsets.js';
import useNodeOffsets from '~/composables/useNodeOffsets.js';
import useOpenedFolders from '~/composables/useOpenedFolders.js';
import { graphData } from '~/state/data.js';

type Props = Omit<FolderData, 'fileIds' | 'folderIds'> & {
  files: FileData[];
};

const props = defineProps<Props>();

const { offsetX, offsetY } = useLayoutOffsets();
const { folderHeights } = useNodeOffsets();

const left = computed(() => `${offsetX[props.depth].value}px`);
const top = computed(() => `${offsetY[props.id].value}px`);

const height = ref(`${DEFAULT_NODE_HEIGHT}px`);

const { openedFolderIds, add, remove } = useOpenedFolders();

const isActive = computed(() => graphData.value && graphData.value.folderIds.includes(props.id));
const isOpened = computed(() => openedFolderIds.value.has(props.id));
const isDisabled = props.files.length === 0;

function toggleOpenedState() {
  if (isActive.value) return;

  if (isOpened.value) {
    remove(props.id);
  } else {
    add(props.id);
  }
}

onMounted(() => {
  watch(
    isOpened,
    async (value) => {
      if (value) {
        // expand
        height.value = `${folderHeights[props.id]}px`;
      } else {
        // wait for transition end
        await new Promise(resolve => setTimeout(resolve, 250));
        // collapse
        height.value = `${DEFAULT_NODE_HEIGHT}px`;
      }
    },
  );

  watch(
    isActive,
    (value) => {
      // @todo
      if (value) add(props.id);
    },
    { flush: 'post' },
  );
});
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
        'bg-neutral-900': isOpened,
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
    </UButton>
    <ul
      class="px-3 py-2"
      :style="{
        transition: 'opacity 300ms ease',
        opacity: isOpened ? 1 : 0,
      }"
    >
      <TreeFile v-for="file of files" :key="file.id" :specs="file" />
    </ul>
  </div>
</template>

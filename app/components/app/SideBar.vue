<script setup lang="ts">
import type { LabeledTreeItem } from '~/composables/filetree.js';

import { fileTreeArray, selectedTreeItem } from '~/composables/filetree.js';

function onClick(data: string) {
  selectedTreeItem.value = data as unknown as LabeledTreeItem;
}
</script>

<template>
  <div class="flex flex-col overflow-hidden bg-gray-800/50 backdrop-blur rounded-md border border-neutral-800">
    <div>
      <h1 class="pt-2 pb-3 px-3 bg-neutral-800">
        <strong>ESM Graph Inspector</strong>
      </h1>
    </div>
    <div class="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-neutral-900">
      <UTree
        :items="fileTreeArray"
        :ui="{ linkLeadingIcon: 'size-24 mt-1' }"
        @update:model-value="onClick"
      />
    </div>
  </div>
</template>

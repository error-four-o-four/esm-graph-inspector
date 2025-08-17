<script setup lang="ts">
import type { FileData } from '~~/shared/types/data.js';
import type { PayloadRequest } from '~~/shared/types/payload.js';

import { extensions } from '~~/shared/data.js';
import { computed, nextTick } from 'vue';

import { requestPayload } from '~/composables/usePayload.js';
import { appStateData, graphData } from '~/state/data.js';
import { selectedFile, selectFile } from '~/state/selected.js';

const { specs } = defineProps<{
  specs: FileData;
}>();

const isDisabled = computed(() => !extensions.includes(specs.ext));

async function handleClick() {
  // @todo clearify & add documentation
  if (!graphData.value) {
    graphData.value = undefined;
    appStateData.value = {
      type: 'info',
      message: `Requesting ${specs.id}`,
    };
    await nextTick(); // @todo doublecheck neccessity
    requestPayload<PayloadRequest>({ type: 'graph', file: specs.id });
    return; // @todo select entry point by default
  }

  selectFile(specs);
}
</script>

<template>
  <li :id="specs.id" class="pb-1">
    <UButton
      type="button"
      color="neutral"
      variant="ghost"
      size="xs"
      class="pb-1.5"
      :class="{ 'text-neutral-500': isDisabled, 'bg-cyan-700': selectedFile?.id === specs.id }"
      :disabled="isDisabled"
      @click="handleClick"
    >
      {{ specs.name }}
    </UButton>
  </li>
</template>

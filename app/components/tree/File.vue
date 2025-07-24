<script setup lang="ts">
import type { FileData, PayloadRequest } from '~~/shared/types.js';

import { extensions } from '~~/shared/data.js';
import { computed } from 'vue';

import { usePayload } from '~/composables/usePayload.js';
import { graphData } from '~/state/data.js';
import { selectFile } from '~/state/selected.js';

const { specs } = defineProps<{
  specs: FileData;
}>();

const { requestPayload } = usePayload();

const isDisabled = computed(() => !extensions.includes(specs.ext));

function handleClick() {
  if (!graphData.value) {
    requestPayload<PayloadRequest>({ type: 'graph', file: specs.id });
  }

  selectFile(specs);
  // console.log(e);
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
      :class="{ 'text-neutral-500': isDisabled }"
      :disabled="isDisabled"
      @click="handleClick"
    >
      {{ specs.name }}
    </UButton>
  </li>
</template>

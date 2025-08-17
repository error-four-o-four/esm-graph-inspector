<script setup lang="ts">
import type { ToastType } from '~/composables/useToasts.js';

import { toasts } from '~/composables/useToasts.js';

const iconName: Record<ToastType, string> = {
  error: 'alert-hexagon',
  warning: 'alert-triangle',
  info: 'info-circle',
};
</script>

<template>
  <div class="fixed bottom-8 right-8 w-1/4 min-w-64">
    <TransitionGroup name="list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="w-full flex items-center gap-2 my-2 px-4 py-3 bg-neutral-700/25 backdrop-blur-xs border rounded"
        :class="`border-${toast.type}`"
      >
        <Icon
          size="24"
          :name="`tabler:${iconName[toast.type]}`"
          :class="`text-${toast.type}`"
        />
        <span>{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  transform: translateY(30px);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

/* ensure leaving items are taken out of layout flow so that moving
animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>

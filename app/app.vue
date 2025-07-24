<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';

import { usePayload } from '~/composables/usePayload.js';
import { addToast } from '~/composables/useToast.js';
import { errorData, filetreeData, graphData } from '~/state/data.js';

import type Container from './components/graph/Container.vue';

const { requestPayload, status } = usePayload();

const containerRef = ref<InstanceType<typeof Container> | null>();
const isReady = computed(() => filetreeData.value && containerRef.value && containerRef.value.isInitiated);

watchEffect(async () => {
  if (status.value !== 'OPEN') return;

  if (errorData.value) {
    const { type, message, error } = errorData.value;
    error && console.warn(error);
    addToast(type, message);
    return;
  }

  if (!filetreeData.value) {
    requestPayload({ type: 'tree' });
    await nextTick();
  }

  if (filetreeData.value && !graphData.value) {
    requestPayload({ type: 'graph' });
    await nextTick();
  }
});

// onMounted(() => console.log('mounted APP'));
// onUpdated(() => console.log('updated APP'));
// onUnmounted(() => console.log('unmounted APP'));

// @todo scroll entry into view
// @todo expand/collapse all btns
// @todo - precompute bundles per level and adjust horizontal spacing/offset of a folder
</script>

<template>
  <UApp>
    <main class="relative">
      <GraphContainer
        v-if="filetreeData"
        ref="containerRef"
        :tree="filetreeData"
      />
      <Transition name="overlay">
        <div
          v-if="!isReady"
          class="fixed top-0 left-0 flex items-center justify-center w-screen h-screen backdrop-blur-xs"
        >
          <div v-if="errorData && errorData.type === 'error'">
            Oh no ... Something went wrong<br>
            {{ errorData.message }}
          </div>
          <div v-else>
            Loading ...
          </div>
        </div>
      </Transition>
    </main>
    <AppToast />
    <AppSideBar />
  </UApp>
</template>

<style>
.overlay-leave-active {
  transition: opacity 300ms ease;
  transition-delay: 200ms;
}
.overlay-leave-to {
  opacity: 0;
}
</style>

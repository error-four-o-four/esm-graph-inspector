<script setup lang="ts">
import { computed, watch, watchEffect } from 'vue';

import { requestPayload, socketStatus } from '~/composables/usePayload.js';
import { isInitialized } from '~/composables/useTreeDimensions.js';
// import { addToast } from '~/composables/useToasts.js';
import { errorData, graphData, treeData } from '~/state/data.js';

const isReady = computed(() => treeData.value && isInitialized.value);

watchEffect(async () => {
  // console.log(status.value);

  if (socketStatus.value !== 'OPEN') return;

  if (errorData.value) {
    // @todo
    // const { type, message } = errorData.value;
    // addToast(type, message);

    // if (payload.value.type === 'error') {
    //   const code = payload.value.message ? 4000 : 1011;
    //   const message = payload.value.message || 'An unexpected error occured!';
    //   ws.close(code, message);
    // }
    return;
  }

  if (!treeData.value) {
    requestPayload({ type: 'tree' });
    await nextTick();
  }

  if (treeData.value && !graphData.value) {
    requestPayload({ type: 'graph' });
    await nextTick();
  }
});

onMounted(() => {
  const handler = watch(
    () => [isReady.value, graphData.value],
    () => {
      if (!isReady.value || !graphData.value) return;

      // @todo calculate min max graph svg and center/zoom

      const elt = document.getElementById(graphData.value.entry);
      elt && elt.scrollIntoView({ behavior: 'smooth' });

      handler.stop();
    },
  );
});

// onMounted(() => console.log('mounted APP'));
// onUpdated(() => console.log('updated APP'));
// onUnmounted(() => console.log('unmounted APP'));

// @todo expand/collapse all btns
// @todo - precompute bundles per level and adjust horizontal spacing/offset of a folder
</script>

<template>
  <UApp>
    <main class="relative">
      <GraphContainer
        v-if="treeData"
        :tree="treeData"
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
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 300ms ease;
}
.overlay-leave-active {
  transition-delay: 200ms;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { onMounted, shallowRef, useTemplateRef } from 'vue';

const { width, height } = defineProps<{
  width: number;
  height: number;
}>();

const container = useTemplateRef<HTMLDivElement>('container');

const isGrabbing = shallowRef(false);

function handleDrag() {
  let x = 0;
  let y = 0;

  useEventListener(container, 'mousedown', (e) => {
    if (!container.value) return;

    isGrabbing.value = true;
    x = container.value.scrollLeft + e.pageX;
    y = container.value.scrollTop + e.pageY;
  });

  useEventListener(container, 'mousemove', (e) => {
    if (!container.value || !isGrabbing.value) return;

    e.preventDefault();
    container.value.scrollLeft = x - e.pageX;

    if (container.value.scrollLeft <= 0) {
      x = e.pageX;
    }

    if (container.value.scrollLeft >= container.value.scrollWidth - container.value.offsetWidth) {
      x = container.value.scrollLeft + e.pageX;
    }

    container.value.scrollTop = y - e.pageY;

    if (container.value.scrollTop <= 0) {
      y = e.pageY;
    }

    if (container.value.scrollTop >= container.value.scrollHeight - container.value.offsetHeight) {
      y = container.value.scrollTop + e.pageY;
    }
  });

  useEventListener(container, 'mouseleave', () => isGrabbing.value = false);
  useEventListener(container, 'mouseup', () => isGrabbing.value = false);
}

onMounted(() => {
  handleDrag();
});
</script>

<template>
  <div
    ref="container"
    class="
    w-screen h-screen relative select-none
    scrollbar-thin overflow-auto"
  >
    <div :style="{ minWidth: `${width}px`, minHeight: `${height}px` }">
      <slot />
    </div>
  </div>
</template>

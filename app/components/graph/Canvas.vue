<script setup lang="ts">
import { graphLinkData } from '~/state/data.js';

defineProps<{
  width: number;
  height: number;
}>();
</script>

<template>
  <svg
    class="pointer-events-none absolute left-0 top-0 stroke-2"
    :width="width"
    :height="height"
  >
    <GraphLink
      v-for="link of graphLinkData"
      :id="link.id"
      :key="link.id"
      :bundle="link.bundle"
      :source="link.source"
      :target="link.target"
    />
  </svg>
</template>

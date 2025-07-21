<script setup lang="ts">
import { exports, imports, selectedSpecs } from '~/state/selected.js';

const crumbs = computed(() => {
  if (!selectedSpecs.value) return '';

  return selectedSpecs.value.parentPath.split('/').join(' / ');
});
</script>

<template>
  <div class="fixed top-0 right-8 py-4 w-1/4 min-w-64 h-screen">
    <div
      class="
      flex flex-col h-full
      bg-gray-800/50 backdrop-blur rounded-md border border-neutral-800"
    >
      <h1 class="pt-2 pb-3 px-3 bg-neutral-800">
        <strong>ESM Graph Inspector</strong>
      </h1>
      <div class="px-3 py-2">
        <div v-if="selectedSpecs === undefined">
          Please select a file ...
        </div>
        <div v-else class="flex flex-col gap-1.5">
          <div>{{ crumbs }}<strong>{{ selectedSpecs.name }}</strong></div>
          <div v-if="imports">
            <strong>Imports</strong>
            <ul>
              <li v-for="i of imports" :key="i">
                {{ i }}
              </li>
            </ul>
          </div>
          <div v-if="exports">
            <strong>Exports</strong>
            <ul>
              <li v-for="e of exports" :key="e">
                {{ e }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

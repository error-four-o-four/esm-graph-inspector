<script setup lang="ts">
import { payload } from '~/composables/socket.js';
</script>

<template>
  <UApp>
    <main>
      <div v-if="!payload">
        Loading ...
      </div>
      <div v-else>
        <GraphCanvas :payload="payload" />
      </div>
    </main>
  </UApp>
</template>

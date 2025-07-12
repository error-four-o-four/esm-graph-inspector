<script setup lang="ts">
import { selectedTreeItem } from '~/composables/filetree.js';

const items = computed((): string => {
	if (!selectedTreeItem.value) return 'Select a file ...'
	
	const seperator = ' / '
	let result = selectedTreeItem.value.value.split('/').join(seperator);

	if (selectedTreeItem.value.type === 'dir') {
		result += seperator
	}

	return result
});

</script>

<template>
	<div class="
		w-full left-72 px-3 py-2 ml-2 flex gap-2
		bg-gray-800/50 backdrop-blur rounded-md border border-neutral-800"
		>
		<span>{{ items }}</span>
		<span class="flex-1"></span>
		<span>{{ socketStatus }}</span> 
	</div>
</template>
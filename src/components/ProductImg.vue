<template>
	<img :src="src" alt="" class="w-full h-full object-contain object-center" />
</template>

<script setup lang="ts">
defineProps<{
	src: string,
}>()
</script>

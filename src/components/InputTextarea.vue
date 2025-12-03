<template>
	<UTextarea v-model="v" autoresize placeholder="">
		<label class="pointer-events-none absolute left-0 -top-4 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-4 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
			<span class="inline-flex px-1"><slot /></span>
		</label>
	</UTextarea>
</template>

<script setup lang="ts">

const v = defineModel<string | number>()
</script>

<style scoped>

</style>

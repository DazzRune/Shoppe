<template>
	<div class="flex flex-col items-center text-center">
		<h1>404 ERROR</h1>
		<p>This page not found; <br>back to home and start again</p>
		<UButton :to="{name: 'home'}" color="secondary" variant="outline">Homepage</UButton>
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>

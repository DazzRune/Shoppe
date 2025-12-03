<template>
	<p v-if="product.isSale">
		<span class="text-errors line-through mr-[1em]">$ {{ product.price }}</span>
		<span class="text-success">$ {{ (product.price - product.price * product.discountPercentage / 100).toFixed(2) }}</span>
	</p>
	<p v-else class="text-success">$ {{ product.price }}</p>
</template>

<script setup lang="ts">
import type { TProduct } from '../scripts/types';

const props = defineProps<{
	product: TProduct
}>()
</script>

<style scoped>

</style>

<template>
	<UBadge v-if="badge" :color="badgeColor" class="absolute top-2 right-2 rounded-[4px]">
		{{ badge }}
	</UBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TProduct } from '../scripts/types';

const props = defineProps<{
	product: TProduct
}>()

const badge = computed(() => {
	if (!props.product.stock) return "Sold out"
	if (props.product.isNew) return "New!"
	if (props.product.isSale) return `- %${props.product.discountPercentage}`

	return ""
})
const badgeColor = computed(() => {
	if (props.product.isNew) return "secondary"
	if (!props.product.stock) return "primary"

	return "success"
})
</script>

<style scoped>

</style>

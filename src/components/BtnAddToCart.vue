<template>
	<UButton @click.stop="isInCart ? onRemove() : onAdd()">{{ isInCart ? 'Remove from Cart' : 'Add to Cart' }}</UButton>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TProduct } from '../scripts/types';
import { useStore } from "../store";

const props = withDefaults(defineProps<{
	product: TProduct
	amount?: number
}>(), {
	amount: 1
})

const store = useStore()

const isInCart = computed(() => store.isInCart(props.product.id))

function onAdd() {
	store.addToCart(props.product, props.amount)
	store.addAlert({
		description: `${props.product.title} added to cart`
	})
}
function onRemove() {
	store.removeFromCart(props.product.id)
	store.addAlert({
		description: `${props.product.title} removed from cart`
	})
}
</script>

<style scoped>

</style>

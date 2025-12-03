<template>
	<ul
		class="px-[8%] text-black bg-neutral [&>*]:flex [&>*]:justify-between [&>*]:py-[1em] [&>*]:border-b-[1px] [&>*]:last:border-none"
	>
		<li>
			<span>Product</span>
			<span>Total</span>
		</li>
		<li v-for="product in order.products">
			<span>{{ product.title }} (x{{ product.amount }})</span>
			<span>{{ product.price * product.amount }}</span>
		</li>
		<li>
			<span>Subtotal</span>
			<span>{{ order.subtotal }}</span>
		</li>
		<li>
			<span>Shipping</span>
			<span>{{ order.deliveryAddress.deliveryOptions }}</span>
		</li>
		<li>
			<b>Total (includes ship, discount etc.)</b>
			<b>{{ order.total.toFixed(2) }}</b>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { OrderSummary, PreviousOrder } from "../scripts/types"

const props = defineProps<{
	order: PreviousOrder | OrderSummary
}>()
</script>

<style scoped></style>

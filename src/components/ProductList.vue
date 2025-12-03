<template>
	<div :class="[{ flex: !isCart }, 'content-start flex-wrap gap-x-[5%]']">
		<ProductCard
			v-for="product in products"
			:key="product.id"
			:product="product"
			:is-cart="isCart"
			:class="[{'max-lg:nth-[n+3]:mt-[5%] lg:nth-[n+4]:mt-[5%] w-[47.5%] lg:w-[30%]': !isCart}]"
		/>
	</div>
</template>

<script setup lang="ts">
import type { TProduct } from "../scripts/types"

const props = withDefaults(
	defineProps<{
		products: TProduct[]
		isCart?: boolean
	}>(),
	{
		isCart: false,
	}
)
</script>

<style scoped></style>

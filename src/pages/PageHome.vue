<template>
	<div>
		<SkeletonProductCarousel v-if="getPopularProducts.isFetching.value" />
		<ProductCarousel v-else :products="getPopularProducts.data.value?.products || []" />

		<div class="flex justify-between items-center">
			<h2>Shop the latest</h2>
			<UButton :to="{ name: 'products' }" variant="ghost" class="text-accent capitalize">View All</UButton>
		</div>
		<SkeletonProductList v-if="getNewestProducts.isFetching.value" />
		<ProductList v-else :products="getNewestProducts.data.value?.products || []" />
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { productsTransformer, useApi } from "../scripts/api"

const { useDummy } = useApi()

const getPopularProducts = useDummy('products?sortBy=rating&order=desc&limit=6', {
	immediate: true,
})
	.get()
	.json()

// без сорт-ки в строке запроса, т.к. даты приходят одинаковые
const getNewestProducts = useDummy('products?limit=0', {
	immediate: true,
	afterFetch(ctx) {
		ctx.data.products =
			productsTransformer(ctx.data.products, {by: 'createdAt', type: 'desc'})
			.slice(0, 6)

		return ctx
	},
})
	.get()
	.json()
</script>

<style scoped>
@reference "../style.css";

</style>

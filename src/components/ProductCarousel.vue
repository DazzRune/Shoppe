<template>
	<div class="relative">
		<UCarousel v-slot="{ item }" :items="products" dots :autoplay="{ delay: 5000 }" :ui="{dots: 'bottom-[10%]',}">
			<div class="relative aspect-[2.5/1]">
				<ProductImg :src="item.thumbnail" class="absolute size-full" />
				<div class="absolute top-1/2 left-0 -translate-y-1/2 p-[5%]">
					<h2 class="my-0!">{{ item.title }}</h2>
					<ProductPrice :product="item" />
					<UButton label="View Product" :to="{name: 'product', params: {id: item.id}}" class="mt-[1em] capitalize" />
					<!-- для теста -->
					<!-- <p>rating: {{ item.rating }}</p> -->
				</div>
			</div>
		</UCarousel>
	</div>

</template>

<script setup lang="ts">
import { ref } from "vue"
import type { TProduct } from "../scripts/types";

const props = defineProps<{
	products: TProduct[]
}>()
</script>

<style scoped>
@reference "../style.css";
</style>

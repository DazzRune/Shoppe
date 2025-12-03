<template>
	<!--
	v-model - выбран пункт меню (здесь переход на стр. товара)
	trailing-icon="" - скрыть иконку открытия списка
	ignore-filter - отключить поиск по умолч. выборка приходит с сервера
	resetSearchTermOnBlur - очистить поиск при расфокусе
	labelKey - ! то же наименование указывать для группы, здесь title {type: 'label', title: 'Title'}
	vue ignore - ts ругается на проп labelKey="title", т.к. его тип undefined (в доке также) -->
	<!-- @vue-ignore -->
	<UInputMenu
		v-model="selectedProductId"
		v-model:search-term.trim="search"
		:items="menu"
		valueKey="id"
		labelKey="title"
		ignore-filter
		:resetSearchTermOnBlur="false"
		placeholder="Search products"
		:loading="getProducts.isFetching.value"
		:ui="{
			base: 'h-full',
			// content: 'max-md:w-[100vw] w-[40vw] max-md:max-h-[100vh] max-h-[50vh]',
			// itemLeadingAvatar: 'shrink',
			// itemLabel: 'w-[90%]',
		}"
	>
		<template #item-leading="{ item, index }: { item: MenuItem, index: number }">
			<div class="w-1/6"><ProductImg v-if="isProduct(item)" :src="item.thumbnail" /></div>
		</template>
		<template #content-bottom>
			<ul class="flex flex-wrap">
				<li v-for="category in categories" class="mx-[1em]">
					<ULink :to="{ name: 'products', query: { category } }">{{ category }}</ULink>
				</li>
			</ul>
		</template>
	</UInputMenu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { TProduct } from "../scripts/types"
import { refDebounced } from "@vueuse/core";
import { productsTransformer, useApi } from "../scripts/api"

const { useDummy } = useApi()

const router = useRouter()
const route = useRoute()

const search = ref('')
const searchDebounced = refDebounced(search, 500)
const selectedProductId = ref("")

const url = computed(() => {
	return `products/search?q=${searchDebounced.value}&limit=0`
})
const getProducts = useDummy(url, {
	refetch: true,
	beforeFetch(ctx) {
		if (!searchDebounced.value) ctx.cancel()
		return ctx
	},
	afterFetch(ctx) {
		ctx.data.products = productsTransformer(ctx.data.products)

		return ctx
	},
})
	.get()
	.json()

const products = computed(() => getProducts.data.value?.products || [])
const productsByCategories = ref(new Map())
const categories = computed(() => [...productsByCategories.value.keys()])

type Product = { id: number, title: string, thumbnail: string }
type MenuItem = { type: "label", title: string } | Product | { type: "separator" }
// дополнительно подгоняем под формат для передачи в <UInputMenu>
const menu = computed((): (MenuItem)[] => {
	return [...productsByCategories.value.entries()].reduce((products: (MenuItem)[], [k, v]) => {
		// title - здесь имя категории
		const to = v.map((p: Product) => ({ id: p.id, title: p.title ?? "", thumbnail: p.thumbnail ?? "" }))
		products.push({ type: "label", title: k }, ...to, { type: "separator" })
		return products
	}, [])
})

watch(selectedProductId, (id, oldValue) => {
	router.push(`/product/${id}`)
})

watch(products, (prods, oldValue) => {
	productsByCategories.value = new Map()
	prods.forEach((p: any) => {
		if (productsByCategories.value.has(p.category)) productsByCategories.value.get(p.category).push(p)
		else productsByCategories.value.set(p.category, [p])
	})
})

// type guard
function isProduct(value: MenuItem): value is Product {
	return value && "id" in value && "title" in value && "thumbnail" in value
}
</script>

<style scoped></style>

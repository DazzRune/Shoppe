<template>
	<div>
		<div class="flex justify-between items-center">
			<h1>Shop The Latest</h1>
			<UButton variant="ghost" class="text-accent capitalize" @click="isFilterShown = !isFilterShown">Filter</UButton>
		</div>

		<div class="md:flex gap-x-[5%]">
			<div v-if="isFilterShown" class="md:w-1/4">
				<div class="sticky top-20 [&>*]:py-4">
					<UInput placeholder="Search..." v-model.trim="search" :loading="getProducts.isFetching.value" :ui="{
						trailing: 'p-0 h-[40%] top-1/2 right-0 -translate-y-1/2'
					}">
						<template v-if="search?.length" #trailing>
							<BtnIconOnly
								color="neutral"
								variant="link"
								aria-label="Clear input"
								@click="search = ''"
							><IconCirclecross /></BtnIconOnly>
						</template>
					</UInput>
					<br />
					<USelect
						v-model="selectedCategory"
						:items="selectCategory"
						placeholder="Shop By"
					/>
					<br />
					<USelect v-model="selectedSortBy" :items="selectSortBy" placeholder="Sort By" />
					<br />

					<USlider v-model="sliderPrice" :min="0" :max="40000" tooltip />
					<p>{{ sliderPrice[0] }} - {{ sliderPrice[1] }} $</p>

					<USwitch v-model="switchOnSale" label="On Sale" class="mt-[1em]" />
					<USwitch v-model="switchInStock" label="In Stock" />

					<p class="mt-[1em]">Total {{ getProducts.data.value?.total }}</p>
					<p>Found {{ getProducts.data.value?.products.length }}</p>

					<UButton @click="reset">Reset</UButton>
				</div>
			</div>

			<div :class="{'md:w-3/4': isFilterShown}">
				<SkeletonProductList v-if="getProducts.isFetching.value" />
				<ProductList
					v-else
					:products="perPageList"
				/>

				<UAlert
					v-if="!perPageList.length"
					description="No matches found."
					orientation="horizontal"
					class="border-accent"
				></UAlert>

				<UPagination
					v-if="perPageList.length"
					v-model:page="page"
					:total="getProducts.data.value?.products.length"
					:items-per-page="perPage"
					:sibling-count="2"
					show-edges
					class="mt-3"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { refDebounced, useFetch, watchIgnorable } from "@vueuse/core"
import { computed, onMounted, ref, watch, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { productsTransformer, useApi } from "../scripts/api"
import { getRandomFromRange } from "../scripts/functions"
import type { TProduct } from "../scripts/types"
import IconCirclecross from "../assets/icons/circle-cross.svg";

const { useDummy } = useApi()

const router = useRouter()
const route = useRoute()

const isFilterShown = ref(true) // по умолч.
// const isFilterShown = ref(false) // для теста

const search = ref(route.query.search as string || "")
const searchDebounced = refDebounced(search, 500)

const selectCategory = computed(() => {
	return ["Shop By", ...(getCategories.data.value || "")]
})
const selectSortBy = ref([
	{
		// по умолч. сортировать на месте по убыванию даты
		label: "Sort By",
		value: "createdAt_desc",
	},
	{
		// сортировать на месте по убыванию даты
		label: "Newer",
		value: "createdAt_desc",
	},
	{
		// по возр. - сначала недорогие
		label: "Price (asc)",
		value: "price_asc",
	},
	{
		label: "Price (desc)",
		value: "price_desc",
	},
	{
		label: "Discount (asc)",
		value: "discountPercentage_asc",
	},
	{
		label: "Discount (desc)",
		value: "discountPercentage_desc",
	},
	/* для корректной сорт-ки по алфавиту сначала следует переводить строки в нижний регистр.
	т.к. в Unicode код символов в верхнем регистре меньше, чем в нижнем
	то, например, при сорт-ке ['iPhone', 'Oppo'] по возр-ю получим неверный порядок ['Oppo', 'iPhone']
	{
		label: "Title (asc)",
		value: "title_asc",
	},
	{
		label: "Title (desc)",
		value: "title_desc",
	}, */
])
const selectedCategory = ref(route.query.category as string || "Shop By")
// по умолч. по самым новым
const selectedSortBy = ref(route.query.sortBy as string || "createdAt_desc")

const sliderPrice = ref([0, 40000])
const sliderPriceDebounced = refDebounced(sliderPrice, 500)

// считается со скидкой, если скидка в моке > 10%
const switchOnSale = ref(false)
// stock после запроса обнуляется для случайных товаров
const switchInStock = ref(false)

const page = ref(1)
const perPage = ref(10)
const perPageList = computed(() => {
	return (
		getProducts.data.value?.products.filter(
			(p: TProduct, i: number) => i >= (page.value - 1) * perPage.value && i < page.value * perPage.value
		) || []
	)
})
const q = computed(() => searchDebounced.value.trim().split(" ").join("+"))
// LIMIT УСТАНАВЛИВАТЬ В 0 (по умолч. 30), ИНАЧЕ ПОИСК ПОЛУПУСТОЙ
// /search?q - ищет по полям title и description
const productsUrl = computed(() => `products/search?q=${q.value}&limit=0`)

//   data,
//   error,
//   abort,
//   statusCode,
//   isFetching,
//   isFinished,
//   canAbort,
//   execute,
const getCategories = useDummy("products/category-list")
	.get()
	.json()

const getProducts = useDummy(productsUrl, {
	afterFetch(ctx) {
		const sortParams = selectedSortBy.value.split("_") as [keyof TProduct, "asc" | "desc"]

		ctx.data.products = productsTransformer(ctx.data.products, { by: sortParams[0], type: sortParams[1] })

		ctx.data.products = ctx.data.products.filter((current: TProduct) => {
			const checkCategory =
				selectedCategory.value === "Shop By"
					? true
					: current.category === selectedCategory.value
			const checkPrice =
				current.price >= sliderPriceDebounced.value[0] &&
				current.price <= sliderPriceDebounced.value[1]
			const checkSale = switchOnSale.value ? current.isSale : true
			const checkStock = switchInStock.value ? current.stock > 0 : true

			return checkCategory && checkPrice && checkSale && checkStock
		})

		return ctx
	},
})
	.get()
	.json()

onMounted(async () => {
	await getCategories.execute()
	await getProducts.execute()
})

const { stop, ignoreUpdates } = watchIgnorable(page, (v) => {
	getProducts.execute()
})

watch(
	[
		searchDebounced,
		selectedCategory,
		selectedSortBy,
		sliderPriceDebounced,
		switchOnSale,
		switchInStock,
	],
	([search, category, sortBy, price, onSale, inStock]) => {
		router.replace({ query: { search, category, sortBy } })
		ignoreUpdates(() => {
			page.value = 1
		})
		getProducts.execute()
	}
)
// если выбираем категорию из выпадающих результатов поиска в хедере
watch(() => route.query.category as string, (category, oldValue) => {
	selectedCategory.value = category
})

function reset() {
	search.value = ''
	selectedCategory.value = 'Shop By'
	selectedSortBy.value = 'createdAt_desc'
	sliderPrice.value = [0, 40000]
	switchOnSale.value = false
	switchInStock.value = false
}
</script>

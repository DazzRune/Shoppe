<template>
	<!-- заглушка на время запроса -->
	<div v-if="getCategories.isFetching.value" class="masonry">
		<USkeleton v-for="item in 6" class="masonry__item group" />
	</div>

	<div v-else>
		<div
			v-for="(group, i) in Math.ceil(categories.length / groupLength)"
			:key="group"
			class="masonry"
		>
			<ULink
				v-for="(item, j) in categories.slice(i * groupLength, (i + 1) * groupLength)"
				:key="item.slug"
				:to="{ name: 'products', query: { category: item.slug } }"
				raw
				class="masonry__item group"
			>
				<ProductImg :src="bg(j)" class="absolute w-full object-cover transition-[scale] group-hover:scale-110" :alt="item.name" />
				<div class="absolute left-0 bottom-0 p-[1em] pr-[3em] rounded-tr-full bg-secondary/70 transition-[padding] group-hover:pt-[2em] group-hover:pr-[4em]">
					<p>{{ item.name }}</p>
					<p class="text-accent">View All</p>
				</div>
			</ULink>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useMediaQuery } from "@vueuse/core"
import { useApi } from "../scripts/api"
import categoryUrl_1 from "../assets/img/category_1.jpg"
import categoryUrl_2 from "../assets/img/category_2.jpg"

const { useDummy } = useApi()

const getCategories = useDummy("products/categories")
	.get()
	.json()

const isMD = useMediaQuery("(max-width: 768px)")

const categories = ref<{
	name: string
	slug: string
	url: string
}[]>([]) // 10 -> 0, 1 ... 9
const groupLength = computed(() => (isMD.value ? 4 : 6)) // кол-во эл-тов в паттерне из 6 (из 4 в адаптиве)

onMounted(async () => {
	await getCategories.execute()
	if (getCategories.error.value) {
		console.log('Get categories failed', getCategories.error.value);
		return
	}

	categories.value = getCategories.data.value
})
// чередование двух фоновых изображений для наглядности, т.к. dummyJSON не предоставляет
function bg(index: number): string {
	const period = isMD.value ? 3 : 2 // каждое третье/второе изображение в зависимости от разрешения
	return index % period == 0 ? categoryUrl_1 : categoryUrl_2
}
</script>

<style scoped>
@reference "../style.css";

.masonry {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-auto-rows: 200px 80px 200px;
	gap: 10px;
	margin-top: 10px;
}

.masonry__item {
	position: relative;
	overflow: hidden;

	&:nth-child(1) {
		grid-column: span 1;
		grid-row: span 1;
	}
	&:nth-child(2) {
		grid-column: span 2;
		grid-row: span 2;
	}
	&:nth-child(3) {
		grid-column: span 1;
		grid-row: span 2;
	}
	&:nth-child(4) {
		grid-column: span 1;
		grid-row: span 2;
	}
	&:nth-child(5) {
		grid-column: span 1;
		grid-row: span 1;
	}
	&:nth-child(6) {
		grid-column: span 2;
		grid-row: span 1;
	}
}

@media (max-width: 768px) {
	.masonry {
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 100px 40px 100px;
	}
	.masonry__item {
		&:nth-child(1) {
			grid-column: span 1;
			grid-row: span 1;
		}
		&:nth-child(2) {
			grid-column: span 1;
			grid-row: span 2;
		}
		&:nth-child(3) {
			grid-column: span 1;
			grid-row: span 2;
		}
		&:nth-child(4) {
			grid-column: span 1;
			grid-row: span 1;
		}
	}
}
</style>

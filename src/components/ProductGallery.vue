<template>
	<div>
		<div class="product-gallery">
			<div class="thumbs">
				<ProductImg v-for="(url, index) in product.images" :src="url" class="aspect-square h-auto!" @click="select(index)" />
			</div>

			<UCarousel
				ref="gallery"
				v-slot="{ item }"
				:items="product.images"
				:watchDrag="isMD"
				class="slider"
				@select="onSelect"
			>
				<div
					class="h-full relative"
					@mouseover="onZoomIn"
					@mousemove="onZoomMove"
					@mouseout="onZoomOut"
				>
					<ProductImg :src="item" alt="" class="product-img" @click="open = true" />
					<ProductBadge :product="product" />
				</div>
			</UCarousel>
		</div>

		<UModal v-model:open="open" title="Product name" description="Product description" class="h-[70vh]">
			<template #content>
				<UCarousel
					v-slot="{ item }"
					:items="product.images"
					:start-index="activeIndex"
					arrows
					class="h-full"
					:ui="{
						prev: 'left-0! rounded-none',
						next: 'right-0! rounded-none'
					}"
				>
					<ProductImg :src="item" alt="" />
				</UCarousel>

				<BtnIconOnly icon="system-uicons:cross" class="absolute right-0 h-auto" @click="open = false" />
			</template>
		</UModal>
	</div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import { useMediaQuery } from "@vueuse/core"
import { getCSSProp } from "../scripts/functions"
import type { TProduct } from "../scripts/types";

const props = defineProps<{
	// images: string[],
	product: TProduct
}>()

const gallery = useTemplateRef("gallery")
const activeIndex = ref(0)

const isMD = useMediaQuery("(max-width: 768px)")

const open = ref(false)

function select(index: number) {
	activeIndex.value = index

	gallery.value?.emblaApi?.scrollTo(index)
}
function onSelect(index: number) {
	activeIndex.value = index
}

function onZoomIn(e: MouseEvent) {
	if (isMD.value) return

	if (e.currentTarget instanceof Element) {
		const currentRect = e.currentTarget.getBoundingClientRect()
		const img = e.currentTarget.querySelector("img")

		const offsetPercX = (e.clientX - currentRect.x) / currentRect.width
		const offsetPercY = (e.clientY - currentRect.y) / currentRect.height

		if (img) {
			img.style.setProperty("--galleria-img-scale", `${2}`)

			const translateX = ((offsetPercX - 0.5) * img.getBoundingClientRect().width) / 2
			const translateY = ((offsetPercY - 0.5) * img.getBoundingClientRect().height) / 2

			img.style.setProperty("--galleria-img-translate-x", `${-translateX}px`)
			img.style.setProperty("--galleria-img-translate-y", `${-translateY}px`)
		}
	}
}
function onZoomMove(e: MouseEvent) {
	if (isMD.value) return

	if (e.currentTarget instanceof Element) {
		const img = e.currentTarget.querySelector("img")

		if (img) {
			const translateX = getCSSProp("--galleria-img-translate-x", img)
			const translateY = getCSSProp("--galleria-img-translate-y", img)

			img.style.setProperty("--galleria-img-translate-x", `${translateX - e.movementX}px`)
			img.style.setProperty("--galleria-img-translate-y", `${translateY - e.movementY}px`)
		}
	}
}
function onZoomOut(e: MouseEvent) {
	if (isMD.value) return

	if (e.currentTarget instanceof Element) {
		const img = e.currentTarget.querySelector("img")

		if (img) {
			img.style.setProperty("--galleria-img-translate-x", `0px`)
			img.style.setProperty("--galleria-img-translate-y", `0px`)
			img.style.setProperty("--galleria-img-scale", `${1}`)
		}
	}
}
</script>

<style scoped>
@reference "../style.css";

.product-gallery {
	@apply flex justify-between aspect-[1/0.8];
}

.thumbs {
	@apply [scrollbar-width:none] hidden md:flex flex-col gap-[5%] w-[20%] h-full overflow-y-scroll;
}

.slider {
	@apply w-full md:ml-[5%] md:w-[75%] h-full;
}

.product-img {
	--galleria-img-translate-x: 0px;
	--galleria-img-translate-y: 0px;
	--galleria-img-scale: 1;

	transform: translateX(var(--galleria-img-translate-x))
		translateY(var(--galleria-img-translate-y)) scale(var(--galleria-img-scale));
}
</style>

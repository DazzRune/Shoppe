<!-- <a> вместо <ULink> - нажатие вложенной кнопки внутри ссылки триггерило переход -->
<template>
	<a
		class="group block cursor-pointer"
		@click="onClick"
	>
		<UCard
			:class="{ flex: isCart }"
			:ui="{
				body: [isCart ? 'w-1/2' : 'aspect-square', 'relative overflow-hidden gradiented'],
				footer: [isCart ? 'w-1/2 px-[5%]!' : '', 'relative'],
			}"
		>
			<ProductImg :src="product.thumbnail" class="transition-[scale] group-hover:scale-110" />

			<ProductBadge :product="product" />

			<BtnAddToCart
				v-if="product.stock && !isCart"
				:product="product"
				class="absolute bottom-0 w-full transition-transform translate-y-full group-hover:translate-y-0"
			/>

			<template #footer>
				<p>{{ product.title }}</p>
				<ProductPrice :product="product" />

				<!-- для теста -->
				<!-- <p>category: {{ product.category }}</p> -->
				<!-- <p>createdAt: {{ new Date(product.createdAt) }}</p>
				<p>isNew: {{ product.isNew }}</p>
				<p>discount: -{{ product.discountPercentage }}%</p>
				<p>isSale: {{ product.isSale }}</p>
				<p>stock: {{ product.stock }}</p> -->
				<!-- <p>rating: {{ product.rating }}</p> -->

				<div v-if="isCart && productInCart" class="absolute bottom-0">
					<span>Amount:&nbsp;</span>
					<CartProductAmount v-model="productInCart.amount" class="ml-1" />
				</div>
				<!-- удалить из корзины -->
				<BtnIconOnly
					v-if="isCart"
					icon="gridicons:cross"
					class="absolute top-0 right-0 h-auto"
					title="Remove from cart"
					@click.stop="onRemove"
				/>
			</template>
		</UCard>
	</a>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import type { TProduct } from "../scripts/types"
import { useStore } from "../store"
import { useRoute, useRouter } from "vue-router"

// isCart - переместить описание вправо от изображения, по умолч. снизу
const props = withDefaults(
	defineProps<{
		product: TProduct
		isCart?: boolean
	}>(),
	{
		isCart: false, // вызван в компоненте Корзины?
	}
)

const router = useRouter()
const route = useRoute()
const store = useStore()

const productInCart = computed((): TProduct | undefined => {
	return store.getCartProduct(props.product.id)
})

function onClick() {
	router.push({ name: 'product', params: { id: props.product.id } })
	scrollTo({
		top: 0,
		left: 0,
		behavior: 'smooth'
	})
}
function onRemove() {
	store.removeFromCart(props.product.id)
}
</script>

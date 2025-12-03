<template>
	<UDrawer v-model:open="isShown" direction="right" :handle="false" :overlay="false" :description="`${store.cart?.length} items`" :ui="{
		content: 'max-md:w-full max-md:max-w-full w-1/3 z-50 cart-drawer', // главная обертка. cart-drawer - вспомогательный класс для обращения из body для скрытия главного скролла
		container: '',
		body: 'overflow-x-hidden',
		footer: 'sticky bottom-0'
	}">
		<BtnIconOnly><IconCart /></BtnIconOnly>

		<template #title>
			<div class="relative">
				<BtnIconOnly icon="weui:arrow-outlined" class="block md:hidden absolute left-0 rotate-180" @click="isShown = !isShown" />
				<h2 class="max-md:text-center">Shopping bag</h2>
			</div>
		</template>

		<template #body>
			<ProductList v-if="store.cart?.length" :products="store.cart" :is-cart="true" />
			<ProductImg v-else :src="emptyCartUrl" class="aspect-square h-auto! opacity-10 translate-x-full origin-bottom-left animate-[emptyCart_1s_ease-in-out_1s_forwards]" />
		</template>

		<template #footer>
			<div class="flex justify-between">
				<span>Subtotal({{ amountTotal }} items)</span>
				<span>{{ store.subtotal }}</span>
			</div>
			<UButton v-if="store.cart.length" :to="{ name: 'cart' }" @click="isShown = false">View Cart</UButton>
		</template>
	</UDrawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from "../store";
import emptyCartUrl from "../assets/img/empty_cart.webp"
import IconCart from "../assets/icons/cart.svg";

const store = useStore()

const isShown = ref(false)
// const isShown = ref(true) // для теста

const amountTotal = computed(() => {
	return store.cart?.reduce((total, product) => total + product.amount, 0) || 0
})
</script>

<style scoped>

</style>

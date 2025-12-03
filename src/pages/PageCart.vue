<template>
	<div class="md:flex [&>*]:md:w-1/2 md:gap-x-[5%]">
		<ProductList :products="store.cart" :is-cart="true" />
		<div>
			<CartTotals />
			<UButton :to="{name: 'checkout'}" class="w-full">PROCEED TO CHECKOUT</UButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useStore } from "../store";
import { onGetShippingTransformer, useApi } from "../scripts/api";
import { useRoute, useRouter, } from "vue-router";

const store = useStore()
const route = useRoute()
const router = useRouter()
const { useDummySensitive } = useApi()

onMounted(() => {
	if (!store.cart.length) router.push({name: 'emptycart'})
})

const getUser = useDummySensitive("auth/me", {immediate: true})
	.get()
	.json()

watch(() => getUser.data.value, (user) => {
	if (!user) return

	const shipping = onGetShippingTransformer(user)

	if (!store.shipping.country) {
		store.shipping.country = shipping.country
		store.shipping.city = shipping.city
	}
	if (!store.shipping.deliveryOptions) store.shipping.deliveryOptions = shipping.deliveryOptions
})
</script>

<style scoped>

</style>

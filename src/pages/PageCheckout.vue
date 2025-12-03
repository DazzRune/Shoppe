<template>
	<div>
		<h1>Checkout</h1>

		<div class="md:flex items-start [&>*]:md:w-1/2 md:gap-x-[5%]">
			<UForm :state="{}" @submit="onSubmit">
				<h2>Personal details</h2>
				<FormDetails v-model="details" type="checkout" is-checkout attach />

				<h2>Shipping Details</h2>
				<FormShipping v-model="store.shipping" type="checkout" attach />

				<UButton type="submit">Place order</UButton>
			</UForm>

			<div>
				<h2>Your Order</h2>
				<OrderSummary :order="orderSummary" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import {
	onGetAccountDetailsTransformer,
	onGetShippingTransformer,
	onPutOrderTransformer,
	orders,
	useApi,
} from "../scripts/api"
import type { TSchemaAccountDetails, TSchemaShipping } from "../scripts/types"
import type { FormSubmitEvent } from "@nuxt/ui"
import { useStore } from "../store"
import router from "../scripts/router"
import { countries, detailsDefaults } from "../scripts/constants"

const store = useStore()
const { useDummy, useDummySensitive } = useApi()

// поля должны быть пустыми, заполнены для простоты тестирования
const details = ref<TSchemaAccountDetails>({ ...detailsDefaults })

const orderSummary = computed(() => {
	return {
		products: store.cart,
		subtotal: store.subtotal,
		total: store.total,
		deliveryAddress: {
			deliveryOptions: store.shipping?.deliveryOptions || "standard",
		},
	}
})

const getUser = useDummySensitive("auth/me", {immediate: true})
	.get()
	.json()

watch(() => getUser.data.value, (user) => {
	if (!user) return

	details.value = onGetAccountDetailsTransformer(user)
	const shipping = onGetShippingTransformer(user)

	if (!store.shipping.country) {
		store.shipping.country = shipping.country
		store.shipping.city = shipping.city
	}
	if (!store.shipping.deliveryOptions) store.shipping.deliveryOptions = shipping.deliveryOptions

	store.shipping.companyName = shipping.companyName
	store.shipping.address = shipping.address
	store.shipping.zip = shipping.zip
})

onMounted(() => {
	if (!store.cart.length) router.push({name: 'emptycart'})
})

async function onSubmit(e: FormSubmitEvent<{}>) {
	// эндпоинта для заказов нет, поэтому запрос делается на заглушку, а данные эмулируются в интерсепторе afterFetch
	const putOrder = await useDummy("http/201", {
		immediate: true,
		afterFetch(ctx) {
			ctx.data = onPutOrderTransformer(
				details.value,
				store.shipping,
				store.cart,
				store.factor
			)

			return ctx
		},
	})
		.put()
		.json()

	if (putOrder.error.value) {
		store.addAlert({
			isSuccess: false,
			description: `"Failed to put order ${putOrder.error.value}`,
		})
		return
	}
	// store.cart = [] // todo - раскомм
	orders.push(putOrder.data.value)
	// query.from - страница заказа не требует авторизации, если заказ сформирован неавторизованным польз-лем
	router.push({ name: "orders", params: { id: putOrder.data.value.id.toString() }, query: { from: 'checkout' } })
}
</script>

<style scoped></style>

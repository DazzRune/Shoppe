<template>
	<div class="lg:flex [&>*]:lg:w-1/2">
		<div>
			<h1>Order details</h1>
			<OrderDetails v-if="order" :order="order" />
		</div>
		<div>
			<h1>Order summary</h1>
			<OrderSummary v-if="order" :order="order" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import OrderDetails from "../components/OrderDetails.vue"
import type { PreviousOrder } from "../scripts/types"
import { useRoute, useRouter } from "vue-router"
import { onGetOrderTransformer, orders, useApi } from "../scripts/api"

const router = useRouter()
const route = useRoute()

const { useDummy, useDummySensitive } = useApi()

const order = ref<PreviousOrder | undefined>()

const getUser = useDummySensitive("auth/me")
	.get()
	.json()

watch(
	() => route.params.id,
	async (id) => {
		// query.from - страница заказа не требует авторизации, если заказ сформирован неавторизованным польз-лем
		if (route.query.from !== 'checkout') await getUser.execute()

		const getOrder = await useDummy("http/200", {
			immediate: true,
			afterFetch(ctx) {
				const data = orders.find((order) => order.id === +id)
				ctx.data = onGetOrderTransformer(data)

				return ctx
			},
		})
			.get()
			.json()
		if (getOrder.error.value) {
			console.log("Failed to get order", getOrder.error.value)
			return
		}

		order.value = getOrder.data.value
	},
	{ immediate: true }
)
</script>

<style scoped></style>

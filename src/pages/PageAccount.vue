<template>
	<div>
		<h1 class="text-center">My Account</h1>
		<p>
			Hello {{ username }} (not {{ username }}?
			<ULink class="text-accent" @click="onLogout">Log out</ULink>
			)
		</p>
		<p>
			From your account dashboard you can view your recent orders, manage your shipping and
			billing addresses, and edit your password and account details.
		</p>

		<!-- <RouterView /> -->
		<UTabs :items="tabs" v-model="tab" variant="link" class="">
			<template #orders="{ item }">
				<AccountOrders :orders="orders" />
			</template>

			<template #shipping="{ item }">
				<p>The following addresses will be used on the checkout page by default.</p>
				<div class="md:[&>*]:w-1/2">
					<h2>Shipping Address</h2>
					<FormShipping v-model="shipping" @submit="onShippingSubmit" />
				</div>
			</template>

			<template #details="{ item }">
				<FormDetails v-model="details" @submit="onDetailsSubmit" />
			</template>
		</UTabs>
	</div>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui"
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
	COOKIE_REFRESH,
	onGetAccountDetailsTransformer,
	onGetOrdersTransformer,
	onGetShippingTransformer,
	onPatchAccountDetailsTransformer,
	onPatchShippingTransformer,
	useApi,
} from "../scripts/api"
import type {
	PreviousOrder,
	TSchemaAccountDetails,
	TSchemaPasswordChange,
	TSchemaShipping,
} from "../scripts/types"
import { useStore } from "../store"
import { detailsDefaults, shippingDefaults } from "../scripts/constants"

const store = useStore()

const { useDummy, useDummySensitive, onLogout } = useApi()

const router = useRouter()
const route = useRoute()

const tabs = [
	{
		label: "Orders",
		value: "orders",
		slot: "orders" as const,
	},
	{
		label: "Shipping",
		value: "shipping",
		slot: "shipping" as const,
	},
	{
		label: "Account details",
		value: "details",
		slot: "details" as const,
	},
] satisfies TabsItem[]

const tab = ref("orders") // по умолч
// const tab = ref("shipping") // для теста
// const tab = ref("details") // для теста

const username = ref("")
const orders = ref<PreviousOrder[]>([])

// не связан с store.shipping
const shipping = ref<TSchemaShipping>({ ...shippingDefaults })
const details = ref<TSchemaAccountDetails>({ ...detailsDefaults })

const getUser = useDummySensitive("auth/me")
	.get()
	.json()

const urlUser = computed(() => `users/${getUser.data.value?.id}`)

const shippingPatch = computed(() => {
	return onPatchShippingTransformer(shipping.value)
})
const patchShipping = useDummySensitive(urlUser)
	.patch(shippingPatch)
	.json()

// эндпоинта для заказов нет, поэтому запрос делается на заглушку, а ответ эмулируются в интерсепторе afterFetch
const getOrders = useDummy("http/200", {
	afterFetch(ctx) {
		ctx.data = onGetOrdersTransformer("id", "asc")
		return ctx
	},
})
	.get()
	.json()


watch(
	tab,
	async (tab) => {
		// router.push({
		// 	name: 'account',
		// 	query: { tab },
		// 	hash: "#control-tab", // предотвращает прокрутку стр в начало
		// })

		await getUser.execute()

		if (getUser.error.value) return
		username.value = getUser.data.value.username

		if (tab === "orders") {
			await getOrders.execute()
			if (getOrders.error.value) {
				store.addAlert({
					isSuccess: false,
					description: `Failed to get orders ${getOrders.error.value}`,
				})
				return
			}

			orders.value = getOrders.data.value
		} else if (tab === "shipping") {
			shipping.value = onGetShippingTransformer(getUser.data.value)
		} else if (tab === "details") {
			details.value = onGetAccountDetailsTransformer(getUser.data.value)
		}
	},
	{ immediate: true }
)

async function onDetailsSubmit(password: TSchemaPasswordChange['password']) {
	await getUser.execute()
	if (getUser.error.value) return

	const user = onPatchAccountDetailsTransformer({
		...details.value,
		password
	})

	const patchUser = await useDummySensitive(urlUser, {
		immediate: true
	})
		.patch(user)
		.json()

	if (!patchUser.data.value) {
		store.addAlert({
			isSuccess: false,
			description: `Form details patch error ${patchUser.data.value}`,
		})
		return
	}
	console.log("Form details patched", patchUser.data.value, patchUser.response.value)
	store.addAlert({ description: `Account details was updated!` })
}

async function onShippingSubmit() {
	await getUser.execute()
	if (getUser.error.value) return

	await patchShipping.execute()
	if (!patchShipping.data.value) {
		store.addAlert({
			isSuccess: false,
			description: `Form shipping patch error ${patchShipping.error.value}`,
		})
		return
	}
	console.log("Form shipping was patched", patchShipping.data.value, patchShipping.response.value)
	store.addAlert({ description: `Account shipping was updated!` })
}
</script>

<style scoped></style>

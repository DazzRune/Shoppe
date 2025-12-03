import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { useApi } from "./scripts/api"
import { useStorage } from "@vueuse/core"
import type { DeliveryOptions, TProduct, TSchemaShipping } from "./scripts/types"
import { countries, deliveries, shippingDefaults } from "./scripts/constants"
import { idGenerator } from "./scripts/functions"
import { useRoute, useRouter } from "vue-router"

export const useStore = defineStore("store", () => {
	const route = useRoute()
	const router = useRouter()
	const { useDummySensitive } = useApi()

	const accessToken = ref<string | null>(null)
	// refreshToken - проверяется из куки напрямую

	const cart = useStorage<TProduct[]>("shoppe-cart", [])

	const shipping = ref<TSchemaShipping>({...shippingDefaults})

	// коэф-т, влияющий на конечную стоимость. по формуле: фактор = страна * город * метод доставки
	const factor = computed(() => {
		let f = 1
		if (shipping.value.country) {
			const country = countries.find((c) => c.value === shipping.value.country)
			f *= country!.factor
			if (shipping.value.city)
				f *= country!.cities.find((c) => c.value === shipping.value.city)!.factor
		}
		if (shipping.value.deliveryOptions)
			f *= deliveries.find((d) => d.value === shipping.value.deliveryOptions)!.factor
		return f
	})

	// с учетом скидки
	const subtotal = computed(
		() =>
			parseFloat(
				cart.value
					.reduce((total, product) => total + (product.price - product.price * product.discountPercentage / 100) * product.amount, 0)
					.toFixed(2)
			)
	)

	// с учетом доставки
	const total = computed(() => parseFloat((subtotal.value * factor.value).toFixed(2)))

	const alerts = ref<{ id: string; isSuccess: boolean; description: string }[]>([])

	useDummySensitive("auth/me", {immediate:true}).get().json() // попытка авторизоваться при входе на сайт, сразу после инициализации хранилища

	function onAccessRemove() {
		accessToken.value = null
	}

	function onStorageRemove() {
		cart.value = []
	}

	function isInCart(id: number) {
		return cart.value.some((product) => product.id === id)
	}

	// вернет -1 при отсутствии
	function getCartProductIdx(id: number): number {
		return cart.value.findIndex((product) => product.id === id)
	}

	function getCartProduct(id: number): TProduct | undefined {
		return cart.value.find((product) => product.id === id)
	}

	// amount - на случай если юзер сначала изменит кол-во, затем добавит в корзину
	function addToCart(product: TProduct, amount: number) {
		if (!isInCart(product.id)) {
			cart.value.push(product)
			changeProductAmount(product.id, amount)
		}
	}

	function changeProductAmount(id: number, by: number) {
		const product = getCartProduct(id)
		if (product) {
			product.amount = by
		}
	}

	function removeFromCart(id: number) {
		cart.value = cart.value.filter((product) => product.id !== id)
		if (!cart.value.length && (route.name === 'cart' || route.name === 'checkout')) router.push({name: 'emptycart'})
	}

	function addAlert({
		isSuccess = true,
		description,
	}: {
		isSuccess?: boolean
		description: string
	}) {
		alerts.value.push({ id: idGenerator(), isSuccess, description })
	}

	function removeAlert(id: string) {
		alerts.value = alerts.value.filter((alert) => alert.id !== id)
	}

	return {
		accessToken,
		cart,
		subtotal,
		factor,
		total,
		shipping,
		alerts,
		onAccessRemove,
		onStorageRemove,
		isInCart,
		getCartProductIdx,
		getCartProduct,
		addToCart,
		changeProductAmount,
		removeFromCart,
		addAlert,
		removeAlert,
	}
})

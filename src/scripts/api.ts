import { createFetch } from "@vueuse/core"
import type {
	PreviousOrder,
	TProduct,
	TReview,
	TSchemaAccountDetails,
	TSchemaAccountDetailsAndPassword,
	TSchemaLogin,
	TSchemaPasswordChange,
	TSchemaRegister,
	TSchemaReview,
	TSchemaShipping,
} from "./types"
import { getRandomFromRange } from "./functions"
import { ref } from "vue"
import { useCookies } from "@vueuse/integrations/useCookies"
import { useStore } from "../store"
import { useRoute, useRouter } from "vue-router"
import { countries, shippingDefaults } from "./constants"

const URL_BASE = "https://dummyjson.com"
export const COOKIE_REFRESH = "refreshToken"
const COOKIE_EXPIRES_IN_MIN = 30
let isRefreshing = false
const refreshSubscribers: Array<() => void> = []
const refreshFailedSubscribers: Array<() => void> = []
// export const isRegistered = ref(false) // эмуляция зарегистрированного юзера

export function useApi() {
	const router = useRouter()
	const route = useRoute()
	const store = useStore()
	const {
		get: getRefreshCookie,
		set: setRefreshCookie,
		remove: removeRefreshCookie,
	} = useCookies([COOKIE_REFRESH])

	const useDummy = createFetch({
		baseUrl: URL_BASE,
		options: {
			immediate: false,
			beforeFetch(ctx) {
				// console.log(ctx);
			},
			onFetchError(ctx) {
				console.log('Dummy fetch error: ', ctx.data?.message);
				return ctx
			},
		},
		fetchOptions: {},
	})

	const useDummySensitive = createFetch({
		baseUrl: URL_BASE,
		options: {
			immediate: false,
			beforeFetch(ctx) {
				ctx.options.headers["Authorization"] = `Bearer ${store.accessToken}`
			},
			updateDataOnError: true,
			onFetchError({ error, data, response, context, execute }) {
				console.log("Sensitive error:", response?.status, data?.message)

				if (response?.status === 401) {
					if (!isRefreshing) {
						isRefreshing = true
						useDummy("auth/refresh", {immediate: true})
							.post({
								refreshToken: getRefreshCookie(COOKIE_REFRESH),
								expiresInMins: COOKIE_EXPIRES_IN_MIN
							})
							.json()
							.then(newTokens => {
								isRefreshing = false

								if (newTokens.data.value) {
									console.log("refresh token success:", newTokens.data.value)
									// сохраняем access token в переменной
									store.accessToken = newTokens.data.value.accessToken

									/* сохраняем refresh token в cookie
									path: '/' - доступен на любой странице
									maxAge: number - в секундах */
									setRefreshCookie(COOKIE_REFRESH, newTokens.data.value.refreshToken, {
										path: "/",
										maxAge: COOKIE_EXPIRES_IN_MIN * 60, // истекает через час, для теста
									})
									refreshSubscribers.forEach(callback => callback())
								} else {
									refreshFailedSubscribers.forEach(callback => callback())
									console.log("refresh token error", newTokens.error.value);
									if (route.meta.requiresAuth && route.name !== 'auth') router.push({ name: "auth" })
								}
								refreshSubscribers.length = 0
								refreshFailedSubscribers.length = 0
							})
					}

					return new Promise((resolve, reject) => {
						refreshSubscribers.push(() => {
							execute()
								.then(response => response.json())
								.then(data => {
									console.log('subscriber was resolved after refresh success', response.url, data);
									resolve({ data })
								})
						})
						refreshFailedSubscribers.push(() => {
							console.log('subscriber was rejected after failed refresh', response.url);
							resolve({ error: `redirected to auth after refresh fail : ${error}` })
						})
					})
				}

				// return { error, data, response }
				return { error, response }
			},
		},
		fetchOptions: {
			// credentials: 'include' // http-only cookie
		},
	})

	// ручная авторизация
	async function login(credentials: TSchemaLogin) {
		// ответ 200
		// ctx.url = 'https://dummyjson.com/http/500' - для подмены статуса
		const postLogin = useDummy("auth/login").post({ ...credentials, expiresInMins: COOKIE_EXPIRES_IN_MIN }).json()

		// входим
		await postLogin.execute()
		if (postLogin.error.value) {
			console.log("Login failed", postLogin.error.value)
			store.addAlert({isSuccess: false, description: `Login failed: ${postLogin.statusCode.value}`})
			return null
		}
		console.log("Login data", postLogin.data.value)

		// сохраняем access token в переменной
		store.accessToken = postLogin.data.value.accessToken

		// сохраняем refresh token в cookie
		// path: '/' - доступен на любой странице
		// maxAge: 5 - в секундах
		setRefreshCookie(COOKIE_REFRESH, postLogin.data.value.refreshToken, {
			path: "/",
			maxAge: COOKIE_EXPIRES_IN_MIN * 60, // истекает через час, для теста
		})

		return postLogin.data.value //-> {id, firstName ... accessToken, refreshToken}
	}

	async function register(credentials: TSchemaRegister) {
		// без проверки на дублирование юзеров

		// ответ 201 - created
		const postAdd = useDummy("user/add").post(credentials).json()

		// регистрируем
		await postAdd.execute()
		if (postAdd.error.value) {
			console.log("Register failed", postAdd.error.value)
			store.addAlert({isSuccess: false, description: `Login failed: ${postAdd.statusCode.value}`})
			return null
		}
		console.log("Register data", postAdd.data.value)

		const loginReq = await login(credentials)
		if (loginReq) return loginReq.data

		return null
	}

	function onCookieRemove() {
		// path: '/' - должен совпадать с методом set
		removeRefreshCookie(COOKIE_REFRESH, { path: '/' })
	}
	function onLogout() {
		store.onAccessRemove()
		onCookieRemove()
		store.onStorageRemove()
		store.shipping = { ...shippingDefaults }
		if (route.name !== 'auth')
			router.push({name: 'auth'})
	}

	return {
		useDummy,
		useDummySensitive,
		login,
		register,
		getRefreshCookie,
		setRefreshCookie,
		onCookieRemove,
		onLogout,
	}
}

export function productTransformer(product: any): TProduct {
	const store = useStore()
	/*
	даты товаров приходят одинаковые с dummyJSON, поэтому эмулируем случайную в поле createdAt в рамках последних 7 дней
	ms, с начала эпохи
	Date.parse("2025-05-23T08:56:21.618Z") - получить в ms
	new Date(ms) - получить в формате Thu Jan 01 1970 03:00:00 GMT+0300
	1 hour = 3 600 000
	1 day = 3 600 000 * 24
	1 week = 3 600 000 * 24 * 7 */
	const createdAt = getRandomFromRange(Date.now() - 3_600_000 * 24 * 7, Date.now())

	// продукт был добавлен 1 день назад? считаем новым
	const isNew = createdAt > Date.now() - 3_600_000 * 24 * 1

	return {
		id: +product.id,
		title: product.title,
		description: product.description,
		price: product.price,
		discountPercentage: product.discountPercentage,
		rating: product.rating,
		brand: product.brand,
		category: product.category,
		thumbnail: product.thumbnail,
		images: product.images,
		createdAt: createdAt,
		isNew: isNew,
		// шт, случайным образом обнуляем кол-во товара
		stock: !isNew && Math.random() < 0.3 ? 0 : product.stock,
		// скидка более 10% ? считаем распродажей
		isSale: product.discountPercentage > 10,

		amount: store.getCartProduct(product.id)?.amount || 1,

		reviews: product.reviews
	}
}
export function productsTransformer(
	products: any[],
	sort: { by: keyof TProduct, type: "asc" | "desc" } | null = null
) {
	const res = products.map((product) => {
		return productTransformer(product)
	})

	// по умолч. товары сортируются от самых новых (по убыванию даты)
	if (sort) res.sort((a, b) => {
		// return (sort.type === "asc" ? a[sort.by] - b[sort.by] : b[sort.by] - a[sort.by]) // неверно типизируется
		return sort.type === "asc"
			? a[sort.by] > b[sort.by] ? 1 : a[sort.by] < b[sort.by] ? -1 : 0
			: a[sort.by] < b[sort.by] ? 1 : a[sort.by] > b[sort.by] ? -1 : 0
	})

	return res
}

export function onGetShippingTransformer(data: any): TSchemaShipping {
	// dummyJSON возвращает одинаковые страны, поэтому эмулируем самостоятельно (для примера страна Germany, г. Hamburg)
	const country = countries[1]
	const city = country.cities[1]

	return {
		companyName: data?.company?.name ?? "",
		country: country.value,
		address: data?.address?.address ?? "",
		zip: data?.address?.postalCode ?? "",
		city: city.value,
		deliveryOptions: "standard",
	}
}
export function onPatchShippingTransformer(data: TSchemaShipping) {
	return {
		company: {
			name: data.companyName ?? "",
		},
		address: {
			address: data.address ?? "",
			city: data.city ?? "",
			country: data.country ?? "",
			postalCode: data.zip ?? "",
		},
		deliveryOptions: data.deliveryOptions ?? "standard",
	}
}

export function onGetAccountDetailsTransformer(data: any): TSchemaAccountDetails {
	return {
		firstName: data?.firstName ?? "",
		lastName: data?.lastName ?? "",
		email: data?.email ?? "",
		phone: data?.phone ?? "",
		cardNumber: data?.bank?.cardNumber ?? "",
	}
}

// Omit в возвращаемом типе почему то не хочет принимать сокращенное имя Т
export function onPatchAccountDetailsTransformer<T extends TSchemaAccountDetailsAndPassword>(
	data: T
): Omit<TSchemaAccountDetailsAndPassword, "cardNumber"> & {bank: {cardNumber: string}} {
	return {
		firstName: data.firstName ?? "",
		lastName: data.lastName ?? "",
		email: data.email ?? "",
		phone: data.phone ?? "",
		bank: {
			cardNumber: data.cardNumber ?? "",
		},
		password: data.password ?? "",
	}
}

// эндпоинта для заказов нет, поэтому эмулируем 2 заказа
export const orders: PreviousOrder[] = [
	{
		id: 1,
		email: "daniel.cook@x.dummyjson.com",
		date: "2024-05-23T08:56:21.618Z",
		status: "delivered",
		deliveryAddress: {
			companyName: "",
			address: "626 Main Street",
			city: "Phoenix",
			country: "United States",
			zip: "29112",
			deliveryOptions: "standard",
		},
		paymentMethod: {
			cardType: "Visa",
			cardNumber: 7183482484317509,
		},
		contact: "+44 254-761-6843",
		products: [
			{
				id: 1,
				title: "Lira Earrings",
				price: 20,
				amount: 2
			},
			{
				id: 2,
				title: "Kaede Hair Pin",
				price: 20,
				amount: 1
			},
		],
		subtotal: 60,
		total: 99,
	},
	{
		id: 2,
		email: "daniel.cook@x.dummyjson.com",
		date: "2024-05-23T08:56:21.618Z",
		status: "delivered",
		deliveryAddress: {
			companyName: "",
			address: "626 Main Street",
			city: "Phoenix",
			country: "United States",
			zip: "29112",
			deliveryOptions: "standard",
		},
		paymentMethod: {
			cardType: "Visa",
			cardNumber: 7183482484317509,
		},
		contact: "+44 254-761-6843",
		products: [
			{
				id: 1,
				title: "Essence Mascara Lash Princess",
				price: 20,
				amount: 3,
			},
		],
		subtotal: 60,
		total: 99,
	},
]

export function onGetOrderTransformer(data: any): PreviousOrder {
	return {
		...data,
		date: new Date(data.date).toLocaleString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		})
	}
}
export function onGetOrdersTransformer(sortBy: keyof PreviousOrder, sortType: "asc" | "desc"): PreviousOrder[] {
	const res = orders.map((order) => onGetOrderTransformer(order))

	res.sort((a, b) => {
		// return sortType === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy] // неверно типизируется
		return sortType === "asc"
			? a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0
			: a[sortBy] < b[sortBy] ? 1 : a[sortBy] > b[sortBy] ? -1 : 0
	})

	return res
}

export function onPutOrderTransformer(
	details: TSchemaAccountDetails,
	shipping: TSchemaShipping,
	cart: TProduct[],
	factor: number
): PreviousOrder {
	const subtotal = cart.reduce(
		(subtotal, product) => subtotal + product.amount * product.price,
		0
	)
	const total = subtotal * factor

	return {
		id: orders.length + 1,
		email: details.email,
		date: new Date().toISOString(),
		status: "processing",
		deliveryAddress: { ...shipping },
		paymentMethod: {
			cardType: "Visa",
			cardNumber: Number(details.cardNumber),
		},
		contact: details.phone,
		products: cart.map(({ id, title, price, amount }) => ({
			id,
			title,
			price,
			amount
		})),
		subtotal,
		total,
	}
}

export function onPatchReviewsTransformer(
	review: TSchemaReview,
	userInfo: { firstName: string, lastName: string, email: string },
	prevReviews: TReview[]
): TReview[] {
	return [
		// не забываем существующие review
		...prevReviews,
		// + новый review
		{
			...review,
			date: new Date().toISOString(),
			reviewerName: `${userInfo.firstName} ${userInfo.lastName}`,
			reviewerEmail: userInfo.email,
		},
	]
}

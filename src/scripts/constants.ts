import type { NavigationMenuChildItem, NavigationMenuItem } from "@nuxt/ui"
import type { TSchemaAccountDetails, TSchemaShipping } from "./types"

// объект пункта меню может содержать также любые кастомные поля (касается и вложенных пунктов)
export const navMenu: NavigationMenuItem[] = [
	{
		label: "Shop",
		slot: "shop" as const,
		isExtended: true, // пункт содержит несколько колонок-разделов
		children: [
			{
				label: "PRODUCTS",
				children: [
					{
						label: "Categories",
						to: {name: "categories"},
					},
					{
						label: "Search & Filter",
						to: {name: "products"},
					},
				],
			},
			{
				label: "ORDER",
				children: [
					{
						label: "Cart",
						to: {name: "cart"},
					},
					{
						label: "Checkout",
						to: {name: "checkout"},
					},
				],
			},
			{
				label: "EMPTY SECTION",
			},
		],
	},
	{
		label: "Blog",
		slot: "blog" as const,
		isExtended: false,
		children: [
			{
				label: 'Maybe submenu',
				children: [
					{
						label: 'Maybe blog 1',
						to: '/',
					},
					{
						label: 'Maybe blog 2 (404)',
						to: "/nowhere",
					}
				],
			},
			{
				label: 'Maybe link',
				to: '/',
			}
		],
	},
	// пункт-ссылка
	{
		label: "Our Story",
		slot: "about" as const,
		isExtended: false,
		to: "/",
	},
]

export const countries = [
	{
		label: "United States",
		value: "United States",
		factor: 1.2,
		cities: [
			{
				label: "Washington",
				value: "Washington",
				factor: 1.2,
			},
			{
				label: "New-York",
				value: "New-York",
				factor: 1.3,
			},
		]
	},
	{
		label: "Germany",
		value: "Germany",
		factor: 1.5,
		cities: [
			{
				label: "Berlin",
				value: "Berlin",
				factor: 1.2,
			},
			{
				label: "Hamburg",
				value: "Hamburg",
				factor: 1.3,
			},
		]
	},
]

export const deliveries = [
	{
		label: "standard",
		value: "standard",
		factor: 1.5,
	},
	{
		label: "expedited",
		value: "expedited",
		factor: 2,
	},
	{
		label: "international",
		value: "international",
		factor: 2.5,
	},
]

export const shippingDefaults: TSchemaShipping = {
	companyName: "",
	country: "",
	address: "a",
	zip: "99999",
	city: "",
	deliveryOptions: "standard"
}
export const detailsDefaults: TSchemaAccountDetails = {
	firstName: "a",
	lastName: "a",
	email: "a@m.ru",
	phone: "+99 999-999-9999",
	cardNumber: "9999999999999999",
}

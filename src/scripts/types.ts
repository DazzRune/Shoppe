import * as v from "valibot"

export interface TProduct {
	id: number
	title: string
	description: string
	category: string
	price: number
	discountPercentage: number
	rating: number
	brand: string
	stock: number
	createdAt: number
	isNew: boolean
	isSale: boolean
	thumbnail: string
	images: string[]
	amount: number
	reviews: TSchemaReview[]
}
// price - приходит рассчитанный по кол-ву опр. товара
export type TProductShort = Pick<TProduct, "id" | "title" | "price" | "amount">

export type DeliveryOptions = "standard" | "expedited" | "international"
export interface PaymentMethod {
	cardType: string // 'Visa', 'MasterCard' ...
	cardNumber: number // 7183482484317509
}

// billing - данные привязанные к карте
// shipping - данные доставки
export interface PreviousOrder {
	id: number
	email: string
	date: string
	status: "processing" | "delivered"
	deliveryAddress: TSchemaShipping
	paymentMethod: PaymentMethod
	contact: string // phone
	products: TProductShort[]
	subtotal: number // стоимость без скидки и мод-ров
	total: number // стоимость в сумме
}

export interface OrderSummary {
	products: TProduct[]
	subtotal: number
	total: number
	deliveryAddress: {
		deliveryOptions: DeliveryOptions
	}
}

const schemaPassword = v.pipe(
	v.string(),
	v.minLength(1, "Your password must contain a minimum of 1 characters."), // 1 для теста, заменить на 6
	v.maxLength(20, "Your password must contain a maximum of 20 characters."),
	v.regex(/[a-z]/, "Your password must contain a lowercase letter."),

	// v.regex(/[A-Z]/, "Your password must contain a uppercase letter."),
	// v.regex(/[0-9]/, "Your password must contain a number."),
	v.regex(/^\S*$/, "Your password must not contain spaces.")
)
// dummyJSON поддерживет вход только через username + password
const schemaAuth = {
	username: v.pipe(
		v.string(),
		v.minLength(1, "Your username must contain a minimum of 1 characters."), // 1 для теста, заменить на 2
		v.regex(/^\S*$/, "Your username must not contain spaces.")
	),
	password: schemaPassword,
}
export const schemaLogin = v.object(schemaAuth)
export const schemaRegister = v.pipe(
	v.object({
		email: v.pipe(v.string(), v.email()),
		...schemaAuth,
		passwordConfirm: v.string(),
	}),
	v.forward(
		v.partialCheck(
			[["password"], ["passwordConfirm"]],
			(input) => input.password === input.passwordConfirm,
			"New password and confirm password do not match."
		),
		["passwordConfirm"]
	)
)

export const schemaShipping = v.object({
	companyName: v.string(),
	country: v.pipe(v.string(), v.nonEmpty("Please select country")),
	address: v.pipe(v.string(), v.nonEmpty("Please enter address")), // street
	zip: v.pipe(v.string(), v.regex(/^[0-9]{5}$/, "Code must contain 5 digits")),
	city: v.pipe(v.string(), v.nonEmpty("Please select city")),
	deliveryOptions: v.union([
		v.literal("standard"),
		v.literal("expedited"),
		v.literal("international"),
	]),
})
export const schemaShippingBlank = v.object({
	companyName: v.string(),
	country: v.string("Please select country"),
	address: v.string(), // street
	zip: v.union([
		v.literal(""),
		v.pipe(v.string(), v.regex(/^[0-9]{5}$/, "Code must contain 5 digits")),
	]),
	city: v.string("Please select city"),
	deliveryOptions: v.union([
		v.literal("standard"),
		v.literal("expedited"),
		v.literal("international"),
	]),
})

const schemaFirstName = v.pipe(
	v.string(),
	v.nonEmpty("Please enter your first name."), // 1 для теста, заменить на 6
	v.regex(/^[a-zA-Z-]+$/, "Your name must contain only letters and hyphens.")
)
const schemaLastName = v.pipe(
	v.string(),
	v.nonEmpty("Please enter your last name."), // 1 для теста, заменить на 6
	v.regex(/^[a-zA-Z-]+$/, "Your name must contain only letters and hyphens.")
)
const schemaEmail = v.pipe(v.string(), v.email("Please enter correct email."))
const schemaPhone = v.pipe(
	v.string(),
	v.regex(
		/^\+\d{2}\s\d{3}-\d{3}-\d{4}$/,
		"Please enter a valid phone number in format +99 999-999-9999"
	)
)
const schemaCardNumber = v.pipe(
	v.string(),
	v.regex(/^\d{16}$/, "Please enter a valid card number in format 9999999999999999")
)
export const schemaAccountDetails = v.object({
	firstName: schemaFirstName,
	lastName: schemaLastName,
	email: schemaEmail,
	phone: schemaPhone, // +81 965-431-3020
	cardNumber: schemaCardNumber, // привязанная карта
})
// схема позволяет оставлять поля незаполненными, и валидировать при заполнении
export const schemaAccountDetailsBlank = v.object({
	firstName: v.union([v.literal(""), schemaFirstName]),
	lastName: v.union([v.literal(""), schemaLastName]),
	email: v.union([v.literal(""), schemaEmail]),
	// +81 965-431-3020
	phone: v.union([v.literal(""), schemaPhone]),
	// привязанная карта
	cardNumber: v.union([v.literal(""), schemaCardNumber]),
})

export const schemaPasswordChange = v.pipe(
	v.object({
		currentPassword: v.union([v.literal(""), schemaPassword]),
		password: v.union([v.literal(""), schemaPassword]),
		passwordConfirm: v.string(),
	}),
	v.forward(
		v.partialCheck(
			[["currentPassword"], ["password"]],
			(input) => {
				if (!input.currentPassword && !input.password) {
					return true
				}
				return input.currentPassword !== input.password
			},
			"New password must be different."
		),
		["password"]
	),
	v.forward(
		v.partialCheck(
			[["password"], ["passwordConfirm"]],
			(input) => {
				if (!input.password && !input.passwordConfirm) {
					return true
				}
				return input.password === input.passwordConfirm
			},
			"New password and confirm password do not match."
		),
		["password"]
	),
	v.forward(
		v.partialCheck(
			[["password"], ["passwordConfirm"]],
			(input) => {
				if (!input.password && !input.passwordConfirm) {
					return true
				}
				return input.password === input.passwordConfirm
			},
			"New password and confirm password do not match."
		),
		["passwordConfirm"]
	)
)
export const schemaReview = v.object({
	comment: v.pipe(
		v.string(),
		v.minLength(1, "Review must contain a minimum of 1 characters."),
		v.maxLength(100, "Review must contain a maximum of 100 characters.")
	),
	rating: v.pipe(v.number(), v.notValue(0, "Please rate product.")),
})

export const schemaSubscribe = v.object({
	email: schemaEmail,
})

export type TSchemaLogin = v.InferOutput<typeof schemaLogin>
export type TSchemaRegister = v.InferOutput<typeof schemaRegister>
export type TSchemaShipping = v.InferOutput<typeof schemaShipping>
export type TSchemaAccountDetails = v.InferOutput<typeof schemaAccountDetails>
export type TSchemaAccountDetailsAndPassword = TSchemaAccountDetails & { password: string }
export type TSchemaPasswordChange = v.InferOutput<typeof schemaPasswordChange>
export type TSchemaReview = v.InferOutput<typeof schemaReview>
export type TReview = TSchemaReview & {
	date: string
	reviewerName: string
	reviewerEmail: string
}
